const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const cors = require('cors');
const nodemailer = require('nodemailer');
const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const fs = require('fs'); // Requiere el módulo 'fs' 
const path = require('path');
const router = express.Router();
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static('plantillas'));
//carpeta para archivos estaticos 
app.use(express.static(path.join(__dirname, '../src/transferencias')));

// Configura el SDK de PayPal
const environment = new checkoutNodeJssdk.core.SandboxEnvironment(
  'AQbcgbH8me0hla1WArywcohQbw0KiUubR1OoEwTL9sB6iVJj4g5ukSw9miSmjMs-AukRTHLfbaxWgE11',
  'AQbcgbH8me0hla1WArywcohQbw0KiUubR1OoEwTL9sB6iVJj4g5ukSw9miSmjMs-AukRTHLfbaxWgE11'
);
const client = new checkoutNodeJssdk.core.PayPalHttpClient(environment);

// Ruta absoluta al archivo de credenciales
const serviceAccount = require('./credencialbase.json');

// Inicializa la aplicación de Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'hhttps://vertexcapital-5ee1a-default-rtdb.firebaseio.com/',
});

const db = admin.database();

// Ruta para realizar transferencias de dinero
app.post('/transfer', async (req, res) => {
  const {
    cuentaOrigen,
    cuentaDestino,
    monto,
    descripcion,
    saldoAnterior,
    saldoDestino, // Recibir saldoDestino
    fechaTransaccion
  } = req.body;

  try {
    const cuentasRef = db.ref('clientes');
    const cuentaOrigenSnapshot = await cuentasRef.orderByChild('numeroCuenta').equalTo(cuentaOrigen).once('value');
    const cuentaDestinoSnapshot = await cuentasRef.orderByChild('numeroCuenta').equalTo(cuentaDestino).once('value');

    if (!cuentaOrigenSnapshot.exists() || !cuentaDestinoSnapshot.exists()) {
      return res.status(404).json({ error: 'Cuenta origen o destino no encontrada' });
    }

    let cuentaOrigenData, cuentaDestinoData;
    let cuentaOrigenKey, cuentaDestinoKey;
    cuentaOrigenSnapshot.forEach(snapshot => {
      cuentaOrigenData = snapshot.val();
      cuentaOrigenKey = snapshot.key;
    });
    cuentaDestinoSnapshot.forEach(snapshot => {
      cuentaDestinoData = snapshot.val();
      cuentaDestinoKey = snapshot.key;
    });

    const montoNumerico = parseFloat(monto);

    if (cuentaOrigenData.saldo < montoNumerico) {
      return res.status(400).json({ error: 'Saldo insuficiente' });
    }

    // Realizar la transferencia
    const nuevoSaldoOrigen = cuentaOrigenData.saldo - montoNumerico;
    const nuevoSaldoDestino = cuentaDestinoData.saldo + montoNumerico;

    // Actualizar saldos en la colección 'clientes'
    const updates = {};
    updates[`clientes/${cuentaOrigenKey}/saldo`] = nuevoSaldoOrigen;
    updates[`clientes/${cuentaDestinoKey}/saldo`] = nuevoSaldoDestino;
    await db.ref().update(updates);

    // Registrar la transacción en la colección 'transacciones'
    const newTransactionRef = db.ref('transacciones').push();
    await newTransactionRef.set({
      cuentaOrigen,
      cuentaDestino,
      monto: montoNumerico,
      descripcion,
      fecha: fechaTransaccion,
      saldoAnterior,
      saldoActual: nuevoSaldoOrigen,
      saldoDestino: nuevoSaldoDestino // Incluir saldoDestino en la transacción
    });

    const asunto = 'Confirmación de Transferencia';
    const cuerpoHtml = procesarPlantilla('./plantillas/correo_confirmaciontd.html', { 
      nombre: cuentaDestinoData.nombre, 
      monto: montoNumerico, 
      descripcion, 
      fecha: new Date().toLocaleDateString(),
      saldoDestino: nuevoSaldoDestino // Pasar saldoDestino a la plantilla
    });
    await enviarCorreo(cuentaDestinoData.correo, asunto, cuerpoHtml);

    res.status(200).json({ 
      message: 'Transferencia realizada con éxito',
      saldoActual: nuevoSaldoOrigen,
      saldoDestino: nuevoSaldoDestino // Incluir saldoDestino en la respuesta
    });
  } catch (error) {
    console.error('Error al realizar la transferencia:', error);
    res.status(500).json({ error: 'Error al realizar la transferencia' });
  }
});


//Ruta para transferencia con correo de confirmacion 
app.get('/confirm-transfer', async (req, res) => {
  const { token } = req.query;

  try {
    const confirmationRef = db.ref('confirmations').orderByChild('token').equalTo(token);
    const confirmationSnapshot = await confirmationRef.once('value');

    if (!confirmationSnapshot.exists()) {
      return res.status(400).json({ error: 'Token de confirmación inválido o expirado' });
    }

    let confirmationData;
    confirmationSnapshot.forEach(snapshot => {
      confirmationData = snapshot.val();
      snapshot.ref.remove(); // Eliminar el token después de su uso
    });

    const { cuentaOrigen, cuentaDestino, monto, descripcion, saldoAnterior, saldoDestino, fechaTransaccion } = confirmationData;
    
    const clientesRef = db.ref('clientes');
    const clientesSnapshot = await clientesRef.once('value');
    
    let cuentaOrigenData, cuentaDestinoData;
    let cuentaOrigenKey, cuentaDestinoKey;
    let cuentaOrigenClienteKey, cuentaDestinoClienteKey;
    let correoDestino, nombreDestino;

    clientesSnapshot.forEach(clienteSnapshot => {
      const cuentasRef = clienteSnapshot.child('cuentas');
      cuentasRef.forEach(cuentaSnapshot => {
        if (cuentaSnapshot.child('numeroCuenta').val() === cuentaOrigen) {
          cuentaOrigenData = cuentaSnapshot.val();
          cuentaOrigenKey = cuentaSnapshot.key;
          cuentaOrigenClienteKey = clienteSnapshot.key;
        }
        if (cuentaSnapshot.child('numeroCuenta').val() === cuentaDestino) {
          cuentaDestinoData = cuentaSnapshot.val();
          cuentaDestinoKey = cuentaSnapshot.key;
          cuentaDestinoClienteKey = clienteSnapshot.key;
          correoDestino = clienteSnapshot.child('correo').val();
          nombreDestino = clienteSnapshot.child('nombre').val();
        }
      });
    });

    if (!cuentaOrigenData || !cuentaDestinoData) {
      return res.status(404).json({ error: 'Cuenta origen o destino no encontrada' });
    }

    const montoNumerico = parseFloat(monto);

    if (cuentaOrigenData.saldo < montoNumerico) {
      return res.status(400).json({ error: 'Saldo insuficiente' });
    }

    // Realizar la transferencia
    const nuevoSaldoOrigen = cuentaOrigenData.saldo - montoNumerico;
    const nuevoSaldoDestino = cuentaDestinoData.saldo + montoNumerico;

    // Actualizar saldos en la colección 'clientes'
    const updates = {};
    updates[`clientes/${cuentaOrigenClienteKey}/cuentas/${cuentaOrigenKey}/saldo`] = nuevoSaldoOrigen;
    updates[`clientes/${cuentaDestinoClienteKey}/cuentas/${cuentaDestinoKey}/saldo`] = nuevoSaldoDestino;
    await db.ref().update(updates);

    // Registrar la transacción en la colección 'transacciones'
    const newTransactionRef = db.ref('transacciones').push();
    await newTransactionRef.set({
      cuentaOrigen,
      cuentaDestino,
      monto: montoNumerico,
      descripcion,
      fecha: fechaTransaccion,
      saldoAnterior,
      saldoActual: nuevoSaldoOrigen,
      saldoDestino: nuevoSaldoDestino // Incluir saldoDestino en el registro de la transacción
    });

    // Correo de verificación de transferencia al destinatario
    const asunto = 'Confirmación de Transferencia';
    const cuerpoHtml = procesarPlantilla('./plantillas/correo_confirmaciontd.html', { 
      nombre: nombreDestino, 
      monto: montoNumerico, 
      descripcion, 
      fecha: new Date().toLocaleDateString(),
      saldoDestino: nuevoSaldoDestino // Incluir saldoDestino en el correo
    });
    await enviarCorreo(correoDestino, asunto, cuerpoHtml);

    res.redirect(`https://vertexcapital.today/confirmacion_transferencias.html?monto=${montoNumerico}&nombre=${nombreDestino}&fecha=${fechaTransaccion}&saldoDestino=${nuevoSaldoDestino}`);
  } catch (error) {
    console.error('Error al realizar la transferencia:', error);
    res.status(500).json({ error: 'Error al realizar la transferencia' });
  }
});


