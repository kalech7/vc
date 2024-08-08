import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShareAlt } from '@fortawesome/free-solid-svg-icons';
import {
  faFacebook,
  faTwitter,
  faLinkedin,
  faWhatsapp,
} from '@fortawesome/free-brands-svg-icons';

function ConfirmacionTransferencias() {
  const query = new URLSearchParams(useLocation().search);
  const monto = query.get('monto');
  const nombre = query.get('nombre');
  const fecha = query.get('fecha');

  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const socialLinks = [
    { icon: faFacebook, url: 'https://www.facebook.com/sharer/sharer.php?u=https://vertexcapital.today' },
    { icon: faTwitter, url: `https://twitter.com/intent/tweet?url=https://vertexcapital.today&text=Transferencia%20de%20${monto}%20realizada%20a%20${nombre}%20el%20${fecha}` },
    { icon: faLinkedin, url: 'https://www.linkedin.com/shareArticle?mini=true&url=https://vertexcapital.today' },
    { icon: faWhatsapp, url: `https://api.whatsapp.com/send?text=Transferencia%20de%20${monto}%20realizada%20a%20${nombre}%20el%20${fecha}%20https://vertexcapital.today` },
  ];

  return (
    <div>
      <div className="header">
        <h1>Confirmación de Transferencia</h1>
      </div>

      <div className="transfer-container">
        <h2 className="transfer-title">Transferencia Exitosa</h2>

        <div className="info-container-tran">
          <div className="info-box">
            <div className="info-label">Valor:</div>
            <div className="info-value">${monto}</div>
          </div>
          <div className="info-box">
            <div className="info-label">Cuenta destino:</div>
            <div className="info-value">{nombre}</div>
          </div>
          <div className="info-box">
            <div className="info-label">Fecha:</div>
            <div className="info-value">{fecha}</div>
          </div>
          <p>Gracias por utilizar nuestros servicios.</p>
        </div>

        <div className="share-container">
          <button className="share-button" onClick={toggleMenu}>
            <FontAwesomeIcon icon={faShareAlt} /> Compartir
          </button>
          {menuOpen && (
            <div className="share-menu">
              {socialLinks.map((link, index) => (
                <a key={index} href={link.url} target="_blank" rel="noopener noreferrer">
                  <FontAwesomeIcon icon={link.icon} size="2x" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="footer">
        © 2024 VertexCapital. Todos los derechos reservados.
      </div>

      <style jsx>{`
        body {
          font-family: Arial, sans-serif;
          background-color: #f0f2f5;
          margin: 0;
          padding: 0;
        }

        .header {
          background-color: #1c2833;
          color: white;
          padding: 1rem 2rem;
          text-align: center;
        }

        .header h1 {
          margin: 0;
        }

        .transfer-container {
          width: 90%;
          max-width: 600px;
          margin: 5% auto;
          padding: 2rem;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          text-align: center;
        }

        .transfer-title {
          font-size: 24px;
          font-weight: 700;
          color: #1c2833;
          margin-bottom: 1rem;
        }

        .info-container-tran {
          background: linear-gradient(180deg, #b6cde2 0%, #ddba89 100%);
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
        }

        .info-box {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .info-label {
          font-size: 16px;
          font-weight: bold;
          color: #1c2833;
        }

        .info-value {
          font-size: 18px;
          color: #34495e;
        }

        .share-container {
          text-align: center;
          margin-top: 2rem;
        }

        .share-button {
          background-color: #1c2833;
          color: white;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .share-button:hover {
          background-color: #34495e;
        }

        .share-menu {
          margin-top: 1rem;
          display: flex;
          justify-content: center;
          gap: 1rem;
        }

        .footer {
          background-color: #1c2833;
          color: white;
          text-align: center;
          padding: 1rem;
          position: fixed;
          width: 100%;
          bottom: 0;
        }
      `}</style>
    </div>
  );
}

export default ConfirmacionTransferencias;
