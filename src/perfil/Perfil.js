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
      const response = await fetch('https://vc-su7z.onrender.com/update-user-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, newData: { correo: email, celular: phone } }),
      });

      if (response.status === 200) {
        setUser(prevState => ({
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
      <div className={`content-container ${menuOpen ? 'menu-open' : ''}`}>
        <button className="menu-toggle" onClick={toggleMenu}>
          <i className="fas fa-bars"></i>
        </button>
        <div className="sidebar">
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
        </div>
        <div className="dashboard">
          {userState ? (
            <>
              <h1>{`Perfil de ${userState.nombre}`}</h1>
              <div className="info-container">
                <h2>Detalle</h2>
                <div className="info-detail">
                  <h3>Datos Personales</h3>
                  <p>
                    <strong>Número de Documento:</strong> {userState.nodocumento}
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
                      backgroundColor: '#007bff', // Cambia esto al color de tu página
                      color: '#fff',
                      padding: '10px 20px',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      marginTop: '20px'
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
                          backgroundColor: '#007bff', // Cambia esto al color de tu página
                          color: '#fff',
                          padding: '10px 20px',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          marginTop: '10px'
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
                            backgroundColor: '#007bff', // Cambia esto al color de tu página
                            color: '#fff',
                            padding: '10px 20px',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            marginTop: '10px'
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
