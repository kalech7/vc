import React, { useState } from 'react';
import '../estilos/UserDetails.css'; // Asegúrate de tener un archivo CSS para los estilos
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrashAlt, faUserMinus } from '@fortawesome/free-solid-svg-icons';
const UserDetails = ({ user }) => {
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [recargas, setRecargas] = useState([]);

  if (!user) {
    return <div className="user-details">Por favor selecciona a un cliente.</div>;
  }

  // Función para obtener transacciones
  const fetchTransactions = async (accountNumber) => {
    try {
      const response = await fetch(`https://vc-su7z.onrender.com/transacciones/${accountNumber}`);
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      } else {
        console.error('No se encontraron transacciones para esta cuenta.');
        setTransactions([]); // Vacía las transacciones si no se encuentran
      }
    } catch (error) {
      console.error('Error al obtener las transacciones:', error);
    }
  };

  // Función para obtener recargas
  const fetchRecargas = async (accountNumber) => {
    try {
      const response = await fetch(`https://vc-su7z.onrender.com/recargas/${accountNumber}`);
      if (response.ok) {
        const data = await response.json();
        setRecargas(data);
      } else {
        console.error('No se encontraron recargas para esta cuenta.');
        setRecargas([]); // Vacía las recargas si no se encuentran
      }
    } catch (error) {
      console.error('Error al obtener las recargas:', error);
    }
  };

  const handleAccountClick = (account) => {
    setSelectedAccount(account);
    fetchTransactions(account.numeroCuenta); // Llama a la función para obtener transacciones
    fetchRecargas(account.numeroCuenta); // Llama a la función para obtener recargas
  };

  const handleAddAccount = async () => {
    try {
      const response = await fetch(`https://vc-su7z.onrender.com/clientes/${user.nombre}/${user.apellido}/cuentas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Cuenta añadida correctamente. Número de cuenta: ${data.cuenta.numeroCuenta}`);
        // Opcional: Recargar las cuentas del usuario para reflejar el cambio
        window.location.reload();
      } else {
        const errorData = await response.json();
        alert(`Error al añadir la cuenta: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error al añadir la cuenta:', error);
      alert('Error al añadir la cuenta.');
    }
  };

  const handleDeleteAccount = async () => {
    if (!selectedAccount) {
      alert('No hay cuenta seleccionada para eliminar.');
      return;
    }

    const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar esta cuenta?');
    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(`https://vc-su7z.onrender.com/clientes/${user.nombre}/${user.apellido}/cuentas/${selectedAccount.numeroCuenta}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Cuenta eliminada correctamente.');
        // Opcional: Recargar las cuentas del usuario para reflejar el cambio
        window.location.reload();
      } else {
        const errorData = await response.json();
        alert(`Error al eliminar la cuenta: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error al eliminar la cuenta:', error);
      alert('Error al eliminar la cuenta.');
    }
  };

  const handleDeleteClient = async () => {
    const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar este cliente?');
    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(`https://vc-su7z.onrender.com/clientes/${user.nombre}/${user.apellido}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Cliente eliminado correctamente.');
        // Opcional: Redirigir a otra vista o recargar la página
        window.location.reload();
      } else {
        const errorData = await response.json();
        alert(`Error al eliminar el cliente: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error al eliminar el cliente:', error);
      alert('Error al eliminar el cliente.');
    }
  };

  // Función para cambiar el estado de la cuenta
  const handleChangeAccountStatus = async (newStatus) => {
    if (!selectedAccount) {
      alert('No hay cuenta seleccionada.');
      return;
    }
  
    try {
      const response = await fetch('https://vc-su7z.onrender.com/updateStatus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: `${user.nombre} ${user.apellido}`,
          numeroCuenta: selectedAccount.numeroCuenta,
          nuevoEstado: newStatus
        })
      });
  
      if (response.ok) {
        const updatedAccount = { ...selectedAccount, estado: newStatus };
        setSelectedAccount(updatedAccount);
        alert(`Estado de la cuenta cambiado a: ${newStatus}`);
      } else {
        const errorData = await response.json();
        alert(`Error al cambiar el estado de la cuenta: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error al cambiar el estado de la cuenta:', error);
      alert('Error al cambiar el estado de la cuenta.');
    }
  };
  

  return (
    <div className="user-details">
      <h2>{user.nombre} {user.apellido}</h2>
      <div className="user-actions">
        <button onClick={handleDeleteClient} className="btn btn-block">
          <FontAwesomeIcon icon={faUserMinus} /> {/* Ícono para eliminar cliente */}
        </button>
      </div>
          <div className="account-container">
      <div className="account-list">
        <p>Cuentas:</p>
        <div className="account-buttons">
          {user.accounts ? Object.entries(user.accounts).map(([key, account]) => (
            <button key={key} onClick={() => handleAccountClick(account)} className="account-button">
              {account.numeroCuenta}
            </button>
          )) : <p>No hay cuentas disponibles.</p>}
        </div>
      </div>
      <button onClick={handleAddAccount} className="btn btn-active">
        <FontAwesomeIcon icon={faPlus} /> {/* Ícono para añadir cuenta */}
      </button>
    </div>
      {selectedAccount && (
        <>
          <div className="transactions-container">
          <span className="account-status">Estado de la cuenta: {selectedAccount.estado}</span>
            <div className="account-status-buttons">
              <button className="btn btn-status btn-activar" onClick={() => handleChangeAccountStatus('Activada')}>Activar</button>
              <button className="btn btn-status btn-revision" onClick={() => handleChangeAccountStatus('En Revisión')}>Revisión</button>
              <button className="btn btn-status btn-bloquear" onClick={() => handleChangeAccountStatus('Bloqueada')}>Bloquear</button>
              {selectedAccount && (
                <button onClick={handleDeleteAccount} className="btn btn-block">
                  <FontAwesomeIcon icon={faTrashAlt} /> {/* Ícono para eliminar cuenta */}
                </button>
              )}
            </div>
            <h3>Lista de Transacciones</h3>
            <table className="transaction-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Descripción</th>
                  <th>Monto</th>
                  <th>Cuenta Destino</th>
                  <th>Saldo Anterior</th>
                  <th>Saldo Actual</th>
                  <th>Tipo</th> {/* Añadir columna para el tipo de transacción */}
                </tr>
              </thead>
              <tbody>
                {/* Mapeo de transacciones */}
                {transactions.map((transaction, index) => (
                  <tr key={`trans-${index}`}>
                    <td>{transaction.fecha}</td>
                    <td>{transaction.descripcion}</td>
                    <td>{transaction.monto}</td>
                    <td>{transaction.cuentaDestino}</td>
                    <td>{transaction.saldoAnterior}</td>
                    <td>{transaction.saldoActual}</td>
                    <td>Transferencia</td>
                  </tr>
                ))}
                {/* Mapeo de recargas */}
                {recargas.map((recarga, index) => (
                  <tr key={`recarga-${index}`}>
                    <td>{recarga.fecha}</td>
                    <td>{recarga.descripcion}</td>
                    <td>{recarga.monto}</td>
                    <td>{recarga.numeroCuenta}</td> {/* Mostrar numeroCuenta en cuentaDestino */}
                    <td>{recarga.saldoAnterior}</td>
                    <td>{recarga.saldo}</td> {/* Mostrar saldo en saldoActual */}
                    <td>Recarga</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default UserDetails;
