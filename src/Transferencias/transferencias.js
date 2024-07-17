import React, { useState, useEffect } from 'react';
import '../estilos/estilos_transferencias.css';
import Header from '../dashboard/HeaderDashboard';
import { Link, useLocation } from 'react-router-dom';

const Transferencias = ({ user }) => {
  const [menuOpen, setMenuOpen] = useState(true);
  const [userState, setUser] = useState(user);
  const [cuentaDestino, setCuentaDestino] = useState('');
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [errorMonto, setErrorMonto] = useState('');
  const [transferenciaRealizada, setTransferenciaRealizada] = useState(false);
  const [message, setMessage] = useState('');
  const [fechaTransaccion, setFechaTransaccion] = useState('');
  const [saldoAnterior, setSaldoAnterior] = useState(user.saldo);
  const [saldoActual, setSaldoActual] = useState(user.saldo);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const location = useLocation();

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo(0, 0);
    }
  }, [location]);

  const consultarDatosCuentaDestino = async () => {
    try {
      const response = await fetch(
        `https://vc-su7z.onrender.com/consultar-cuenta?cuentaDestino=${cuentaDestino}`
      );
      if (response.ok) {
        const data = await response.json();
        setNombre(data.nombre);
        setCorreo(data.correo);
      } else {
        setNombre('');
        setCorreo('');
        setMessage('La cuenta destino no existe.');
      }
    } catch (error) {
      console.error('Error al consultar datos del destinatario:', error);
      setMessage('Error al consultar datos del destinatario.');
    }
  };

  const handleVerificarCuenta = async (e) => {
    e.preventDefault();
    if (!cuentaDestino) {
      setMessage('Por favor ingresa una cuenta destino.');
      return;
    }

    await consultarDatosCuentaDestino();
  };

  const handleTransfer = async (e) => {
    e.preventDefault();

    if (!nombre || !correo || !cuentaDestino || !monto) {
      setMessage('Por favor completa todos los campos requeridos.');
      return;
    }

    const montoFloat = parseFloat(monto);
    if (isNaN(montoFloat) || montoFloat <= 0) {
      setErrorMonto('Por favor ingresa un monto válido.');
      return;
    }

    if (montoFloat > saldoActual) {
      setMessage('Saldo insuficiente para realizar la transferencia.');
      return;
    }

    const CorreoV = user.correo;
    const fechaActual = new Date();
    const fechaFormateada = `${fechaActual.getFullYear()}-${(
      fechaActual.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}-${fechaActual
      .getDate()
      .toString()
      .padStart(2, '0')} ${fechaActual
      .getHours()
      .toString()
      .padStart(2, '0')}:${fechaActual
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${fechaActual
      .getSeconds()
      .toString()
      .padStart(2, '0')}`;
    setFechaTransaccion(fechaFormateada);

    const nuevoSaldoActual = saldoActual - montoFloat;
    setSaldoActual(nuevoSaldoActual);

    try {
      const response = await fetch('https://vc-su7z.onrender.com/send-confirmation-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cuentaDestino,
          nombre,
          correo,
          monto,
          descripcion,
          cuentaOrigen: user.numeroCuenta,
          saldoAnterior,
          saldoActual: nuevoSaldoActual,
          fechaTransaccion: fechaFormateada,
          email: user.correo 
        }),
      });
      if (response.ok) {
        setTransferenciaRealizada(true);
        setMessage('Enlace de confirmación enviado a tu correo electrónico.');
      } else {
        setMessage('Error al enviar el enlace de confirmación desde transferencias.');
      }

      const data = await response.json();
      console.log('Respuesta del servidor:', data);
      setTransferenciaRealizada(true);
      setMessage(`Correo de confirmacion de transferencia enviado a ${CorreoV} revise su bandeja de entrada`)
    } catch (error) {
      console.error('Error al procesar la transferencia:', error);
      setMessage('Error al procesar la transferencia.');
    }
  };

  return (
    <div>
      <Header user={userState} />
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

        <div className="transfer-container">
          <h2 className="transfer-title">Transferencias</h2>

          <h2>Mis productos</h2>
              <div className="info-container-tran">
                <div className="info-box">
                  <div className="info-label">Número de Cuenta</div>
                  <div className="info-value">{userState.numeroCuenta}</div>
                </div>
                <div className="separator"></div>
                <div className="info-box">
                  <div className="info-label">Saldo disponible</div>
                  <div className="info-value">{`$${parseFloat(
                    userState.saldo
                  ).toFixed(2)}`}</div>
                </div>
                <div className="info-box-dos">
                  <div className="info-label-dos">Saldo contable</div>
                  <div className="info-value-dos">{`$${parseFloat(
                    userState.saldo
                  ).toFixed(2)}`}</div>
                </div>
              </div>

          {!transferenciaRealizada ? (
            <form onSubmit={handleTransfer} className="transfer-form">
              <div className="form-group">
                <label htmlFor="cuentaDestino">Cuenta Destino</label>
                <input
                  type="text"
                  id="cuentaDestino"
                  value={cuentaDestino}
                  onChange={(e) => {
                    setCuentaDestino(e.target.value);
                    setNombre('');
                    setCorreo('');
                  }}
                  required
                />
                <button
                  type="button-transferencias"
                  onClick={handleVerificarCuenta}
                >
                  Verificar
                </button>
              </div>
              <div className="form-group">
                <label htmlFor="nombre">Nombre</label>
                <input
                  type="text"
                  id="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="correo">Correo</label>
                <input
                  type="email"
                  id="correo"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="monto">Monto</label>
                <input
                  type="number"
                  id="monto"
                  value={monto}
                  onChange={(e) => {
                    setMonto(e.target.value);
                    setErrorMonto('');
                  }}
                  required
                />
                {errorMonto && <p className="error-message">{errorMonto}</p>}
              </div>
              <div className="form-group">
                <label htmlFor="descripcion">Descripción</label>
                <input
                  type="text"
                  id="descripcion"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                />
              </div>

              <button type="submit-transferencias" id="transfer">
                Realizar Transferencia
              </button>
              <Link to="/dashboard" className="cancel">
                Cancelar Transferencia
              </Link>
            </form>
          ) : (
            <div className="transfer-success">
              <p>{message}</p>
            </div>
          )}
          {message && !transferenciaRealizada && (
            <p className="error-message">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transferencias;
