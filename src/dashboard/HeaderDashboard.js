import React from 'react';
import logo from '../img/logo_vertex.png';
import '../estilos/estilos_inicio.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { Link } from 'react-router-dom';

const Header = ({ user, setUserState }) => {
  const handleLogout = () => {
    if (user) {
      localStorage.removeItem(`user_${user.id}`); // Elimina los datos del usuario del localStorage basado en su id único
      setUserState(null); // Actualiza el estado de usuario a null en el componente padre
    }
  };

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
            <Link to="/" className="nav_link_inicio" onClick={handleLogout}>
              <span className="nav_text">Cerrar Sesión </span>
              <i className="fas fa-sign-out-alt nav_icon"></i>
            </Link>
          </div>
        </div>
        <div className="mobile_logout">
          <Link to="/" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;