app.post('/send-confirmation-link', async (req, res) => {
  const {
    email,
    cuentaOrigen,
    cuentaDestino,
    monto,
    descripcion,
    saldoAnterior,
    saldoDestino, // Asegúrate de recibir saldoDestino
    fechaTransaccion
  } = req.body;

  try {
    const token = crypto.randomBytes(20).toString('hex'); // Genera un token único
    const confirmationRef = db.ref('confirmations').push();
    await confirmationRef.set({
      email,
      token,
      cuentaOrigen,
      cuentaDestino,
      monto,
      descripcion,
      saldoAnterior,
      saldoDestino, // Almacenar saldoDestino
      fechaTransaccion,
      timestamp: Date.now()
    });

    const confirmUrl = `http://localhost:3030/confirm-transfer?token=${token}`;
    const asunto = 'Confirmación de Transferencia';

    const cuerpoHtml = procesarPlantilla('./plantillas/correo_confirmacion.html', {
      url: confirmUrl,
      monto,
      cuentaDestino,
      saldoDestino // Pasar saldoDestino a la plantilla
    });

    await enviarCorreo(email, asunto, cuerpoHtml);

    res.status(200).json({ message: 'Enlace de confirmación enviado' });
  } catch (error) {
    console.error('Error al enviar el enlace de confirmación:', error);
    res.status(500).json({ error: 'Error al enviar el enlace de confirmación al servidor' });
  }
});



// Configuración del transportador de correo
const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.com',
  port: 587,
  secure: false,
  auth: {
    user: 'verificaciones@vertexcapital.today',
    pass: 'Verificaciones_124'
  }
});

// Función para enviar correo electrónico
const enviarCorreo = async (correoDestino, asunto, cuerpoHtml) => {
  try {
    const mailOptions = {
      from: 'verificaciones@vertexcapital.today',
      to: correoDestino,
      subject: asunto,
      html: `<p>${cuerpoHtml}</p>`, // Utiliza el cuerpo HTML generado
    };

    await transporter.sendMail(mailOptions);
    console.log('Correo enviado exitosamente a:', correoDestino);
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    throw error;
  }
};

// Función para leer y procesar la plantilla HTML

const procesarPlantilla = (templatePath, variables) => {
  try {
    const htmlTemplate = fs.readFileSync(templatePath, 'utf8');
    let processedHtml = htmlTemplate;
    for (const key in variables) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processedHtml = processedHtml.replace(regex, variables[key]);
    }
    return processedHtml;
  } catch (error) {
    console.error('Error al procesar la plantilla:', error);
    throw error;
  }
};


