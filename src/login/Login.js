import React, { useState, useEffect } from 'react';
import '../estilos/estilos_login.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../inicio/Header.js';
import Footer from '../inicio/Footer.js';

const Login = ({ setUser }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [blockTime, setBlockTime] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (blockTime) {
      timer = setInterval(() => {
        const now = Date.now();
        const timeLeft = Math.max(0, Math.ceil((blockTime - now) / 1000));
        if (timeLeft <= 0) {
          clearInterval(timer);
          setBlockTime(null);
          setMessage('');
        } else {
          setMessage(`Cuenta bloqueada temporalmente. Intente de nuevo en ${timeLeft} segundos.`);
        }
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [blockTime]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('http://localhost:3030/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.status === 200) {
        const data = await response.json();
        console.log('Server response:', data); // Verificar la respuesta del servidor

        if (data.user) {
          setUser(data.user); // Actualiza el estado del usuario en App.js
          setMessage('Inicio de sesión exitoso.');
          navigate('/dashboard'); // Redirigir al dashboard
        } else {
          setMessage('Error al iniciar sesión.');
        }
      } else if (response.status === 401) {
        setMessage('Contraseña incorrecta.');
      } else if (response.status === 404) {
        setMessage('Usuario no encontrado.');
      } else if (response.status === 403) {
        const retryAfter = 30; // 30 segundos de bloqueo
        setBlockTime(Date.now() + retryAfter * 1000);
      } else {
        setMessage('Error al iniciar sesión.');
      }
    } catch (error) {
      console.error('Error al procesar la respuesta del servidor:', error);
      setMessage('Error al iniciar sesión.');
    }
  };

  const handleChangeUsername = (event) => {
    setUsername(event.target.value);
  };

  const handleChangePassword = (event) => {
    setPassword(event.target.value);
  };

  return (
    <div>
    <div className="login-container">
      <Header user={null} /> {/* Pasar null inicialmente */}
      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label htmlFor="username">Usuario</label>
          <input
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={handleChangeUsername}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={handleChangePassword}
            required
          />
        </div>
        <div className="form-group">
          <button type="submit">Iniciar Sesión</button>
        </div>
        {message && (
          <div className="error-message-container slide-in-from-left">
            <p className="error-message">{message}</p>
          </div>
        )}
        <div className="form-group">
          <Link to="/recuperar" className="link-button">
            <span type="button">¿Olvidaste tu Contraseña?</span>
          </Link>
        </div>
        <div className="form-group center-text">
          <span type="text">¿Aún no eres cliente?</span>
        </div>
        <div className="form-group">
          <Link to="/registro" className="link-button">
            <button type="button">Regístrate</button>
          </Link>
        </div>
      </form>
      
    </div>
    <Footer />
    </div>
  );
};

export default Login;
