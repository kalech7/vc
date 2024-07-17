import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../estilos/estilos_dashboard.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import HeaderD from '../dashboard/HeaderDashboard.js';
import FooterD from '../dashboard/FooterDashboard.js';
import PayPalButton from './PaypalButton.js';

const UserDashboard = ({ user }) => {
  const [menuOpen, setMenuOpen] = useState(true);
  const [amount, setAmount] = useState('');
  const [userState, setUserState] = useState(user); // Corregido: setUserState en lugar de setUser
  const [isLoading, setLoading] = useState(false);

  const location = useLocation();

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo(0, 0);
    }
  }, [location]);

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
    if (newAmount >= 100) {
      alert(`Transacción completada por ${details.payer.name.given_name}`);

      const updatedSaldo = (parseFloat(userState.saldo) + newAmount).toFixed(2);

      // Actualiza el saldo en el estado local
      setUserState((prevUser) => ({
        ...prevUser,
        saldo: updatedSaldo,
      }));

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
        const response = await fetch('https://vc-su7z.onrender.com/transacciones/recarga', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            numeroCuenta: userState.numeroCuenta,
            monto: newAmount,
            saldo: updatedSaldo,
            fecha: formattedDate,
          }),
        });

        if (!response.ok) {
          throw new Error('Error al registrar la recarga');
        }

        // Obtener los datos actualizados del usuario después de la transacción
        const userDataResponse = await fetch(`https://vc-su7z.onrender.com/usuarios/${userState.id}`);
        if (!userDataResponse.ok) {
          throw new Error('Error al obtener los datos actualizados del usuario');
        }

        const userData = await userDataResponse.json();
        setUserState(userData); // Actualizar el estado con los datos más recientes

      } catch (error) {
        console.error('Error al registrar la recarga:', error);
      } finally {
        setLoading(false);
      }
    } else {
      alert('El monto debe ser mayor a 100 para recargar.');
    }
  };

  return (
    <>
      <HeaderD user={userState} />
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
          {isLoading ? (
            <p>Cargando...</p>
          ) : userState ? (
            <>
              <h1>{`Bienvenido, ${userState.nombre}`}</h1>
              <h2>Mis productos</h2>
              <div className="info-container">
                <div className="info-box">
                  <div className="info-label">Número de Cuenta</div>
                  <div className="info-value">{userState.numeroCuenta}</div>
                </div>
                <div className="separator"></div>
                <div className="info-box">
                  <div className="info-label">Saldo disponible</div>
                  <div className="info-value">{`$${parseFloat(userState.saldo).toFixed(2)}`}</div>
                </div>
                <div className="info-box-dos">
                  <div className="info-label-dos">Saldo contable</div>
                  <div className="info-value-dos">{`$${parseFloat(userState.saldo).toFixed(2)}`}</div>
                </div>
              </div>
              <div className="payment-section">
                <h2>Recargar dinero</h2>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="Ejemplo: 100.00"
                  style={{
                    backgroundPosition: 'right',
                    backgroundRepeat: 'no-repeat',
                  }}
                />
                <p className="input-help">
                  Ingrese el monto en formato de dólares. Ejemplo: $100.50 o $100.00
                </p>
                <div className="paypal-button-container">
                  <PayPalButton
                  amount={amount}
                  onSuccess={handlePaymentSuccess}
                  />
                    
                  
                </div>
              </div>
            </>
          ) : (
            <p>No se han proporcionado datos de usuario.</p>
          )}
        </div>
      </div>
      <FooterD />
    </>
  );
};

export default UserDashboard;
