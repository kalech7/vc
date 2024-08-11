import React, { useState } from 'react';
import '../estilos/estilos_recuperar.css';
import Header from '../inicio/Header';

const Recuperar = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [verificationCodeSent, setVerificationCodeSent] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [codeError, setCodeError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [repeatPasswordError, setRepeatPasswordError] = useState(false);
  const [loading, setLoading] = useState(false); // Nuevo estado para el spinner

  const validatePassword = (password) => {
    const minLength = 8;
    const uppercaseRegex = /[A-Z]/;
    const symbolRegex = /[!@#$%^&*(),.?":{}|<>]/;

    return (
      password.length >= minLength &&
      uppercaseRegex.test(password) &&
      symbolRegex.test(password)
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setEmailError(false);
    setLoading(true); // Mostrar spinner

    if (!email) {
      setLoading(false); // Ocultar spinner
      setEmailError(true);
      setMessage('El campo de correo electrónico no puede estar vacío.');
      return;
    }

    try {
      const response = await fetch('https://vc-su7z.onrender.com/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.status === 200) {
        setMessage(
          'El correo electrónico existe. Se ha enviado un código de verificación.'
        );
        setVerificationCodeSent(true);
        await sendVerificationCode();
      } else if (response.status === 404) {
        setMessage('El correo electrónico no existe.');
        setEmailError(true);
      } else {
        setMessage('Error al verificar el correo electrónico.');
        setEmailError(true);
      }
    } catch (error) {
      setMessage('Error al verificar el correo electrónico.');
      setEmailError(true);
    } finally {
      setLoading(false); // Ocultar spinner
    }
  };

  const sendVerificationCode = async () => {
    const generatedCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString(); // Generar código de 6 dígitos
    try {
      const response = await fetch(
        'https://vc-su7z.onrender.com/send-password-reset-code',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, code: generatedCode }),
        }
      );

      if (response.status === 200) {
        setMessage('Código de verificación enviado.');
      } else {
        setMessage('Error al enviar el código de verificación.');
      }
    } catch (error) {
      setMessage('Error al enviar el código de verificación.');
    }
  };

  const handleVerifyCodeAndChangePassword = async (event) => {
    event.preventDefault();
    setCodeError(false);
    setPasswordError(false);
    setRepeatPasswordError(false);
    setLoading(true); // Mostrar spinner

    if (!inputCode) {
      setLoading(false); // Ocultar spinner
      setCodeError(true);
      setMessage('El campo de código de verificación no puede estar vacío.');
      return;
    }

    if (!newPassword) {
      setLoading(false); // Ocultar spinner
      setPasswordError(true);
      setMessage('El campo de contraseña nueva no puede estar vacío.');
      return;
    }

    if (!repeatPassword) {
      setLoading(false); // Ocultar spinner
      setRepeatPasswordError(true);
      setMessage('El campo de repetir contraseña no puede estar vacío.');
      return;
    }

    if (newPassword !== repeatPassword) {
      setLoading(false); // Ocultar spinner
      setMessage('Las contraseñas no coinciden.');
      setPasswordError(true);
      setRepeatPasswordError(true);
      return;
    }

    if (!validatePassword(newPassword)) {
      setLoading(false); // Ocultar spinner
      setMessage(
        'La contraseña debe tener al menos 8 caracteres, una mayúscula y un símbolo.'
      );
      setPasswordError(true);
      return;
    }

    try {
      const response = await fetch(
        'https://vc-su7z.onrender.com/verify-password-reset-code',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, inputCode }),
        }
      );

      if (response.status === 200) {
        await changePassword();
      } else {
        setMessage('Código de verificación incorrecto.');
        setCodeError(true);
      }
    } catch (error) {
      setMessage('Error al verificar el código.');
      setCodeError(true);
    } finally {
      setLoading(false); // Ocultar spinner
    }
  };

  const changePassword = async () => {
    try {
      const response = await fetch(
        'https://vc-su7z.onrender.com/change-password',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, newPassword }),
        }
      );

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
    <div id="recuperar-prin">
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
                className={emailError ? 'error' : ''}
              />
            </div>
            <button id="recuperar-btn" type="submit">
              {loading ? <div className="spinner"></div> : 'Enviar'}{' '}
              {/* Spinner */}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCodeAndChangePassword}>
            <div>
              <label htmlFor="inputCode">Código de Verificación:</label>
              <input
                type="text"
                id="inputCode"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                className={codeError ? 'error' : ''}
              />
            </div>
            <div>
              <label htmlFor="newPassword">Contraseña Nueva:</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={passwordError ? 'error' : ''}
              />
            </div>
            <div>
              <label htmlFor="repeatPassword">Repite Contraseña:</label>
              <input
                type="password"
                id="repeatPassword"
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                className={repeatPasswordError ? 'error' : ''}
              />
            </div>
            <button type="submit">
              {loading ? <div className="spinner"></div> : 'Cambiar Contraseña'}{' '}
              {/* Spinner */}
            </button>
          </form>
        )}
        {message && <p>{message}</p>}
      </div>
    </div>
  );
};

export default Recuperar;
