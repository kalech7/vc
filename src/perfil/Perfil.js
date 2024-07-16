import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../estilos/estilos_perfil.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import HeaderD from '../dashboard/HeaderDashboard.js';
import FooterD from '../dashboard/FooterDashboard.js';

const UserProfile = ({ user }) => {
  const [menuOpen, setMenuOpen] = useState(true);
  const [userState, setUser] = useState(user);

  const location = useLocation();

  useEffect(() => {
    if (!location.hash) {
      // Si no hay un hash en la URL (es decir, si se está navegando a una nueva página)
      window.scrollTo(0, 0); // Desplaza al inicio de la página
    }
  }, [location]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
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
