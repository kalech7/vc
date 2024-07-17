const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const cors = require('cors');
const nodemailer = require('nodemailer');
const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');
const crypto = require('crypto');
const fs = require('fs'); // Requiere el módulo 'fs'
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

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
  const { cuentaOrigen, cuentaDestino, monto, descripcion, saldoAnterior, fechaTransaccion } = req.body;

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
    });
    const asunto = 'Confirmación de Transferencia';
    const cuerpoHtml = procesarPlantilla('./plantillas/correo_confirmaciontd.html', { 
      nombre: cuentaDestinoData.nombre, 
      monto: montoNumerico, 
      descripcion, 
      fecha: new Date().toLocaleDateString() 
    });
    await enviarCorreo(cuentaDestinoData.correo, asunto, cuerpoHtml);

    res.status(200).json({ message: 'Transferencia realizada con éxito', saldoActual: nuevoSaldoOrigen });
  } catch (error) {
    res.status(500).json({ error: 'Error al realizar la transferencia' });
  }
});

//Ruta para transferencia con correo de confirmacion 
// Generar y enviar enlace de confirmación
app.post('/send-confirmation-link', async (req, res) => {
  const { email, cuentaOrigen, cuentaDestino, monto, descripcion, saldoAnterior, fechaTransaccion } = req.body;

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
      fechaTransaccion,
      timestamp: Date.now()
    });

    const confirmUrl = `http://localhost:3030/confirm-transfer?token=${token}`;
    const asunto = 'Confirmación de Transferencia';
    const cuerpoHtml = procesarPlantilla('./plantillas/correo_confirmacion.html', { url: confirmUrl });
    await enviarCorreo(email, asunto, cuerpoHtml);

    res.status(200).json({ message: 'Enlace de confirmación enviado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al enviar el enlace de confirmación al servidor' });
  }
});

// Confirmar la transferencia
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

    const { cuentaOrigen, cuentaDestino, monto, descripcion, saldoAnterior, fechaTransaccion } = confirmationData;
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
    });

    // Correo de verificación de transferencia al destinatario
    const asunto = 'Confirmación de Transferencia';
    const cuerpoHtml = procesarPlantilla('./plantillas/correo_confirmaciontd.html', { 
      nombre: cuentaDestinoData.nombre, 
      monto: montoNumerico, 
      descripcion, 
      fecha: new Date().toLocaleDateString() 
    });
    await enviarCorreo(cuentaDestinoData.correo, asunto, cuerpoHtml);

    res.redirect(`/confirmacion_transferencias.html?monto=${montoNumerico}&nombre=${cuentaDestinoData.nombre}&fecha=${fechaTransaccion}`);
    //res.status(200).json({ message: 'Transferencia realizada con éxito', saldoActual: nuevoSaldoOrigen });
  } catch (error) {
    res.status(500).json({ error: 'Error al realizar la transferencia' });
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
    // Guardar datos del cliente (incluye username, password, y saldo inicial 0)
    const clientRef = db.ref('clientes').push();
    await clientRef.set({
      ...cliente,
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

    const updates = {};
    snapshot.forEach((childSnapshot) => {
      updates[childSnapshot.key] = { ...childSnapshot.val(), password: newPassword };
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
    res.status(200).json({ message: 'Inicio de sesión exitoso.', user: userData });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ message: 'Error al iniciar sesión.' });
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

app.get('/consultar-cuenta', async (req, res) => {
  try {
    const { cuentaDestino } = req.query;

    // Obtener referencia a la colección de clientes en la Realtime Database
    const clientesRef = db.ref('clientes');
    const snapshot = await clientesRef.orderByChild('numeroCuenta').equalTo(cuentaDestino).once('value');

    if (snapshot.exists()) {
      // Extraer el primer documento encontrado que coincida con el número de cuenta
      const cliente = snapshot.val();
      const key = Object.keys(cliente)[0];
      const cuentaDestinoDoc = cliente[key];

      const data = {
        nombre: cuentaDestinoDoc.nombre,
        correo: cuentaDestinoDoc.correo,
      };

      res.status(200).json(data);
    } else {
      res.status(404).send('No se encontró la cuenta destino.');
    }
  } catch (error) {
    console.error('Error al consultar datos del destinatario:', error);
    res.status(500).send('Error al consultar datos del destinatario.');
  }
});

// Ruta para transferir fondos
app.post('/transferir', async (req, res) => {
  try {
    const { cuentaOrigen, cuentaDestino, monto } = req.body;

    const cuentaOrigenRef = db.ref(`usuarios/${cuentaOrigen}`);
    const cuentaDestinoRef = db.ref(`usuarios/${cuentaDestino}`);

    await Promise.all([
      cuentaOrigenRef.once('value'),
      cuentaDestinoRef.once('value')
    ]).then(([cuentaOrigenSnapshot, cuentaDestinoSnapshot]) => {
      if (!cuentaOrigenSnapshot.exists() || !cuentaDestinoSnapshot.exists()) {
        throw new Error('No se encontró alguna de las cuentas.');
      }

      const saldoOrigen = cuentaOrigenSnapshot.val().saldo;
      const saldoDestino = cuentaDestinoSnapshot.val().saldo;

      if (saldoOrigen < monto) {
        throw new Error('Saldo insuficiente en la cuenta de origen.');
      }

      // Inicia una transacción
      const updates = {};
      updates[`usuarios/${cuentaOrigen}/saldo`] = saldoOrigen - monto;
      updates[`usuarios/${cuentaDestino}/saldo`] = saldoDestino + monto;

      return db.ref().update(updates);
    });

    res.status(200).send('Transferencia realizada exitosamente.');
  } catch (error) {
    console.error('Error al procesar la transferencia:', error);
    res.status(500).send('Error al procesar la transferencia.');
  }
});
app.post('/transacciones/recarga', async (req, res) => {
  const { numeroCuenta, monto, saldo, fecha } = req.body;

  try {
    // Guardar la recarga en la colección de transacciones
    const recargasRef = db.ref('transacciones/RECARGA');
    await recargasRef.push({ numeroCuenta, monto, saldo, fecha });

    // Actualizar el saldo en la colección de clientes
    const clienteRef = db.ref('clientes').orderByChild('numeroCuenta').equalTo(numeroCuenta);
    clienteRef.once('value', (snapshot) => {
      snapshot.forEach((childSnapshot) => {
        db.ref(`clientes/${childSnapshot.key}`).update({ saldo });
      });
    });

    res.status(200).json({ message: 'Recarga registrada y saldo actualizado correctamente' });
  } catch (error) {
    console.error('Error al registrar la recarga y actualizar el saldo:', error);
    res.status(500).json({ error: 'Error al registrar la recarga y actualizar el saldo' });
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

// Iniciar el servidor
const PORT = process.env.PORT || 3030;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
