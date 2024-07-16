import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../estilos/estilos_movCuenta.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Header from '../dashboard/HeaderDashboard.js';
import Footer from '../dashboard/FooterDashboard.js';

const UserDashboard = ({ user }) => {
  const [menuOpen, setMenuOpen] = useState(true);
  const [movimientos, setMovimientos] = useState([]);
  const [recargas, setRecargas] = useState([]);
  const [userState, setUser] = useState(user);

  const location = useLocation();

  useEffect(() => {
    if (!location.hash) {
      // Si no hay un hash en la URL (es decir, si se está navegando a una nueva página)
      window.scrollTo(0, 0); // Desplaza al inicio de la página
    }
  }, [location]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  useEffect(() => {
    const obtenerMovimientosYRecargas = async () => {
      if (user && user.numeroCuenta) {
        try {
          // Obtener transacciones
          const responseTransacciones = await fetch(
            `http://localhost:3030/transacciones/${user.numeroCuenta}`
          );
          const dataTransacciones = await responseTransacciones.json();

          // Obtener recargas
          const responseRecargas = await fetch(
            `http://localhost:3030/recargas/${user.numeroCuenta}`
          );
          const dataRecargas = await responseRecargas.json();

          let saldo = parseFloat(user.saldo); // Inicializamos el saldo con el saldo del usuario

          // Iteramos sobre las transacciones para calcular el saldo actualizado
          const movimientosConSaldo = dataTransacciones.map((transaccion) => {
            const monto = parseFloat(transaccion.monto);
            if (transaccion.cuentaOrigen === user.numeroCuenta) {
              saldo -= monto;
              transaccion.tipo = 'Enviado';
              transaccion.color = 'gasto';
            } else if (transaccion.cuentaDestino === user.numeroCuenta) {
              saldo += monto;
              transaccion.tipo = 'Recibido';
              transaccion.color = 'ingreso';
            }
            transaccion.saldoActual = saldo.toFixed(2); // Actualizamos el saldo actual en la transacción
            return transaccion;
          });

          // Ordenar movimientos por fecha descendente
          movimientosConSaldo.sort(
            (a, b) => new Date(b.fecha) - new Date(a.fecha)
          );

          setMovimientos(movimientosConSaldo);

          // Ordenar recargas por fecha descendente
          dataRecargas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
          setRecargas(dataRecargas);
        } catch (error) {
          console.error('Error al obtener los movimientos y recargas:', error);
        }
      }
    };

    obtenerMovimientosYRecargas();
  }, [user]);

  return (
    <>
      <Header user={user} />
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
        <div className="dashboard">
          {user ? (
            <>
              <h1>Historial de Transacciones</h1>
              <div className="info-container">
                <div className="info-box">
                  <div className="info-label">Número de Cuenta</div>
                  <div className="info-value">{user.numeroCuenta}</div>
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
              <Link to="/transferencias" className="nav_link_mov">
                Transferir dinero
              </Link>
              <h1>Movimientos</h1>
              <h2>Trasferencias</h2>
              <div className="movimientos-container">
                {movimientos.length > 0 ? (
                  movimientos.map((mov, index) => (
                    <div key={index}>
                      <div className="movimiento-fecha">{mov.fecha}</div>
                      <div className="movimiento-box">
                        <div className="movimiento-numCuenta">
                          Transferencia Directa de Nro. de Cuenta:{' '}
                          {mov.cuentaOrigen}
                        </div>
                        <div
                          className={`movimiento-monto ${
                            mov.tipo === 'Enviado' ? 'gasto' : 'ingreso'
                          }`}
                        >
                          Monto: ${mov.monto}
                        </div>
                        <div className="movimiento-saldoActual">
                          Saldo anterior: ${mov.saldoAnterior}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No hay movimientos para mostrar.</p>
                )}
              </div>
              <h2>Recargas</h2>
              <div className="movimientos-container">
                {recargas.length > 0 ? (
                  recargas.map((recarga, index) => (
                    <div key={index}>
                      <div className="movimiento-fecha">{recarga.fecha}</div>
                      <div className="movimiento-box">
                        <div className="movimiento-numCuenta">
                          Recarga a la Cuenta Nro.: {recarga.numeroCuenta}
                        </div>
                        <div className="movimiento-monto ingreso">
                          Monto: ${recarga.monto}
                        </div>
                        <div className="movimiento-saldoActual">
                          Saldo después de la recarga: ${recarga.saldo}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No hay recargas para mostrar.</p>
                )}
              </div>
              <Link to="#" className="nav_link_mov">
                Continuar
              </Link>
            </>
          ) : (
            <p>No se han proporcionado datos de usuario.</p>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default UserDashboard;
