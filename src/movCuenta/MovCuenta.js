import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Slider from "react-slick";
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import '../estilos/estilos_movCuenta.css';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faHistory, faExchangeAlt, faWallet, faListAlt, faFilePdf, faFileCsv, faFileExcel } from '@fortawesome/free-solid-svg-icons';
import Header from '../dashboard/HeaderDashboard.js';
import Footer from '../dashboard/FooterDashboard.js';
import Modal from 'react-modal';
import Grafico from './grafico.jsx';

const NextArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      style={{ ...style, display: "block", bottom: "-50px" }} // Ajusta la posición
      onClick={onClick}
    >
      Siguiente
    </div>
  );
};

const PrevArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      style={{ ...style, display: "block", bottom: "-50px" }} // Ajusta la posición
      onClick={onClick}
    >
      Anterior
    </div>
  );
};

const UserDashboard = ({ user }) => {
  const [menuOpen, setMenuOpen] = useState(true);
  const [movimientos, setMovimientos] = useState([]);
  const [recargas, setRecargas] = useState([]);
  const [userState, setUserState] = useState(() => {
    const storedUser = localStorage.getItem(`user_${user.id}`);
    return storedUser ? JSON.parse(storedUser) : user;
  });
  const [cuentas, setCuentas] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
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
  }, [location]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  useEffect(() => {
    const fetchCuentas = async () => {
      try {
        const response = await fetch(
          `https://vc-su7z.onrender.com/clientes/${userState.nodocumento}/cuentas`
        );
        if (!response.ok) {
          throw new Error('Error al obtener las cuentas del usuario');
        }
        const data = await response.json();
        const cuentasList = Object.values(data);
        setCuentas(cuentasList);

        if (cuentasList.length > 0) {
          setSelectedAccount(cuentasList[0]);
        }
      } catch (error) {
        console.error('Error al obtener las cuentas:', error);
      }
    };

    fetchCuentas();
  }, [userState.nodocumento]);

  useEffect(() => {
    const obtenerMovimientosYRecargas = async () => {
      if (selectedAccount) {
        try {
          const transaccionesResponse = await fetch(
            `https://vc-su7z.onrender.com/transacciones/${selectedAccount.numeroCuenta}`
          );
          const recargasResponse = await fetch(
            `https://vc-su7z.onrender.com/recargas/${selectedAccount.numeroCuenta}`
          );

          if (!transaccionesResponse.ok) {
            console.error('Error al obtener las transacciones');
            setMovimientos([]);
          } else {
            const transaccionesData = await transaccionesResponse.json();
            const movimientosConSaldo = transaccionesData.map((transaccion) => {
              if (transaccion.cuentaOrigen === selectedAccount.numeroCuenta) {
                transaccion.tipo = 'Enviado';
                transaccion.color = 'gasto';
              } else if (
                transaccion.cuentaDestino === selectedAccount.numeroCuenta
              ) {
                transaccion.tipo = 'Recibido';
                transaccion.color = 'ingreso';
              }
              return transaccion;
            });

            movimientosConSaldo.sort(
              (a, b) => new Date(b.fecha) - new Date(a.fecha)
            );
            setMovimientos(movimientosConSaldo);
          }

          if (!recargasResponse.ok) {
            console.error('Error al obtener las recargas');
            setRecargas([]);
          } else {
            const recargasData = await recargasResponse.json();
            recargasData.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
            setRecargas(recargasData);
          }
        } catch (error) {
          console.error('Error al obtener los movimientos y recargas:', error);
        }
      }
    };

    obtenerMovimientosYRecargas();
  }, [selectedAccount]);

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const confirmDownload = (callback) => {
    if (window.confirm('¿Desea descargar el documento?')) {
      callback();
    }
  };

  const exportToPDF = () => {
    confirmDownload(() => {
      const doc = new jsPDF();
      doc.text('Historial de Transacciones', 10, 10);

      movimientos.forEach((mov, index) => {
        doc.text(
          `Fecha: ${mov.fecha}, Monto: $${mov.monto}, Saldo: $${mov.saldoActual}`,
          10,
          20 + index * 10
        );
      });

      doc.save('transacciones.pdf');
    });
  };

  const exportToCSV = () => {
    confirmDownload(() => {
      const headers = ['Fecha', 'Monto', 'Saldo'];
      const rows = movimientos.map((mov) =>
        [mov.fecha, mov.monto, mov.saldoActual].join(',')
      );

      const csvContent = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.setAttribute('download', 'transacciones.csv');
      link.click();
    });
  };

  const exportToExcel = () => {
    confirmDownload(() => {
      const worksheet = XLSX.utils.json_to_sheet(movimientos);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Movimientos');

      XLSX.writeFile(workbook, 'transacciones.xlsx');
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUserState(null);
    navigate('/login');
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const filteredMovimientos = selectedDate
    ? movimientos.filter((mov) => mov.fecha.startsWith(selectedDate))
    : movimientos;

  const filteredRecargas = selectedDate
    ? recargas.filter((rec) => rec.fecha.startsWith(selectedDate))
    : recargas;

  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />
  };

  return (
    <>
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
        <div
          className="dashboard"
          style={{
            flex: 1,
            padding: '20px',
            marginLeft: menuOpen
              ? screenWidth >= 769
                ? '350px'
                : '250px'
              : '0',
            transition: 'margin-left 0.3s',
          }}
        >
          {userState ? (
            <>
              <h1>
                <FontAwesomeIcon icon={faHistory} style={{ marginRight: '10px' }} />
                Historial de Transacciones
              </h1>
              <div className="info-container">
                <div className="info-box">
                  <div className="info-label">Número de Cuenta</div>
                  <div className="info-value">
                    {selectedAccount?.numeroCuenta || 'N/A'}
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
                      ? `$${parseFloat(selectedAccount?.saldo || 0).toFixed(2)}`
                      : '****'}
                  </div>
                </div>
                <div className="info-box-dos">
                  <div className="info-label-dos">Saldo contable</div>
                  <div className="info-value-dos">
                    {isSaldoVisible
                      ? `$${parseFloat(selectedAccount?.saldo || 0).toFixed(2)}`
                      : '****'}
                  </div>
                </div>
              </div>
              <h2>
                <FontAwesomeIcon icon={faListAlt} style={{ marginRight: '10px' }} />
                Movimientos
              </h2>
              <Grafico movimientos={movimientos} recargas={recargas} />
              <div className="actions-container">
                <button onClick={exportToPDF}>
                  <FontAwesomeIcon icon={faFilePdf} style={{ marginRight: '10px' }} />
                  Descargar PDF
                </button>
                <button onClick={exportToCSV}>
                  <FontAwesomeIcon icon={faFileCsv} style={{ marginRight: '10px' }} />
                  Descargar CSV
                </button>
                <button onClick={exportToExcel}>
                  <FontAwesomeIcon icon={faFileExcel} style={{ marginRight: '10px' }} />
                  Descargar Excel
                </button>
              </div>
              <div>
                <label htmlFor="date-filter">Filtrar por fecha: </label>
                <input
                  type="date"
                  id="date-filter"
                  value={selectedDate}
                  onChange={handleDateChange}
                />
              </div>
              <div className="carousel-container">
                <Slider {...settings}>
                  <div>
                    <h2>
                      <FontAwesomeIcon icon={faExchangeAlt} style={{ marginRight: '10px' }} />
                      Transferencias
                    </h2>
                    <div className="carousel-section">
                      {filteredMovimientos.length > 0 ? (
                        filteredMovimientos.map((mov, index) => (
                          <div key={index} className="carousel-item">
                            <div className="movimiento-fecha">{mov.fecha}</div>
                            <div className="movimiento-box">
                            <div className="movimiento-tipo">
                              {mov.tipo === 'Enviado'
                                ? `Transferencia enviada a ${mov.nombreDestino} (Cuenta: ${mov.cuentaDestino})`
                                : `Transferencia recibida por ${mov.nombreOrigen} (Cuenta: ${mov.cuentaOrigen})`}
                            </div>
                              <div
                                className={`movimiento-monto ${
                                  mov.tipo === 'Enviado'
                                    ? 'movimiento-monto-envio'
                                    : 'movimiento-monto-recibido'
                                }`}
                              >
                                <span className="monto-label">
                                  Monto de transferencia:{' '}
                                </span>
                                {mov.tipo === 'Enviado' ? '-' : '+'}${mov.monto}
                              </div>
                              <div className="movimiento-saldo">
                                Saldo después de la transacción: $
                                {mov.tipo === 'Enviado'
                                  ? mov.saldoActual
                                  : mov.saldoDestino}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p>No se encontraron movimientos.</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h2>
                      <FontAwesomeIcon icon={faWallet} style={{ marginRight: '10px' }} />
                      Recargas
                    </h2>
                    <div className="carousel-section">
                      {filteredRecargas.length > 0 ? (
                        filteredRecargas.map((rec, index) => (
                          <div key={index} className="carousel-item">
                            <div className="movimiento-fecha">{rec.fecha}</div>
                            <div className="movimiento-box">
                              <div className="movimiento-tipo">Recargaste</div>
                              <div
                                className={`movimiento-monto recarga-monto-recibido`}
                              >
                                +${rec.monto}
                              </div>
                              <div className="movimiento-saldo">
                                Saldo después de la recarga: ${rec.saldo}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p>No se encontraron recargas.</p>
                      )}
                    </div>
                  </div>
                </Slider>
              </div>
            </>
          ) : (
            <p>Cargando datos del usuario...</p>
          )}
        </div>
      </div>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Seleccionar Cuenta"
        className="custom-modal-select-account"
        overlayClassName="custom-overlay-select-account"
      >
        <h2>Seleccionar Cuenta</h2>
        <ul>
          {cuentas.map((cuenta, index) => (
            <li key={index} onClick={() => setSelectedAccount(cuenta)}>
              {cuenta.numeroCuenta}
            </li>
          ))}
        </ul>
        <button onClick={closeModal} className="close-button">
          Cerrar
        </button>
      </Modal>
      <Footer />
    </>
  );
};

export default UserDashboard;
