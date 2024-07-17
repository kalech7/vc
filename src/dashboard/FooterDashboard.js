import React from 'react';
import logo from '../img/logo_vertex.png';
import '../estilos/estilos_dashboard.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <h2>
            <a href="#" className="nav_logo">
              <img src={logo} className="logo_img" alt="VertexCapital Logo" />©
              VertexCapital. Todos los derechos reservados.
            </a>
          </h2>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
