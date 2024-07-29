import React from 'react';
import { useLocation } from 'react-router-dom';

function ConfirmacionTransferencias() {
  const query = new URLSearchParams(useLocation().search);
  const monto = query.get('monto');
  const nombre = query.get('nombre');
  const fecha = query.get('fecha');

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
