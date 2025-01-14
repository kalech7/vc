import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Modal from 'react-modal';
import '../estilos/estilos_dashboard.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import HeaderD from '../dashboard/HeaderDashboard.js';
import FooterD from '../dashboard/FooterDashboard.js';
import PayPalButton from './PaypalButton.js';
import CarouselD from './caruselD.jsx';

Modal.setAppElement('#root');

const UserDashboard = ({ user }) => {
  const [menuOpen, setMenuOpen] = useState(true);
  const [amount, setAmount] = useState('');
  const [selectedAccount, setSelectedAccount] = useState(null); // Estado para la cuenta seleccionada
  const [userState, setUserState] = useState(() => {
    const storedUser = localStorage.getItem(`user_${user.nodocumento}`);
    return storedUser ? JSON.parse(storedUser) : user;
  });
  const [isLoading, setLoading] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [cuentas, setCuentas] = useState([]);
  const [modalRecargaIsOpen, setModalRecargaIsOpen] = useState(false); // Estado para el modal de recarga
  const carouselRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo(0, 0);
    }

    const fetchCuentas = async () => {
      try {
        const response = await fetch(
          `http://localhost:3030/clientes/${userState.nodocumento}/cuentas`
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

  const handleAmountChange = (e) => {
    const value = e.target.value;
    setAmount(value);
    console.log('Monto ingresado:', value);
  };

  const handlePaymentSuccess = async (details) => {
    const newAmount = parseFloat(amount);
    if (newAmount >= 1) {
      alert(`Transacción completada por ${details.payer.name.given_name}`);
  
      const updatedSaldo = parseFloat(selectedAccount.saldo) + newAmount; // Actualiza el saldo de la cuenta seleccionada
  
      // Imprimir el valor y tipo de userState.cuentas para depuración
      console.log('userState.cuentas:', userState.cuentas);
      console.log('Tipo de userState.cuentas:', typeof userState.cuentas);
  
      // Verificar si cuentas es un array antes de usar map
      const updatedUser = {
        ...userState,
        cuentas: Array.isArray(userState.cuentas) 
          ? userState.cuentas.map((cuenta) =>
              cuenta.numeroCuenta === selectedAccount.numeroCuenta
                ? { ...cuenta, saldo: updatedSaldo }
                : cuenta
            )
          : [],
      };
  
      setUserState(updatedUser);
      localStorage.setItem(
        `user_${user.nodocumento}`,
        JSON.stringify(updatedUser)
      );
  
      setLoading(true);
  
      const date = new Date();
      const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date
        .getHours()
        .toString()
        .padStart(2, '0')}:${date
        .getMinutes()
        .toString()
        .padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
  
      try {
        const response = await fetch(
          'http://localhost:3030/transacciones/recarga',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              numeroCuenta: selectedAccount.numeroCuenta, // Usar la cuenta seleccionada
              monto: newAmount,
              saldo: updatedSaldo,
              fecha: formattedDate,
            }),
          }
        );
  
        if (!response.ok) {
          throw new Error('Error al registrar la recarga');
        }
  
        const userDataResponse = await fetch(
          `http://localhost:3030/clientes/${userState.nodocumento}`
        );
        if (!userDataResponse.ok) {
          throw new Error('Error al obtener los datos actualizados del usuario');
        }
  
        const userData = await userDataResponse.json();
        setUserState(userData);
        setCuentas(userData.cuentas); // Actualiza las cuentas con los datos actualizados
        localStorage.setItem(
          `user_${user.nodocumento}`,
          JSON.stringify(userData)
        );
      } catch (error) {
        console.error('Error al registrar la recarga:', error);
      } finally {
        setLoading(false);
        setModalRecargaIsOpen(false); // Cierra el modal de recarga después de completar la transacción
      }
    } else {
      alert('El monto debe ser mayor a 100 para recargar.');
    }
  };
  

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const openModalRecarga = () => {
    setModalRecargaIsOpen(true);
  };

  const closeModalRecarga = () => {
    setModalRecargaIsOpen(false);
  };

  const handleAccept = async () => {
    try {
      alert('Has aceptado los términos y condiciones.');

      const generarNumeroCuenta = () => {
        return (
          '18' + Math.floor(1000000000 + Math.random() * 9000000000).toString()
        );
      };

      const nuevaCuenta = {
        numeroCuenta: generarNumeroCuenta(),
        saldo: 0,
        estado: 'activado',
      };

      if (!userState || !userState.nodocumento) {
        throw new Error('No se pudo obtener el ID del usuario.');
      }

      const nodocumento = userState.nodocumento;
      console.log('UserDocument:', nodocumento);

      const response = await fetch(
        `http://localhost:3030/clientes/${nodocumento}/cuentas`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(nuevaCuenta),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Error al crear la nueva cuenta: ${
            errorData.error || response.statusText
          }`
        );
      }

      const cuentaCreada = await response.json();
      setCuentas([...cuentas, cuentaCreada]);

      const updatedUser = {
        ...userState,
        cuentas: [...userState.cuentas, cuentaCreada],
      };

      setUserState(updatedUser);
      localStorage.setItem(
        `user_${user.nodocumento}`,
        JSON.stringify(updatedUser)
      );

      console.log('Nueva cuenta creada:', cuentaCreada);
    } catch (error) {
      console.error('Error al crear la nueva cuenta:', error.message);
      alert(`Hubo un error creando la nueva cuenta: ${error.message}`);
    }

    closeModal();
  };

  const handleDecline = () => {
    alert('Has rechazado los términos y condiciones.');
    closeModal();
  };

  const handleNext = () => {
    if (carouselRef.current) {
      const itemWidth = carouselRef.current.children[0].clientWidth;
      const maxIndex = cuentas.length - 1;
      const newIndex = Math.min(currentIndex + 1, maxIndex);
      setCurrentIndex(newIndex);
      carouselRef.current.style.transform = `translateX(-${
        itemWidth * newIndex
      }px)`;
    }
  };

  const handlePrev = () => {
    if (carouselRef.current) {
      const itemWidth = carouselRef.current.children[0].clientWidth;
      const newIndex = Math.max(currentIndex - 1, 0);
      setCurrentIndex(newIndex);
      carouselRef.current.style.transform = `translateX(-${
        itemWidth * newIndex
      }px)`;
    }
  };
  return (
    <>
      <HeaderD user={userState} setUserState={setUserState} />
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
          {isLoading ? (
            <p>Cargando...</p>
          ) : userState ? (
            <>
              <h1>{`Bienvenido, ${userState.nombre}`}</h1>
              <h2>Mis productos</h2>
              <div className="cuentas-carousel-container">
                <button className="carousel-button left" onClick={handlePrev}>
                  &lt;
                </button>
                <div className="cuentas-carousel" ref={carouselRef}>
                  {cuentas.length > 0 ? (
                    cuentas.map((cuenta, index) => (
                      <div key={index} className="cuenta-item">
                        <div className="info-box">
                          <div className="info-label">Número de Cuenta</div>
                          <div className="info-value">
                            {cuenta.numeroCuenta}
                          </div>
                        </div>
                        <div className="separator"></div>
                        <div className="info-box">
                          <div className="info-label">Saldo disponible</div>
                          <div className="info-value">{`$${parseFloat(
                            cuenta.saldo
                          ).toFixed(2)}`}</div>
                        </div>
                        <div className="info-box-dos">
                          <div className="info-label-dos">Saldo contable</div>
                          <div className="info-value-dos">{`$${parseFloat(
                            cuenta.saldo
                          ).toFixed(2)}`}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No tienes cuentas disponibles.</p>
                  )}
                </div>
                <button className="carousel-button right" onClick={handleNext}>
                  &gt;
                </button>
              </div>
              <div className="open-account-button">
                <br></br>
                <button onClick={openModal} className="btn-abrir-cuentaa">
                  ¿Quieres abrir otra cuenta?
                </button>
              </div>
              <div className="payment-section">
                <h2>Recargar dinero</h2>
                <button onClick={openModalRecarga} className="btn-recarga">
                  Selecciona una cuenta para recargar
                </button>
              </div>
              {selectedAccount && (
                <div className="recarga-form">
                  <p>
                    Se realizará la recarga a la cuenta:{' '}
                    {selectedAccount.numeroCuenta}
                  </p>
                  <input
                    type="number"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="Ingresa el monto"
                    className="amount-input"
                  />
                  <PayPalButton
                    amount={amount}
                    onSuccess={handlePaymentSuccess}
                  />
                </div>
              )}
              <h2>Productos Próximamente</h2>
              <CarouselD />
            </>
          ) : (
            <p>No se han proporcionado datos de usuario.</p>
          )}
        </div>
      </div>
      <FooterD />

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Términos y Condiciones"
        className="modal"
        overlayClassName="overlay"
      >
        <h2>Términos y Condiciones</h2>
        <p>Por favor, acepta los términos y condiciones para continuar.</p>
        <div className="modal-buttons">
          <button onClick={handleAccept} className="btn-aceptar">
            Aceptar
          </button>
          <button onClick={handleDecline} className="btn-rechazar">
            Rechazar
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={modalRecargaIsOpen}
        onRequestClose={closeModalRecarga}
        contentLabel="Selecciona una cuenta para recargar"
        className="modal"
        overlayClassName="overlay"
      >
        <h2>Selecciona una cuenta para recargar</h2>
        {cuentas.length > 0 ? (
          <div className="cuentas-lista">
            {cuentas.map((cuenta, index) => (
              <button
                key={index}
                className="cuenta-boton"
                onClick={() => {
                  setSelectedAccount(cuenta);
                  closeModalRecarga();
                }}
              >
                {cuenta.numeroCuenta}
              </button>
            ))}
          </div>
        ) : (
          <p>No tienes cuentas disponibles.</p>
        )}
        <div className="modal-buttons">
          <button onClick={closeModalRecarga} className="btn-rechazar">
            Cancelar
          </button>
        </div>
      </Modal>
    </>
  );
};

export default UserDashboard;
