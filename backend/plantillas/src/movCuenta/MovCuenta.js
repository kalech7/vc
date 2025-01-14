import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import '../estilos/estilos_movCuenta.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Header from '../dashboard/HeaderDashboard.js';
import Footer from '../dashboard/FooterDashboard.js';
import Modal from 'react-modal';
import Grafico from './grafico.jsx';

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
          `http://localhost:3030/clientes/${userState.nodocumento}/cuentas`
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
            `http://localhost:3030/transacciones/${selectedAccount.numeroCuenta}`
          );
          const recargasResponse = await fetch(
            `http://localhost:3030/recargas/${selectedAccount.numeroCuenta}`
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

  return (
    <>
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
          <Link to="/tickets" className="button">
            Soporte
          </Link>
        </div>
        <div className="dashboard">
          {userState ? (
            <>
              <h1>Historial de Transacciones</h1>
              <div className="info-container">
                <div className="info-box">
                  <div className="info-label">Número de Cuenta</div>
                  <div className="info-value">
                    {selectedAccount?.numeroCuenta || 'N/A'}
                  </div>
                </div>
                <div className="separator"></div>
                <div className="info-box">
                  <div className="info-label">Saldo disponible</div>
                  <div className="info-value">{`$${parseFloat(
                    selectedAccount?.saldo || 0
                  ).toFixed(2)}`}</div>
                </div>
                <div className="info-box-dos">
                  <div className="info-label-dos">Saldo contable</div>
                  <div className="info-value-dos">{`$${parseFloat(
                    selectedAccount?.saldo || 0
                  ).toFixed(2)}`}</div>
                </div>
              </div>
              <button onClick={openModal} className="btn-abrir-cuentaaa">
                {selectedAccount
                  ? 'Seleccionaste la cuenta'
                  : 'Selecciona una cuenta'}
              </button>
              <h1>Movimientos</h1>
              <Grafico movimientos={movimientos} recargas={recargas} />
              <div className="actions-container">
                <button onClick={exportToPDF}>Descargar PDF</button>
                <button onClick={exportToCSV}>Descargar CSV</button>
                <button onClick={exportToExcel}>Descargar Excel</button>
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
              <h2>Transferencias</h2>
              <div className="movimientos-container">
                {filteredMovimientos.length > 0 ? (
                  filteredMovimientos.map((mov, index) => (
                    <div key={index}>
                      <div className="movimiento-fecha">{mov.fecha}</div>
                      <div className="movimiento-box">
                        <div className="movimiento-tipo">
                          {mov.tipo === 'Enviado'
                            ? 'Transferencia enviada a'
                            : 'Transferencia recibida por'}{' '}
                          {mov.tipo === 'Enviado'
                            ? mov.cuentaDestino
                            : mov.cuentaOrigen}
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
                          Saldo después de la transacción: ${mov.tipo === 'Enviado' ? mov.saldoActual : mov.saldoDestino}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No se encontraron movimientos.</p>
                )}
              </div>
              <h2>Recargas</h2>
              <div className="movimientos-container">
                {filteredRecargas.length > 0 ? (
                  filteredRecargas.map((rec, index) => (
                    <div key={index}>
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
