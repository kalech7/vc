import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../estilos/estilos_perfil.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import HeaderD from '../dashboard/HeaderDashboard.js';
import FooterD from '../dashboard/FooterDashboard.js';

const UserProfile = ({ user }) => {
  const [menuOpen, setMenuOpen] = useState(true);
  const [userState, setUser] = useState(user);
  const [email, setEmail] = useState(user.correo);
  const [phone, setPhone] = useState(user.celular);
  const [isEditing, setIsEditing] = useState(false);
  const [verificationCodeSent, setVerificationCodeSent] = useState(false);
  const [code, setCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [message, setMessage] = useState('');

  const location = useLocation();
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo(0, 0);
    }
  }, [location]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const sendVerificationCode = async () => {
    const generatedCode = Math.floor(100000 + Math.random() * 900000); // Generar código de 6 dígitos
    setCode(generatedCode.toString());

    try {
      await fetch('https://vc-su7z.onrender.com/send-verification-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code: generatedCode }),
      });
      setMessage('Código de verificación enviado.');
      setVerificationCodeSent(true);
    } catch (error) {
      setMessage('Error al enviar el código de verificación.');
    }
  };

  const handleUpdate = async () => {
    if (inputCode !== code) {
      setMessage('Código de verificación incorrecto.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3030/update-user-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          newData: { correo: email, celular: phone },
        }),
      });

      if (response.status === 200) {
        setUser((prevState) => ({
          ...prevState,
          correo: email,
          celular: phone,
        }));
        setIsEditing(false);
        setVerificationCodeSent(false);
        setMessage('Datos actualizados exitosamente.');
      } else {
        setMessage('Error al actualizar los datos.');
      }
    } catch (error) {
      setMessage('Error al actualizar los datos.');
    }
  };

  return (
    <>
      <HeaderD user={userState} />
      <div
        className={`content-container ${menuOpen ? 'menu-open' : ''}`}
        style={{ display: 'flex', flexDirection: 'column', width: '100%' }}
      >
        <button className="menu-toggle" onClick={toggleMenu}>
          <i className="fas fa-bars"></i>
        </button>
        <div
          className="sidebar"
          style={{
            width: menuOpen ? '250px' : '0',
            transition: '0.3s',
            flexShrink: 0,
          }}
        >
          <h2>Menú</h2>
          <Link to="/dashboard" className="button">
            Mis productos
          </Link>
          <Link to="/transferencias" className="button">
            Transferencias
          </Link>
          <Link to="/movCuenta" className="button">
            Tus Movimientos
          </Link>
          <Link to="/perfil" className="button">
            Mi perfil
          </Link>
          <Link to="/tickets" className="button">
            Soporte
          </Link>
        </div>
        <div
          className="dashboard"
          style={{
            flex: 1,
            padding: '20px',
            marginLeft: menuOpen
              ? screenWidth >= 769
                ? '350px'
                : '250px'
              : '0',
            transition: 'margin-left 0.3s',
          }}
        >
          {userState ? (
            <>
              <h1>{`Perfil de ${userState.nombre}`}</h1>
              <div className="info-container">
                <h2>Detalle</h2>
                <div className="info-detail">
                  <h3>Datos Personales</h3>
                  <p>
                    <strong>Número de Documento:</strong>{' '}
                    {userState.nodocumento}
                  </p>
                  <p>
                    <strong>Nombre:</strong> {userState.nombre}
                  </p>
                  <p>
                    <strong>Apellido:</strong> {userState.apellido}
                  </p>
                </div>
                <div className="info-detail">
                  <h3>Datos de Contacto</h3>
                  <p>
                    <strong>Celular:</strong> {userState.celular}
                  </p>
                  <p>
                    <strong>Correo:</strong> {userState.correo}
                  </p>
                </div>
                <div className="info-detail">
                  <h3>Direcciones</h3>
                  <p>
                    <strong>País:</strong> {userState.pais}
                  </p>
                  <p>
                    <strong>Provincia:</strong> {userState.provincia}
                  </p>
                </div>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    style={{
                      marginTop: '30px',
                      backgroundColor: 'rgb(66, 162, 165)', // Color de fondo del botón
                      color: 'white', // Color del texto del botón
                      border: 'none', // Sin borde
                      padding: '10px',
                      textAlign: 'center',
                      textDecoration: 'none',
                      display: 'inline-block',
                      fontSize: '16px',
                      cursor: 'pointer',
                      transition: 'background-color 0.3s',
                      outline: 'none', // Elimina el contorno al enfocar
                      width: '100%', // Ocupa todo el ancho del contenedor
                      borderRadius: '12px',
                    }}
                  >
                    Actualizar Datos
                  </button>
                ) : (
                  <div>
                    <h2>Actualizar Datos</h2>
                    <form>
                      <div className="form-group">
                        <label>Email:</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Número de Teléfono:</label>
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={sendVerificationCode}
                        style={{
                          marginTop: '30px',
                          backgroundColor: 'rgb(66, 162, 165)', // Color de fondo del botón
                          color: 'white', // Color del texto del botón
                          border: 'none', // Sin borde
                          padding: '10px',
                          textAlign: 'center',
                          textDecoration: 'none',
                          display: 'inline-block',
                          fontSize: '16px',
                          cursor: 'pointer',
                          transition: 'background-color 0.3s',
                          outline: 'none', // Elimina el contorno al enfocar
                          width: '100%', // Ocupa todo el ancho del contenedor
                          borderRadius: '12px',
                        }}
                      >
                        Confirmar
                      </button>
                    </form>
                    {verificationCodeSent && (
                      <div>
                        <h3>Ingrese el Código de Verificación</h3>
                        <input
                          type="text"
                          value={inputCode}
                          onChange={(e) => setInputCode(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={handleUpdate}
                          style={{
                            marginTop: '30px',
                            backgroundColor: 'rgb(66, 162, 165)', // Color de fondo del botón
                            color: 'white', // Color del texto del botón
                            border: 'none', // Sin borde
                            padding: '10px',
                            textAlign: 'center',
                            textDecoration: 'none',
                            display: 'inline-block',
                            fontSize: '16px',
                            cursor: 'pointer',
                            transition: 'background-color 0.3s',
                            outline: 'none', // Elimina el contorno al enfocar
                            width: '100%', // Ocupa todo el ancho del contenedor
                            borderRadius: '12px',
                          }}
                        >
                          Verificar y Actualizar
                        </button>
                      </div>
                    )}
                    {message && <p>{message}</p>}
                  </div>
                )}
              </div>
            </>
          ) : (
            <p>No se han proporcionado datos de usuario.</p>
          )}
        </div>
      </div>
      <FooterD />
    </>
  );
};

export default UserProfile;
