import React, { useState } from 'react';
import '../estilos/estilos_recuperar.css';
import Header from '../inicio/Header';

const Recuperar = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [verificationCodeSent, setVerificationCodeSent] = useState(false);

  const validatePassword = (password) => {
    const minLength = 8;
    const symbolRegex = /[!@#$%^&*(),.?":{}|<>]/;

    return password.length >= minLength && symbolRegex.test(password);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('https://vc-su7z.onrender.com/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.status === 200) {
        setMessage('El correo electrónico existe. Se ha enviado un código de verificación.');
        setVerificationCodeSent(true);
        await sendVerificationCode();
      } else if (response.status === 404) {
        setMessage('El correo electrónico no existe.');
      } else {
        setMessage('Error al verificar el correo electrónico.');
      }
    } catch (error) {
      setMessage('Error al verificar el correo electrónico.');
    }
  };

  const sendVerificationCode = async () => {
    const code = Math.floor(100000 + Math.random() * 900000); // Generar código de 6 dígitos
    try {
      await fetch('https://vc-su7z.onrender.com/send-verification-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });
      setMessage('Código de verificación enviado.');
    } catch (error) {
      setMessage('Error al enviar el código de verificación.');
    }
  };

  const handleVerifyCodeAndChangePassword = async (event) => {
    event.preventDefault();
    if (newPassword !== repeatPassword) {
      setMessage('Las contraseñas no coinciden.');
      return;
    }

    if (!validatePassword(newPassword)) {
      setMessage('La contraseña debe tener al menos 8 caracteres y un símbolo.');
      return;
    }

    try {
      const response = await fetch('https://vc-su7z.onrender.com/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code, inputCode: code }),
      });

      if (response.status === 200) {
        await changePassword();
      } else {
        setMessage('Código de verificación incorrecto.');
      }
    } catch (error) {
      setMessage('Error al verificar el código.');
    }
  };

  const changePassword = async () => {
    try {
      const response = await fetch('https://vc-su7z.onrender.com/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, newPassword }),
      });

      if (response.status === 200) {
        setMessage('Contraseña cambiada exitosamente.');
      } else {
        setMessage('Error al cambiar la contraseña.');
      }
    } catch (error) {
      setMessage('Error al cambiar la contraseña.');
    }
  };

  return (
    <div>
      <Header />
      <div className="recuperar-container">
        <h2>Recuperar Contraseña</h2>
        {!verificationCodeSent ? (
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email">Correo Electrónico:</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button id="recuperar-btn" type="submit">Enviar</button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCodeAndChangePassword}>
            <div>
              <label htmlFor="code">Código de Verificación:</label>
              <input
                type="text"
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="newPassword">Contraseña Nueva:</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="repeatPassword">Repite Contraseña:</label>
              <input
                type="password"
                id="repeatPassword"
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit">Cambiar Contraseña</button>
          </form>
        )}
        {message && <p>{message}</p>}
      </div>
    </div>
  );
};

export default Recuperar;
