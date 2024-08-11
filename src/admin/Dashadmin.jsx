import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import UserDetails from './UserDetails';
import TransList from './transList';
import Header from './headeradmin'; // Asegúrate de que el nombre del archivo y la importación coincidan
import TicketListAdmin from './TicketList';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faListAlt, faTicketAlt } from '@fortawesome/free-solid-svg-icons';
import '../estilos/estilos_dashadmin.css';

const DashAdmin = ({ admin }) => {
    const [clientesData, setClientesData] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [transacciones, setTransacciones] = useState([]);
    const [showTickets, setShowTickets] = useState(false); // Estado para mostrar los tickets

    useEffect(() => {
        const fetchClientes = async () => {
            try {
                const response = await fetch('https://vc-su7z.onrender.com/clientes');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                console.log('Clientes data:', data);
                setClientesData(data);
            } catch (error) {
                console.error('Error fetching clients:', error);
            }
        };

        const fetchTransacciones = async () => {
            try {
                const response = await fetch('https://vc-su7z.onrender.com/transacciones');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                console.log('Transacciones data:', data);

                // Filtra los campos necesarios
                const filteredTransactions = data.map(trans => ({
                    fecha: trans.fecha,
                    descripcion: trans.descripcion,
                    monto: trans.monto,
                    cuentaDestino: trans.cuentaDestino,
                    saldoAnterior: trans.saldoAnterior,
                    saldoActual: trans.saldoActual,
                    cuentaOrigen: trans.cuentaOrigen // Asegúrate de incluir esta propiedad si la necesitas
                }));

                setTransacciones(filteredTransactions);
            } catch (error) {
                console.error('Error fetching transactions:', error);
            }
        };

        fetchClientes();
        fetchTransacciones();
    }, []);

    

    // Verifica si el cliente seleccionado tiene un número de cuenta
    console.log('Selected User:', selectedUser);
    const filteredTransactions = selectedUser ? transacciones.filter(trans => trans.cuentaOrigen === selectedUser.numeroCuenta) : [];

    console.log('Filtered Transactions:', filteredTransactions);

    return (
        <div>
            <Header admin={admin} />
            <div id="app">
                <Sidebar onSelectUser={setSelectedUser} selectedUser={selectedUser}/>
                
                <UserDetails user={selectedUser} />
                {/* Mostrar TransList solo si hay un cliente seleccionado */}
                
                
            </div>
            
            <TicketListAdmin />

        </div>
    );
};

export default DashAdmin;
