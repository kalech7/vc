import React, { useState, useEffect } from 'react';
import '../estilos/estilos_transferencias.css';
import Header from '../dashboard/HeaderDashboard';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Modal from 'react-modal';
import QRCode from 'qrcode.react';

const Transferencias = ({ user }) => {
  const [menuOpen, setMenuOpen] = useState(true);
  const [userState, setUserState] = useState(() => {
    const storedUser = localStorage.getItem(`user_${user.nodocumento}`);
    return storedUser ? JSON.parse(storedUser) : user;
  });
  const [cuentaDestino, setCuentaDestino] = useState('');
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [errorMonto, setErrorMonto] = useState('');
  const [transferenciaRealizada, setTransferenciaRealizada] = useState(false);
  const [message, setMessage] = useState('');
  const [fechaTransaccion, setFechaTransaccion] = useState('');
  const [saldoAnterior, setSaldoAnterior] = useState(userState.saldo);
  const [saldoActual, setSaldoActual] = useState(userState.saldo);
  const [saldoDestino, setSaldoDestino] = useState(0); // Estado para el saldo del destinatario
  const [cuentas, setCuentas] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [isSaldoVisible, setIsSaldoVisible] = useState(true);

  const toggleSaldoVisibility = () => {
    setIsSaldoVisible(!isSaldoVisible);
  };

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo(0, 0);
    }

    const fetchCuentas = async () => {
      try {
        const response = await fetch(
          `https://vc-su7z.onrender.com/clientes/${userState.nodocumento}/cuentas`
        );
        if (!response.ok) {
          throw new Error('Error al obtener las cuentas del usuario');
        }
        const data = await response.json();
        setCuentas(Object.values(data));
      } catch (error) {
        console.error('Error al obtener las cuentas:', error);
      }
    };

    fetchCuentas();
  }, [location, userState.nodocumento]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const consultarDatosCuentaDestino = async () => {
    try {
      const response = await fetch(
        `https://vc-su7z.onrender.com/consultar-cuenta?numeroCuenta=${cuentaDestino}`
      );
      if (response.ok) {
        const data = await response.json();
        setNombre(data.nombre || '');
        setCorreo(data.correo || '');
        setSaldoDestino(data.saldo || 0); // Establecer el saldo del destinatario
        setMessage('');
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

    if (!cuentaDestino.trim()) {
      setMessage('Por favor ingresa una cuenta destino.');
      return;
    }

    await consultarDatosCuentaDestino();
  };

  const handleTransfer = async (e) => {
    e.preventDefault();

    if (!selectedAccount) {
      setMessage('Por favor selecciona una cuenta para transferir.');
      return;
    }

    if (!nombre || !correo || !cuentaDestino || !monto) {
      setMessage('Por favor completa todos los campos requeridos.');
      return;
    }

    const montoFloat = parseFloat(monto);
    if (isNaN(montoFloat) || montoFloat <= 0) {
      setErrorMonto('Por favor ingresa un monto válido.');
      return;
    }

    if (montoFloat > selectedAccount.saldo) {
      setMessage('Saldo insuficiente para realizar la transferencia.');
      return;
    }

    const CorreoV = userState.correo;
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

    const nuevoSaldoActual = selectedAccount.saldo - montoFloat;
    setSaldoActual(nuevoSaldoActual);

    const nuevoSaldoDestino = saldoDestino + montoFloat; // Calcular el nuevo saldo del destinatario
    setSaldoDestino(nuevoSaldoDestino); // Establecer el saldo destino

    try {
      const response = await fetch(
        'https://vc-su7z.onrender.com/send-confirmation-link',
        {
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
            cuentaOrigen: selectedAccount.numeroCuenta,
            saldoAnterior,
            saldoDestino: nuevoSaldoDestino, // Incluir el nuevo saldo destino en la solicitud
            fechaTransaccion: fechaFormateada,
            email: userState.correo,
            nombreOrigen: userState.nombre
          }),
        }
      );

      if (response.ok) {
        setTransferenciaRealizada(true);
        setMessage('Enlace de confirmación enviado a tu correo electrónico.');

        const updatedUser = {
          ...userState,
          saldo: nuevoSaldoActual,
        };
        setUserState(updatedUser);
        localStorage.setItem(
          `user_${user.nodocumento}`,
          JSON.stringify(updatedUser)
        );
      } else {
        setMessage('Error al enviar el enlace de confirmación.');
      }

      const data = await response.json();
      console.log('Respuesta del servidor:', data);
      setMessage(
        `Correo de confirmación de transferencia enviado a ${CorreoV}. Revisa tu bandeja de entrada.`
      );
    } catch (error) {
      console.error('Error al procesar la transferencia:', error);
      setMessage('Error al procesar la transferencia.');
    }
  };

  const transferData = {
    selectedAccount,
    nombre,
    correo,
    monto,
    descripcion,
  };
  const transferDataString = JSON.stringify(transferData);
  const qrData = `https://vertexcapital.today/login?data=${encodeURIComponent(
    transferDataString
  )}`;

  return (
    <div>
      <Header user={userState} />
      <div
        className={`content-container ${menuOpen ? 'menu-open' : ''}`}
        style={{ display: 'flex', flexDirection: 'column', width: '100%' }}
      >
        <button className="menu-toggle" onClick={toggleMenu}>
          <i className="fas fa-bars"></i>
        </button>
        <div
          className="sidebar"
          style={{
            width: menuOpen ? '250px' : '0',
            transition: '0.3s',
            flexShrink: 0,
          }}
        >
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
          <Link to="/tickets" className="button">
            Soporte
          </Link>
        </div>

        <div className="transfer-container">
          <h2 className="transfer-title">Transferencias</h2>

          <h2>Mis productos</h2>

          <div className="info-container-tran">
            {selectedAccount ? (
              <>
                <div className="info-box">
                  <div className="info-label">Número de Cuenta</div>
                  <div className="info-value">
                    {selectedAccount.numeroCuenta}
                  </div>
                </div>
                <div className="separator"></div>
                <div className="info-box">
                  <div className="info-label">
                    Saldo disponible{' '}
                    <FontAwesomeIcon
                      icon={isSaldoVisible ? faEye : faEyeSlash}
                      onClick={toggleSaldoVisibility}
                      style={{ cursor: 'pointer', marginLeft: '10px' }}
                    />
                  </div>
                  <div className="info-value">
                    {isSaldoVisible
                      ? `$${parseFloat(selectedAccount.saldo).toFixed(2)}`
                      : '****'}
                  </div>
                </div>
                <div className="info-box-dos">
                  <div className="info-label-dos">Saldo contable</div>
                  <div className="info-value-dos">
                    {isSaldoVisible
                      ? `$${parseFloat(selectedAccount.saldo).toFixed(2)}`
                      : '****'}
                  </div>
                </div>
              </>
            ) : (
              <p>No has seleccionado una cuenta.</p>
            )}
          </div>

          <button onClick={openModal} className="btn-abrir-cuenta">
            Selecciona una cuenta para transferir
          </button>
          <h3>Codigo Qr para cobrar</h3>
          <div className="qr-code">
            <QRCode value={qrData} size={128} />
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
                    setSaldoDestino(0); // Restablecer el saldo del destinatario
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={handleVerificarCuenta}
                  className="btn-verificar"
                >
                  Verificar
                </button>
              </div>
              <div className="form-group">
                <label htmlFor="nombre">Nombre del Destinatario</label>
                <input
                  type="text"
                  id="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  readOnly
                />
              </div>
              <div className="form-group">
                <label htmlFor="correo">Correo del Destinatario</label>
                <input
                  type="email"
                  id="correo"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  required
                  readOnly
                />
              </div>
              <div className="form-group">
                <label htmlFor="monto">Monto</label>
                <input
                  type="number"
                  id="monto"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  required
                />
                {errorMonto && <p className="error">{errorMonto}</p>}
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
              <button type="submit" className="btn-transferir">
                Transferir
              </button>
            </form>
          ) : (
            <div className="transferencia-exitosa">
              <h3>¡Transferencia realizada con éxito!</h3>
              <p>
                Se ha enviado un correo de confirmación con los detalles de la
                transferencia.
              </p>
              <p>Fecha y hora de la transacción: {fechaTransaccion}</p>
            </div>
          )}

          {message && <p className="message">{message}</p>}
        </div>
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Seleccionar Cuenta"
        className="custom-modal"
        overlayClassName="custom-overlay"
      >
        <h2>Selecciona una cuenta para transferir</h2>
        <div className="cuentas-list">
          {cuentas.map((cuenta) => (
            <button
              key={cuenta.numeroCuenta}
              onClick={() => {
                setSelectedAccount(cuenta);
                closeModal();
              }}
              className={`cuenta-button ${
                selectedAccount === cuenta ? 'selected' : ''
              }`}
            >
              <div>Número de Cuenta: {cuenta.numeroCuenta}</div>
              <div>Saldo: ${parseFloat(cuenta.saldo).toFixed(2)}</div>
            </button>
          ))}
        </div>
        <button onClick={closeModal} className="btn-cerrar-modal">
          Cerrar
        </button>
      </Modal>
    </div>
  );
};

export default Transferencias;
