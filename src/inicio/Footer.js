import React from 'react';
import logo from '../img/logo_vertex.png';
import '../estilos/estilos_inicio.css';
import { Link } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <h2>
            <Link to="/" className="nav_logo">
              <img src={logo} className="logo_img" alt="VertexCapital Logo" />
              VertexCapital
            </Link>
          </h2>
        </div>

        <div className="row">
          <div className="footer-col">
            <h4>Mi banco</h4>
            <ul>
              <li>
                <Link to="/Historia">Historia</Link>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Enlaces de interés</h4>
            <ul>
              <li>
                <Link to="/ayuda">Ayuda</Link>
              </li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Sobre nosotros</h4>
            <ul>
              <li>
                <Link to="/informacion">¿Quiénes somos?</Link>
              </li>
              <li>
                <Link to="/ofertas">Lo que ofrecemos</Link>
              </li>
              <li>
                <li>
                  <Link to="/calculadora">Tasas y Tarifas</Link>
                </li>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Síguenos</h4>
            <div className="social-links">
              <button>
                <i className="fab fa-facebook-f"></i>
              </button>
              <button>
                <i className="fab fa-twitter"></i>
              </button>
              <button>
                <i className="fab fa-instagram"></i>
              </button>
              <button>
                <i className="fab fa-linkedin-in"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
