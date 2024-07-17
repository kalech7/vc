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
app.use(cors({
    origin: 'https://vertexcapital.today'
  }));

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
  