import React, { useState, useEffect, useContext } from 'react';
import logo from '../img/logo_vertex.png';
import '../estilos/estilos_inicio.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { Link, useLocation } from 'react-router-dom';
import { MagicTabSelect } from 'react-magic-motion';
import { ThemeContext } from '../context/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon, faSun, faBars } from '@fortawesome/free-solid-svg-icons';

const Header = () => {
  const [hoveredIndex, setHoveredIndex] = useState();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useContext(ThemeContext);

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo(0, 0);
    }
  }, [location]);

  const navLinks = [
    { text: 'Inicio', to: '/' },
    { text: 'Inversiones', to: '/calculadora' },
    { text: 'Servicios', to: '/ofertas' },
    { text: 'Equipo', to: '/equipo' },
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
          transition={{ type: 'spring', bounce: 0.4 }}
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
        <div className="nav_toggle" onClick={() => setMenuOpen(!menuOpen)}>
          <FontAwesomeIcon icon={faBars} />
        </div>
        <ul className={`nav_list ${menuOpen ? 'active' : ''}`}>
          {linksComponents}
          <li>
            <Link to="/login" className="nav_link_inicio">
              Banca Online
            </Link>
          </li>
          <li>
            <button
              onClick={toggleTheme}
              className="theme-toggle-button"
              style={{
                backgroundColor: theme === 'light' ? '#1780EB' : '#EBAA76',
                color: theme === 'light' ? '#FFF' : '#000',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor =
                  theme === 'light' ? '#0F6BCB' : '#D68F5E';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor =
                  theme === 'light' ? '#1780EB' : '#EBAA76';
              }}
            >
              <FontAwesomeIcon
                icon={theme === 'light' ? faMoon : faSun}
                style={{ color: theme === 'light' ? '#FFF' : '#000' }}
              />
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