// Ruta para enviar el correo de verificación (sin guardar en la base de datos)
app.post('/send-verification-email', async (req, res) => {
  const { email, code } = req.body;

  const mailOptions = {
    from: 'verificaciones@vertexcapital.today',
    to: email,
    subject: 'Código de verificación',
    text: `Tu código de verificación es: ${code}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error al enviar el correo:', error);
      res.json({ success: false, error });
    } else {
      console.log('Correo enviado:', info.response);
      res.json({ success: true });
    }
  });
});

// Ruta para guardar datos
app.post('/save-data', async (req, res) => {
  const { cliente } = req.body;

  // Asegurarse de que el saldo sea numérico
  if (typeof cliente.saldo !== 'number') {
    cliente.saldo = 0; // Asigna un valor numérico por defecto si no es numérico
  }

  try {
    // Generar hash de la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(cliente.password, salt);

    // Guardar datos del cliente (incluye username, password, y saldo inicial 0)
    const clientRef = db.ref('clientes').push();
    await clientRef.set({
      ...cliente,
      password: hashedPassword, // Guardar la contraseña hasheada
      saldo: Number(cliente.saldo), // Asegúrate de que el saldo sea un número
    });

    // Enviar correo de confirmación
    const asunto = 'Confirmación de Registro';
    const cuerpoHtml = procesarPlantilla('./plantillas/correoregistro.html', { nombre: cliente.nombre, numeroCuenta: cliente.numeroCuenta });
    await enviarCorreo(cliente.correo, asunto, cuerpoHtml);

    res.status(200).send('Datos guardados exitosamente y correo enviado.');
  } catch (error) {
    console.error('Error al guardar los datos y enviar el correo:', error);
    res.status(500).send('Error al guardar los datos y enviar el correo.');
  }
});

// Ruta para iniciar sesión
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Verificar si el usuario existe en la base de datos
    const userRef = db.ref('clientes').orderByChild('username').equalTo(username);
    const snapshot = await userRef.once('value');

    if (!snapshot.exists()) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    // Obtener los datos del usuario encontrado
    let userData = null;
    let userKey = null;
    snapshot.forEach((childSnapshot) => {
      userData = childSnapshot.val();
      userKey = childSnapshot.key;
    });

    const now = Date.now();
    const thirtySeconds = 30 * 1000;

    // Verificar los intentos fallidos en la nueva rama
    const attemptsRef = db.ref(`intentosFallidos/${userKey}`);
    const attemptsSnapshot = await attemptsRef.once('value');
    let attemptsData = attemptsSnapshot.val() || {
      failedAttempts: 0,
      blockedUntil: null,
    };

// Verificar la contraseña
const passwordMatch = await bcrypt.compare(password, userData.password);
if (!passwordMatch) {
// Incrementar el contador de intentos fallidos
attemptsData.failedAttempts = (attemptsData.failedAttempts || 0) + 1;

if (attemptsData.failedAttempts >= 3) {
  // Bloquear la cuenta temporalmente después de 3 intentos fallidos
  attemptsData.blockedUntil = now + thirtySeconds;
}

      await attemptsRef.set(attemptsData);

      if (attemptsData.blockedUntil) {
        return res.status(403).json({
          message: 'Cuenta bloqueada temporalmente. Intente nuevamente más tarde.',
        });
      }

      return res.status(401).json({ message: 'Contraseña incorrecta.' });
    }

    // Restablecer el contador de intentos fallidos en caso de éxito
    await attemptsRef.set({ failedAttempts: 0, blockedUntil: null });

    // Si las credenciales son correctas
    res.status(200).json({ message: 'Inicio de sesión exitoso.', user: userData });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ message: 'Error al iniciar sesión.' });
  }
});

// Ruta para verificar el código de verificación
app.post('/verify-code', async (req, res) => {
  const { email, code, inputCode } = req.body;

  if (code === inputCode) {
    res.status(200).send('Código de verificación correcto.');
  } else {
    res.status(400).send('Código de verificación incorrecto.');
  }
});

// Ruta para cambiar la contraseña
app.post('/change-password', async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const clientRef = db.ref('clientes').orderByChild('correo').equalTo(email);
    const snapshot = await clientRef.once('value');

    if (!snapshot.exists()) {
      return res.status(404).send('Correo electrónico no encontrado.');
    }
// Hashear la nueva contraseña
const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updates = {};
    snapshot.forEach((childSnapshot) => {
      updates[childSnapshot.key] = { ...childSnapshot.val(), password: hashedPassword };
    });

    await db.ref('clientes').update(updates);
    res.status(200).send('Contraseña cambiada exitosamente.');
  } catch (error) {
    console.error('Error al cambiar la contraseña:', error);
    res.status(500).send('Error al cambiar la contraseña.');
  }
});

// Ruta para verificar correo electrónico
app.post('/check-email', async (req, res) => {
  const { email } = req.body;

  try {
    // Consultar la base de datos para verificar el correo electrónico
    const clientRef = db.ref('clientes').orderByChild('correo').equalTo(email);
    const snapshot = await clientRef.once('value');

    if (snapshot.exists()) {
      res.status(200).send('Correo electrónico encontrado.');
    } else {
      res.status(404).send('Correo electrónico no encontrado.');
    }
  } catch (error) {
    console.error('Error al verificar el correo electrónico:', error);
    res.status(500).send('Error al verificar el correo electrónico.');
  }
});

// Ruta para verificar si el cliente ya existe
app.post('/check-client', async (req, res) => {
  const { username, email, nodocumento, celular } = req.body;

  try {
    // Verificar si el username ya existe
    const usernameRef = db.ref('clientes').orderByChild('username').equalTo(username);
    const usernameSnapshot = await usernameRef.once('value');
    if (usernameSnapshot.exists()) {
      return res.status(400).json({ message: 'El nombre de usuario ya está en uso.' });
    }

    // Verificar si el email ya existe
    const emailRef = db.ref('clientes').orderByChild('correo').equalTo(email);
    const emailSnapshot = await emailRef.once('value');
    if (emailSnapshot.exists()) {
      return res.status(400).json({ message: 'El correo electrónico ya está en uso.' });
    }

    // Verificar si el número de documento ya existe
    const nodocumentoRef = db.ref('clientes').orderByChild('nodocumento').equalTo(nodocumento);
    const nodocumentoSnapshot = await nodocumentoRef.once('value');
    if (nodocumentoSnapshot.exists()) {
      return res.status(400).json({ message: 'El número de documento ya está en uso.' });
    }

    // Verificar si el número de celular ya existe
    const celularRef = db.ref('clientes').orderByChild('celular').equalTo(celular);
    const celularSnapshot = await celularRef.once('value');
    if (celularSnapshot.exists()) {
      return res.status(400).json({ message: 'El número de celular ya está en uso.' });
    }

    // Si todos los datos son únicos
    res.status(200).json({ message: 'Datos válidos. Proceder con la verificación.' });
  } catch (error) {
    console.error('Error al verificar los datos del cliente:', error);
    res.status(500).json({ message: 'Error al verificar los datos del cliente.' });
  }
});


// Ruta para manejar transferencias con PayPal
app.post('/transfer', async (req, res) => {
  const { cuentaDestino, monto, descripcion } = req.body;

  // Token de acceso de PayPal
  const accessToken = 'A21AAKZIKE3mmCqARH2DTi9L9rdTbZvnbpIpI63qK_F9av_PsW8XMctuExQV9AX0J_LGJe42yyrczXiZ8Vr-ZobJMUKXdMQtg';

  try {
    const response = await axios.post(
      'https://api.sandbox.paypal.com/v1/payments/payment',
      {
        intent: 'sale',
        payer: {
          payment_method: 'paypal'
        },
        transactions: [{
          amount: {
            total: monto,
            currency: 'USD'
          },
          description: descripcion
        }],
        redirect_urls: {
          return_url: 'http://localhost:3030/success',
          cancel_url: 'http://localhost:3030/cancel'
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    // Extraer el enlace de aprobación del pago de la respuesta de PayPal
    const approvalUrl = response.data.links.find(link => link.rel === 'approval_url').href;

    // Enviar la URL de aprobación al cliente
    res.json({ approvalUrl });
  } catch (error) {
    console.error('Error al procesar el pago:', error);
    res.status(500).send('Error al procesar el pago.');
  }
});


app.post('/create-order', async (req, res) => {
  const { amount } = req.body;
  
  const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [{
      amount: {
        currency_code: 'USD',
        value: amount 
      }
    }]
  });

  try {
    const order = await client.execute(request);
    res.json(order.result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.post('/capture-order', async (req, res) => {
  const { orderID } = req.body;
  const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderID);
  request.requestBody({});

  try {
    const capture = await client.execute(request);
    res.json(capture.result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/consultar-cuentaa', async (req, res) => {
  const { numeroCuenta } = req.query;

  try {
    if (!numeroCuenta) {
      return res.status(400).json({ error: 'El número de cuenta es requerido.' });
    }

    const clientesRef = db.ref('clientes');
    const clientesSnapshot = await clientesRef.once('value');

    let cuentaDestino = null;

    clientesSnapshot.forEach(clienteSnapshot => {
      const cliente = clienteSnapshot.val();
      const cuentas = cliente.cuentas || {};

      for (const cuentaKey in cuentas) {
        if (cuentas[cuentaKey].numeroCuenta === numeroCuenta) {
          cuentaDestino = {
            nombre: cliente.nombre,
            correo: cliente.correo,
          };
          return true;  // Salir del bucle forEach
        }
      }
      if (cuentaDestino) return true;  // Salir del bucle forEach
    });

    if (cuentaDestino) {
      res.status(200).json(cuentaDestino);
    } else {
      res.status(404).json({ error: 'No se encontró la cuenta destino.' });
    }
  } catch (error) {
    console.error('Error al consultar datos del destinatario:', error);
    res.status(500).json({ error: 'Error al consultar datos del destinatario.' });
  }
});

// Ruta para transferir fondos
app.post('/transferir', async (req, res) => {
  try {
    const { cuentaOrigen, cuentaDestino, monto, descripcion, fechaTransaccion } = req.body;

    const cuentaOrigenRef = db.ref(`usuarios/${cuentaOrigen}`);
    const cuentaDestinoRef = db.ref(`usuarios/${cuentaDestino}`);

    // Obtener los datos de ambas cuentas
    const [cuentaOrigenSnapshot, cuentaDestinoSnapshot] = await Promise.all([
      cuentaOrigenRef.once('value'),
      cuentaDestinoRef.once('value')
    ]);

    if (!cuentaOrigenSnapshot.exists() || !cuentaDestinoSnapshot.exists()) {
      return res.status(404).json({ error: 'No se encontró alguna de las cuentas.' });
    }

    const saldoOrigen = cuentaOrigenSnapshot.val().saldo;
    const saldoDestino = cuentaDestinoSnapshot.val().saldo;

    if (saldoOrigen < monto) {
      return res.status(400).json({ error: 'Saldo insuficiente en la cuenta de origen.' });
    }

    // Realizar la transferencia
    const nuevoSaldoOrigen = saldoOrigen - monto;
    const nuevoSaldoDestino = saldoDestino + monto;

    // Actualizar saldos en la base de datos
    const updates = {};
    updates[`usuarios/${cuentaOrigen}/saldo`] = nuevoSaldoOrigen;
    updates[`usuarios/${cuentaDestino}/saldo`] = nuevoSaldoDestino;
    await db.ref().update(updates);

    // Registrar la transacción
    const newTransactionRef = db.ref('transacciones').push();
    await newTransactionRef.set({
      cuentaOrigen,
      cuentaDestino,
      monto,
      descripcion,
      fecha: fechaTransaccion,
      saldoAnteriorOrigen: saldoOrigen,
      saldoActualOrigen: nuevoSaldoOrigen,
      saldoDestino: nuevoSaldoDestino // Agregar saldoDestino al registro de transacción
    });

    // Responder con éxito
    res.status(200).json({ 
      message: 'Transferencia realizada con éxito',
      saldoActualOrigen: nuevoSaldoOrigen,
      saldoDestino: nuevoSaldoDestino // Incluir saldoDestino en la respuesta
    });

  } catch (error) {
    console.error('Error al realizar la transferencia:', error);
    res.status(500).json({ error: 'Error al realizar la transferencia' });
  }
});

app.post('/transacciones/recarga', async (req, res) => {
  const { numeroCuenta, monto, saldo, fecha } = req.body;

  try {
    // Guardar la recarga en la colección de transacciones
    const recargasRef = db.ref('transacciones/RECARGA');
    await recargasRef.push({ numeroCuenta, monto, saldo, fecha });

    // Actualizar el saldo en la colección de clientes
    const clientesRef = db.ref('clientes');
    clientesRef.once('value', (snapshot) => {
      snapshot.forEach((childSnapshot) => {
        const cliente = childSnapshot.val();
        const clienteKey = childSnapshot.key;

        const cuentas = cliente.cuentas || [];
        const updatedCuentas = cuentas.map((cuenta) => {
          if (cuenta.numeroCuenta === numeroCuenta) {
            return { ...cuenta, saldo };
          }
          return cuenta;
        });

        db.ref(`clientes/${clienteKey}`).update({ cuentas: updatedCuentas });
      });
    });

    res.status(200).send('Recarga registrada y saldo actualizado.');
  } catch (error) {
    console.error('Error al registrar la recarga:', error);
    res.status(500).send('Error al registrar la recarga.');
  }
});



app.get('/transacciones/:numeroCuenta', async (req, res) => {
  const { numeroCuenta } = req.params;

  try {
    const transaccionesRef = db.ref('transacciones');

    // Obtener transacciones donde el usuario es cuentaOrigen
    const snapshotOrigen = await transaccionesRef.orderByChild('cuentaOrigen').equalTo(numeroCuenta).once('value');
    const transaccionesOrigen = [];
    snapshotOrigen.forEach(childSnapshot => {
      transaccionesOrigen.push(childSnapshot.val());
    });

    // Obtener transacciones donde el usuario es cuentaDestino
    const snapshotDestino = await transaccionesRef.orderByChild('cuentaDestino').equalTo(numeroCuenta).once('value');
    const transaccionesDestino = [];
    snapshotDestino.forEach(childSnapshot => {
      transaccionesDestino.push(childSnapshot.val());
    });

    // Unir ambas listas de transacciones
    const transacciones = [...transaccionesOrigen, ...transaccionesDestino];

    if (transacciones.length === 0) {
      return res.status(404).json({ error: 'No se encontraron transacciones para esta cuenta.' });
    }

    res.status(200).json(transacciones);
  } catch (error) {
    console.error('Error al obtener las transacciones:', error);
    res.status(500).json({ error: 'Error al obtener las transacciones.' });
  }
});
app.get('/recargas/:numeroCuenta', async (req, res) => {
  const { numeroCuenta } = req.params;

  try {
    const recargasRef = db.ref('transacciones/RECARGA');
    const snapshot = await recargasRef.orderByChild('numeroCuenta').equalTo(numeroCuenta).once('value');
    
    if (!snapshot.exists()) {
      return res.status(404).json({ error: 'No se encontraron recargas para esta cuenta' });
    }

    const recargas = [];
    snapshot.forEach((childSnapshot) => {
      recargas.push(childSnapshot.val());
    });

    res.status(200).json(recargas);
  } catch (error) {
    console.error('Error al obtener las recargas:', error);
    res.status(500).json({ error: 'Error al obtener las recargas' });
  }
});

app.post('/update-user-data', async (req, res) => {
  const { email, newData } = req.body; // Asegúrate de recibir el email y los nuevos datos

  try {
    const userRef = db.ref('clientes').orderByChild('correo').equalTo(email);
    const snapshot = await userRef.once('value');

    if (!snapshot.exists()) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    let userKey;
    snapshot.forEach(childSnapshot => {
      userKey = childSnapshot.key; // Obtiene la clave del usuario
    });

    // Actualiza los datos del usuario
    await db.ref(`clientes/${userKey}`).update({
      correo: newData.correo,
      celular: newData.celular,
    });
    res.status(200).json({ message: 'Datos actualizados exitosamente.' });
  } catch (error) {
    console.error('Error al actualizar los datos del usuario:', error);
    res.status(500).json({ message: 'Error al actualizar los datos del usuario.' });
  }
});
app.get('/clientes', async (req, res) => {
  try {
    // Obtener referencia a la colección de clientes en la Realtime Database
    const clientesRef = db.ref('clientes');
    const snapshot = await clientesRef.once('value');

    if (snapshot.exists()) {
      const clientes = [];
      snapshot.forEach(childSnapshot => {
        const data = childSnapshot.val();
        clientes.push({
          nombre: data.nombre,
          apellido: data.apellido,
          numeroCuenta: data.numeroCuenta
        });
      });

      res.status(200).json(clientes);
    } else {
      res.status(404).send('No se encontraron clientes.');
    }
  } catch (error) {
      console.error('Error al consultar datos de los clientes:', error);
    res.status(500).send('Error al consultar datos de los clientes.');
  }
});

app.get('/transacciones', async (req, res) => {
  try {
    // Obtener referencia a la colección de transacciones en Realtime Database
    const transaccionesRef = db.ref('transacciones');
    const snapshot = await transaccionesRef.once('value');
    
    if (snapshot.exists()) {
      const transacciones = [];
      snapshot.forEach(childSnapshot => {
        const data = childSnapshot.val();
        transacciones.push({
          id: childSnapshot.key,
          ...data
        });
      });
      res.status(200).json(transacciones);
    } else {
      res.status(404).send('No se encontraron transacciones.');
    }
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Error fetching transactions', error: error.message });
  }
});

app.post('/updateStatus', async (req, res) => {
  const { user, numeroCuenta, nuevoEstado } = req.body;
  try {
    // Obtén una referencia a la cuenta en la base de datos
    const cuentaRef = db.ref(`clientes/${user}/cuentas/${numeroCuenta}`);
    // Actualiza el estado de la cuenta
    await cuentaRef.update({ estado: nuevoEstado });
    // Enviar una respuesta exitosa
    res.status(200).json({ message: `Estado de la cuenta actualizado a ${nuevoEstado}` });
  } catch (error) {
    // Enviar una respuesta de error
    res.status(500).json({ error: 'Error actualizando el estado de la cuenta', details: error.message });
  }
});


app.post('/loginadmin', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Verificar si el usuario existe en la base de datos
    const userRef = db.ref('administracion').orderByChild('admin').equalTo(username);
    const snapshot = await userRef.once('value');

    if (!snapshot.exists()) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    // Obtener los datos del usuario encontrado
    let userData = null;
    let userKey = null;
    snapshot.forEach((childSnapshot) => {
      userData = childSnapshot.val();
      userKey = childSnapshot.key;
    });

    const now = Date.now();
    const thirtySeconds = 30 * 1000;

    // Verificar los intentos fallidos en la nueva rama
    const attemptsRef = db.ref(`intentosFallidos/${userKey}`);
    const attemptsSnapshot = await attemptsRef.once('value');
    let attemptsData = attemptsSnapshot.val() || {
      failedAttempts: 0,
      blockedUntil: null,
    };

    // Verificar si la cuenta está bloqueada temporalmente
    if (attemptsData.blockedUntil && now < attemptsData.blockedUntil) {
      return res.status(403).json({
        message: 'Cuenta bloqueada temporalmente. Intente nuevamente más tarde.',
      });
    }

    // Verificar la contraseña
    if (userData.password !== password) {
      // Incrementar el contador de intentos fallidos
      attemptsData.failedAttempts = (attemptsData.failedAttempts || 0) + 1;

      if (attemptsData.failedAttempts >= 3) {
        // Bloquear la cuenta temporalmente después de 3 intentos fallidos
        attemptsData.blockedUntil = now + thirtySeconds;
      }

      await attemptsRef.set(attemptsData);

      if (attemptsData.blockedUntil) {
        return res.status(403).json({
          message: 'Cuenta bloqueada temporalmente. Intente nuevamente más tarde.',
        });
      }

      return res.status(401).json({ message: 'Contraseña incorrecta.' });
    }

    // Restablecer el contador de intentos fallidos en caso de éxito
    await attemptsRef.set({ failedAttempts: 0, blockedUntil: null });

    // Si las credenciales son correctas
    res.status(200).json({ message: 'Inicio de sesión exitoso.', admin: userData });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ message: 'Error al iniciar sesión.' });
  }

});
app.get('/clientes/:nodocumento', async (req, res) => {
  const { nodocumento } = req.params;

  try {
    // Obtener referencia a la colección de clientes
    const clientesRef = db.ref('clientes');
    const snapshot = await clientesRef.orderByChild('nodocumento').equalTo(nodocumento).once('value');

    if (snapshot.exists()) {
      let clienteData = null;
      snapshot.forEach(childSnapshot => {
        clienteData = childSnapshot.val();
      });

      res.status(200).json(clienteData);
    } else {
      res.status(404).json({ error: 'Cliente no encontrado' });
    }
  } catch (error) {
    console.error('Error al obtener datos del cliente:', error);
    res.status(500).json({ error: 'Error al obtener datos del cliente' });
  }
});

app.post('/clientes/:nodocumento/cuentas', async (req, res) => {
  const { nodocumento } = req.params;
  const { numeroCuenta, saldo, estado } = req.body;

  try {
    if (!nodocumento) {
      return res.status(400).json({ error: 'El ID del usuario es requerido.' });
    }

    const clienteRef = db.ref('clientes');
    const snapshot = await clienteRef.orderByChild('nodocumento').equalTo(nodocumento).once('value');

    if (!snapshot.exists()) {
      return res.status(404).json({ error: 'Cliente no encontrado.' });
    }

    let clienteKey = null;
    snapshot.forEach(childSnapshot => {
      clienteKey = childSnapshot.key;
    });

    const cuentasRef = db.ref(`clientes/${clienteKey}/cuentas`);
    const cuentasSnapshot = await cuentasRef.once('value');
    const cuentas = cuentasSnapshot.val() || {};
    const cuentasCount = Object.keys(cuentas).length;

    const nuevaCuenta = {
      numeroCuenta,
      saldo,
      estado
    };

    await cuentasRef.child(cuentasCount.toString()).set(nuevaCuenta);

    res.status(201).json({ id: cuentasCount, ...nuevaCuenta });
  } catch (error) {
    console.error('Error al crear la nueva cuenta:', error);
    res.status(500).json({ error: 'Error al crear la nueva cuenta' });
  }
});
app.get('/clientes/:nodocumento/cuentas', async (req, res) => {
  const { nodocumento } = req.params;

  try {
    if (!nodocumento) {
      return res.status(400).json({ error: 'El ID del usuario es requerido.' });
    }

    const clienteRef = db.ref('clientes');
    const snapshot = await clienteRef.orderByChild('nodocumento').equalTo(nodocumento).once('value');

    if (!snapshot.exists()) {
      return res.status(404).json({ error: 'Cliente no encontrado.' });
    }

    let clienteKey = null;
    snapshot.forEach(childSnapshot => {
      clienteKey = childSnapshot.key;
    });

    const cuentasRef = db.ref(`clientes/${clienteKey}/cuentas`);
    const cuentasSnapshot = await cuentasRef.once('value');
    const cuentas = cuentasSnapshot.val() || {};

    res.status(200).json(cuentas);
  } catch (error) {
    console.error('Error al obtener las cuentas:', error);
    res.status(500).json({ error: 'Error al obtener las cuentas del usuario' });
  }
});

//consultaar cuenta aactualizada
app.get('/consultar-cuenta', async (req, res) => {
  const { numeroCuenta } = req.query;

  try {
    if (!numeroCuenta) {
      return res.status(400).json({ error: 'El número de cuenta es requerido.' });
    }

    const cuentasRef = db.ref('clientes');
    const snapshot = await cuentasRef.once('value');

    let cuentaInfo = null;

    snapshot.forEach(clientSnapshot => {
      const cuentas = clientSnapshot.child('cuentas').val();
      for (const cuentaKey in cuentas) {
        if (cuentas[cuentaKey].numeroCuenta === numeroCuenta) {
          cuentaInfo = {
            nombre: clientSnapshot.child('nombre').val(),
            correo: clientSnapshot.child('correo').val()
          };
          break;
        }
      }
      if (cuentaInfo) return true; // stop the loop
    });

    if (!cuentaInfo) {
      return res.status(404).json({ error: 'Cuenta no encontrada.' });
    }

    res.status(200).json(cuentaInfo);
  } catch (error) {
    console.error('Error al consultar cuenta:', error);
    res.status(500).json({ error: 'Error al consultar la cuenta.' });
  }
});

//crear ticket
app.post('/creartickets', async (req, res) => {
  const { usuario, nodocumento, asunto, tipoProblema, descripcion } = req.body;
// Obtener la fecha y hora actual
const fechaActual = new Date();
const fechaTicket = `${fechaActual.getFullYear()}-${(fechaActual.getMonth() + 1).toString().padStart(2, '0')}-${fechaActual.getDate().toString().padStart(2, '0')} ${fechaActual.getHours().toString().padStart(2, '0')}:${fechaActual.getMinutes().toString().padStart(2, '0')}:${fechaActual.getSeconds().toString().padStart(2, '0')}`;

  try {
    const ticketRef = db.ref('tickets').push();
    const ticketId = ticketRef.key; 
    await ticketRef.set({
      id: ticketId,
      usuario,
      nodocumento,
      asunto,
      descripcion,
      estado: 'abierto',
      tipoProblema, 
      fechaTicket,
      respuestas: []
    });

    res.status(201).json({ message: 'Ticket creado con éxito', id: ticketRef.key });
  } catch (error) {
    console.error('Error al crear el ticket:', error);
    res.status(500).json({ message: 'Error al crear el ticket', error });
  }
});

//obtener informacion de los tickets
app.get('/tickets', async (req, res) => {
  const { usuario } = req.query;

  try {
    let snapshot;
    if (usuario) {
      snapshot = await db.ref('tickets').orderByChild('usuario').equalTo(usuario).once('value');
    } else {
      snapshot = await db.ref('tickets').once('value');
    }

    const tickets = [];
    snapshot.forEach(childSnapshot => {
      tickets.push(childSnapshot.val());
    });

    res.status(200).json(tickets);
  } catch (error) {
    console.error('Error al obtener los tickets:', error);
    res.status(500).json({ message: 'Error al obtener los tickets', error });
  }
});
//obtiene datos del contacto 
// Ruta para obtener los datos de contacto del cliente
app.get('/contacto/:usuario', async (req, res) => {
  const { usuario } = req.params;

  try {
    if (!usuario) {
      return res.status(400).json({ error: 'El nombre de usuario es requerido.' });
    }

    const clientesRef = db.ref('clientes');
    const clientesSnapshot = await clientesRef.once('value');

    let contacto = null;

    clientesSnapshot.forEach(clienteSnapshot => {
      const cliente = clienteSnapshot.val();
      if (cliente.username === usuario) {
        contacto = {
          correo: cliente.correo,
          celular: cliente.celular
        };
        return true;  // Salir del bucle forEach
      }
    });

    if (contacto) {
      res.status(200).json(contacto);
    } else {
      res.status(404).json({ error: 'Usuario no encontrado.' });
    }
  } catch (error) {
    console.error('Error al obtener los datos de contacto:', error);
    res.status(500).json({ error: 'Error al obtener los datos de contacto.' });
  }
});




//muestra todos los tickets
// Ruta para obtener todos los tickets sin filtrar por usuario
app.get('/alltickets', async (req, res) => {
  try {
    const snapshot = await db.ref('tickets').once('value');
    const tickets = [];
    snapshot.forEach(childSnapshot => {
      tickets.push(childSnapshot.val());
    });
    res.status(200).json(tickets);
  } catch (error) {
    console.error('Error al obtener todos los tickets:', error);
    res.status(500).json({ message: 'Error al obtener todos los tickets', error });
  }
});


//gestion tickets admin
// Suponiendo que estás usando Express y Firebase
app.post('/tickets/:ticketId/resolver', async (req, res) => {
  const { ticketId } = req.params;
  const { comentario } = req.body;

  try {
    const ticketRef = db.ref(`tickets/${ticketId}`);
    const snapshot = await ticketRef.once('value');

    if (!snapshot.exists()) {
      return res.status(404).json({ message: 'Ticket no encontrado' });
    }

    const ticket = snapshot.val();
    ticket.estado = 'resuelto';
    ticket.fechaResolucion = new Date().toISOString();
    ticket.comentario = comentario; // Añadir el comentario al ticket
    
    await ticketRef.update(ticket);

    // Obtener los datos del usuario que creó el ticket
    const userSnapshot = await db.ref('clientes').orderByChild('username').equalTo(ticket.usuario).once('value');
    if (!userSnapshot.exists()) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const usuario = Object.values(userSnapshot.val())[0];
    const correoDestino = usuario.correo;

    // Procesar la plantilla del correo
    const templatePath = './plantillas/correo_ticket.html'; // Cambia esto al path de tu plantilla
    const cuerpoHtml = procesarPlantilla(templatePath, {
      nombre: usuario.nombre,
      ticketId: ticketId,
      asunto: ticket.asunto,
      descripcion: ticket.descripcion,
      comentario: ticket.comentario, // Añadir el comentario al cuerpo del correo
      usuario: ticket.usuario,
      fechaResolucion: ticket.fechaResolucion,
    });

    // Enviar el correo
    await enviarCorreo(correoDestino, `Tu ticket "${ticket.asunto}" ha sido resuelto`, cuerpoHtml);

    res.status(200).json(ticket);
  } catch (error) {
    console.error('Error al resolver el ticket:', error);
    res.status(500).json({ message: 'Error al resolver el ticket', error });
  }
});


const enviarCorreoMov = async (correoDestino, nombreUsuario) => {
  if (!correoDestino || !nombreUsuario) {
    throw new Error('Faltan datos necesarios para enviar el correo');
  }

  try {
    const mailOptions = {
      from: 'verificaciones@vertexcapital.today',
      to: correoDestino,
      subject: 'Tus Movimientos',
      html: `<p>Hola ${nombreUsuario},</p><p>Adjunto encontrarás tus movimientos en formato PDF, CSV y Excel.</p>`,
      attachments: [
        {
          filename: 'transacciones.pdf',
          path: path.join(__dirname, 'transacciones.pdf'),
        },
        {
          filename: 'transacciones.csv',
          path: path.join(__dirname, 'transacciones.csv'),
        },
        {
          filename: 'transacciones.xlsx',
          path: path.join(__dirname, 'transacciones.xlsx'),
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log('Correo enviado exitosamente a:', correoDestino);
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    throw error;
  }
};

// Endpoint para enviar el correo al usuario basado en su ID
app.post('/send-email-to-user', async (req, res) => {
  const { user } = req.body;
  try {
    // Obtener el correo electrónico del usuario desde Firebase Realtime Database
    const userRef = admin.database().ref(`/clientes/${user}`);
    const userSnapshot = await userRef.once('value');
    const userData = userSnapshot.val();

    if (!userData || !userData.correo || !userData.nombre) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const { correo, nombre } = userData;

    // Generar los documentos aquí si es necesario

    // Enviar correo electrónico al usuario
    await enviarCorreoMov(correo, nombre);

    res.status(200).json({ message: 'Email enviado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al enviar el correo', error: error.message });
  }
});




// Nueva ruta para validar el "No de documento"
app.post('/validate-nodocumento', (req, res) => {
  const { nodocumento } = req.body;

  // Validación de No de documento
  const nodocumentoRegex = /^[0-9]{10}$/; // Ejemplo: solo números y longitud de 10
  if (!nodocumentoRegex.test(nodocumento)) {
    return res.status(400).json({ message: 'Número de documento inválido.' });
  }

  res.status(200).json({ message: 'Número de documento válido.' });
});
app.get('/clientes/:nombre/:apellido/cuentas', async (req, res) => {
  const { nombre, apellido } = req.params;

  try {
    if (!nombre || !apellido) {
      return res.status(400).json({ error: 'El nombre y apellido del usuario son requeridos.' });
    }

    const clienteRef = db.ref('clientes');
    const snapshot = await clienteRef
      .orderByChild('nombre')
      .equalTo(nombre)
      .once('value');

    if (!snapshot.exists()) {
      return res.status(404).json({ error: 'Cliente no encontrado.' });
    }

    let clienteKey = null;
    snapshot.forEach(childSnapshot => {
      const childData = childSnapshot.val();
      if (childData.apellido === apellido) {
        clienteKey = childSnapshot.key;
      }
    });

    if (!clienteKey) {
      return res.status(404).json({ error: 'Cliente no encontrado.' });
    }

    const cuentasRef = db.ref(`clientes/${clienteKey}/cuentas`);
    const cuentasSnapshot = await cuentasRef.once('value');
    const cuentas = cuentasSnapshot.val() || {};

    res.status(200).json(cuentas);
  } catch (error) {
    console.error('Error al obtener las cuentas:', error);
    res.status(500).json({ error: 'Error al obtener las cuentas del usuario' });
  }
});

const generateAccountNumber = () => {
  // Genera 10 dígitos aleatorios
  const randomDigits = Math.floor(1000000000 + Math.random() * 9000000000).toString();
  // El número de cuenta se compone de 18 + 10 dígitos
  return `18${randomDigits}`;
};

app.post('/clientes/:nombre/:apellido/cuentas', async (req, res) => {
  const { nombre, apellido } = req.params;

  try {
    if (!nombre || !apellido) {
      return res.status(400).json({ error: 'El nombre y apellido del usuario son requeridos.' });
    }

    const clienteRef = db.ref('clientes');
    const snapshot = await clienteRef
      .orderByChild('nombre')
      .equalTo(nombre)
      .once('value');

    if (!snapshot.exists()) {
      return res.status(404).json({ error: 'Cliente no encontrado.' });
    }

    let clienteKey = null;
    snapshot.forEach(childSnapshot => {
      const childData = childSnapshot.val();
      if (childData.apellido === apellido) {
        clienteKey = childSnapshot.key;
      }
    });

    if (!clienteKey) {
      return res.status(404).json({ error: 'Cliente no encontrado.' });
    }

    const cuentasRef = db.ref(`clientes/${clienteKey}/cuentas`);
    const cuentasSnapshot = await cuentasRef.once('value');
    const cuentas = cuentasSnapshot.val() || {};

    // Genera un nuevo número de cuenta
    const nuevaCuentaNumero = generateAccountNumber();
    const nuevaCuenta = {
      numeroCuenta: nuevaCuentaNumero,
      saldo: 0, // Saldo inicial
      estado: 'activado' // Estado inicial
    };

    // Determina el siguiente índice para la nueva cuenta
    const nextIndex = Object.keys(cuentas).length;
    cuentas[nextIndex] = nuevaCuenta;

    await cuentasRef.set(cuentas);

    res.status(200).json({ message: 'Cuenta añadida correctamente.', cuenta: nuevaCuenta });
  } catch (error) {
    console.error('Error al agregar la cuenta:', error);
    res.status(500).json({ error: 'Error al agregar la cuenta' });
  }
});
app.delete('/clientes/:nombre/:apellido/cuentas/:numeroCuenta', async (req, res) => {
  const { nombre, apellido, numeroCuenta } = req.params;

  try {
    if (!nombre || !apellido || !numeroCuenta) {
      return res.status(400).json({ error: 'Nombre, apellido y número de cuenta son requeridos.' });
    }

    const clienteRef = db.ref('clientes');
    const snapshot = await clienteRef
      .orderByChild('nombre')
      .equalTo(nombre)
      .once('value');

    if (!snapshot.exists()) {
      return res.status(404).json({ error: 'Cliente no encontrado.' });
    }

    let clienteKey = null;
    snapshot.forEach(childSnapshot => {
      const childData = childSnapshot.val();
      if (childData.apellido === apellido) {
        clienteKey = childSnapshot.key;
      }
    });

    if (!clienteKey) {
      return res.status(404).json({ error: 'Cliente no encontrado.' });
    }

    const cuentaRef = db.ref(`clientes/${clienteKey}/cuentas`);
    const cuentaSnapshot = await cuentaRef.orderByChild('numeroCuenta').equalTo(numeroCuenta).once('value');
    
    if (!cuentaSnapshot.exists()) {
      return res.status(404).json({ error: 'Cuenta no encontrada.' });
    }

    cuentaSnapshot.forEach(async (cuentaChildSnapshot) => {
      await cuentaChildSnapshot.ref.remove();
    });

    res.status(200).json({ message: 'Cuenta eliminada exitosamente.' });
  } catch (error) {
    console.error('Error al eliminar la cuenta:', error);
    res.status(500).json({ error: 'Error al eliminar la cuenta.' });
  }
});
app.delete('/clientes/:nombre/:apellido', async (req, res) => {
  const { nombre, apellido } = req.params;

  try {
    if (!nombre || !apellido) {
      return res.status(400).json({ error: 'El nombre y apellido del cliente son requeridos.' });
    }

    const clienteRef = db.ref('clientes');
    const snapshot = await clienteRef
      .orderByChild('nombre')
      .equalTo(nombre)
      .once('value');

    if (!snapshot.exists()) {
      return res.status(404).json({ error: 'Cliente no encontrado.' });
    }

    let clienteKey = null;
    snapshot.forEach(childSnapshot => {
      const childData = childSnapshot.val();
      if (childData.apellido === apellido) {
        clienteKey = childSnapshot.key;
      }
    });

    if (!clienteKey) {
      return res.status(404).json({ error: 'Cliente no encontrado.' });
    }

    await db.ref(`clientes/${clienteKey}`).remove();
    res.status(200).json({ message: 'Cliente eliminado correctamente.' });
  } catch (error) {
    console.error('Error al eliminar el cliente:', error);
    res.status(500).json({ error: 'Error al eliminar el cliente' });
  }
});
app.patch('/clientes/:nombre/:apellido/cuentas/:numeroCuenta', async (req, res) => {
  const { nombre, apellido, numeroCuenta } = req.params;
  const { estado } = req.body;

  try {
    if (!nombre || !apellido || !numeroCuenta || !estado) {
      return res.status(400).json({ error: 'Nombre, apellido, número de cuenta y estado son requeridos.' });
    }

    const clienteRef = db.ref('clientes');
    const snapshot = await clienteRef
      .orderByChild('nombre')
      .equalTo(nombre)
      .once('value');

    if (!snapshot.exists()) {
      return res.status(404).json({ error: 'Cliente no encontrado.' });
    }

    let clienteKey = null;
    snapshot.forEach(childSnapshot => {
      const childData = childSnapshot.val();
      if (childData.apellido === apellido) {
        clienteKey = childSnapshot.key;
      }
    });

    if (!clienteKey) {
      return res.status(404).json({ error: 'Cliente no encontrado.' });
    }

    const cuentaRef = db.ref(`clientes/${clienteKey}/cuentas`);
    const cuentaSnapshot = await cuentaRef.orderByChild('numeroCuenta').equalTo(numeroCuenta).once('value');
    
    if (!cuentaSnapshot.exists()) {
      return res.status(404).json({ error: 'Cuenta no encontrada.' });
    }

    cuentaSnapshot.forEach(async (cuentaChildSnapshot) => {
      await cuentaChildSnapshot.ref.update({ estado });
    });

    res.status(200).json({ message: 'Estado de la cuenta actualizado exitosamente.', estado });
  } catch (error) {
    console.error('Error al actualizar el estado de la cuenta:', error);
    res.status(500).json({ error: 'Error al actualizar el estado de la cuenta.' });
  }
});


// Ruta para enviar el correo de verificación (almacenando en la base de datos para cambio de contraseña)
app.post('/send-password-reset-code', async (req, res) => {
  const { email, code } = req.body;

  try {
    // Almacenar el código de verificación en la base de datos
    const verificationRef = db.ref('passwordResets').push();
    await verificationRef.set({
      email,
      code,
      timestamp: Date.now()
    });

    const mailOptions = {
      from: 'verificaciones@vertexcapital.today',
      to: email,
      subject: 'Código de verificación para cambio de contraseña',
      text: `Tu código de verificación es: ${code}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error al enviar el correo:', error);
        res.json({ success: false, error });
      } else {
        console.log('Correo enviado:', info.response);
        res.json({ success: true });
      }
    });
  } catch (error) {
    console.error('Error al enviar el correo de verificación:', error);
    res.status(500).json({ message: 'Error al enviar el correo de verificación.', error });
  }
});


// Ruta para verificar el código de verificación para cambio de contraseña
app.post('/verify-password-reset-code', async (req, res) => {
  const { email, inputCode } = req.body;

  try {
    // Obtén el código de verificación almacenado en la base de datos
    const verificationRef = db.ref('passwordResets').orderByChild('email').equalTo(email);
    const snapshot = await verificationRef.once('value');

    if (!snapshot.exists()) {
      return res.status(404).json({ message: 'Código de verificación no encontrado.' });
    }

    let storedCode;
    snapshot.forEach((childSnapshot) => {
      storedCode = childSnapshot.val().code;
    });

    // Compara el código ingresado con el código almacenado
    if (storedCode === inputCode) {
      res.status(200).json({ message: 'Código de verificación correcto.' });
    } else {
      res.status(400).json({ message: 'Código de verificación incorrecto.' });
    }
  } catch (error) {
    console.error('Error al verificar el código:', error);
    res.status(500).json({ message: 'Error al verificar el código.' });
  }
});

// Iniciar el servidor
const PORT = process.env.PORT || 3030;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});