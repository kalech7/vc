const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const request = require('supertest'); // Para pruebas

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Ruta absoluta al archivo de credenciales
const serviceAccount = require('./credencialbase.json');

// Inicializa la aplicación de Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://vertexcapital-5ee1a-default-rtdb.firebaseio.com/',
});

const db = admin.database();

app.post('/loginadmin', async (req, res) => {
  const { username, password } = req.body;

  try {
    const userRef = db.ref('administracion').orderByChild('admin').equalTo(username);
    const snapshot = await userRef.once('value');

    if (!snapshot.exists()) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    let userData = null;
    let userKey = null;
    snapshot.forEach((childSnapshot) => {
      userData = childSnapshot.val();
      userKey = childSnapshot.key;
    });

    const now = Date.now();
    const thirtySeconds = 30 * 1000;

    const attemptsRef = db.ref(`intentosFallidos/${userKey}`);
    const attemptsSnapshot = await attemptsRef.once('value');
    let attemptsData = attemptsSnapshot.val() || {
      failedAttempts: 0,
      blockedUntil: null,
    };

    if (attemptsData.blockedUntil && now < attemptsData.blockedUntil) {
      return res.status(403).json({
        message: 'Cuenta bloqueada temporalmente. Intente nuevamente más tarde.',
      });
    }

    if (userData.password !== password) {
      attemptsData.failedAttempts = (attemptsData.failedAttempts || 0) + 1;

      if (attemptsData.failedAttempts >= 3) {
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

    await attemptsRef.set({ failedAttempts: 0, blockedUntil: null });

    
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    
  }
});

module.exports = app;
