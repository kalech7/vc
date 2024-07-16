import React, { useState, useEffect } from 'react'; // Importar useState desde React
import logo from '../img/logo_vertex.png';
import '../estilos/estilos_inicio.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { Link, useLocation } from 'react-router-dom';
import { MagicTabSelect } from 'react-magic-motion';

const Header = () => {
  const [hoveredIndex, setHoveredIndex] = useState(); 

  const location = useLocation();
  useEffect(() => {
    if (!location.hash) {
      // Si no hay un hash en la URL (es decir, si se está navegando a una nueva página)
      window.scrollTo(0, 0); // Desplaza al inicio de la página
    }
  }, [location]);

  const navLinks = [
    { text: 'Inicio', to: '/' },
    { text: 'Inversiones', to: '/calculadora' },
    { text: 'Servicios', to: '/ofertas' },
  ];

  const linksComponents = navLinks.map((link, i) => (
    <div
      key={link.text}
      onMouseEnter={() => setHoveredIndex(i)}
      style={{
        position: 'relative',
        padding: '0.55rem 0.8rem',
        backgroundColor: '#1c2833ff',
        color: 'white',
        border: 0,
        zIndex: 0,
        borderRadius: '999px',
        
      }}
    >
      {hoveredIndex === i && (
        <MagicTabSelect
          id="navLinks"
          transition={{ type: "spring", bounce: 0.4}}
        >
          <span
            style={{
              borderRadius: '999px',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: -1,
              backgroundColor: '#826868',
              mixBlendMode: 'difference',
              textAlign: 'center',
            }}
          />
        </MagicTabSelect>
      )}
      <Link
        to={link.to}
        className={`nav_link ${link.specialClass || ''}`}
        style={{ color: 'inherit', position: 'relative', zIndex: 1 }}
      >
        {link.text}
      </Link>
    </div>
  ));

  return (
    <header className="header">
      <nav className="nav container">
      <Link to="/" className="nav_logo">
          <img src={logo} className="logo_img" alt="VertexCapital Logo" />
          VertexCapital
        </Link>
        <div >
          <div style={{ display: 'flex', gap: ' 1.5rem ' }}>
            {linksComponents}
            <Link to="/login" className="nav_link_inicio">
              Banca Online
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
