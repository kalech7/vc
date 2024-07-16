import React from 'react';
import logo from '../img/logo_vertex.png';
import '../estilos/estilos_inicio.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { Link } from 'react-router-dom';

const Header = ({ user }) => {
  return (
    <header className="header">
      <nav className="nav container">
        <a href="#" className="nav_logo">
          <img src={logo} className="logo_img" alt="VertexCapital Logo" />
          VertexCapital
        </a>
        <div id="nav-menu" className="nav_menu">
          <div className="nav_list">
            <Link to="/perfil" className="nav_link">
              {user ? `${user.nombre} ${user.apellido}` : 'Usuario'}
            </Link>
            <Link to="/" className="nav_link_inicio">
              Cerrar Sesión
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
