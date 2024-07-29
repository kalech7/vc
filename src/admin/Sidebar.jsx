import React, { useState, useEffect } from 'react';

const Sidebar = ({ onSelectUser }) => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchClientes = async () => {
            try {
                const response = await fetch('http://localhost:3030/clientes');
                if (!response.ok) throw new Error('Error fetching clients');
                const data = await response.json();
                setUsers(data);
            } catch (error) {
                console.error('Error fetching clients:', error);
            }
        };

        fetchClientes();
    }, []);

    const handleUserClick = async (user) => {
        try {
            const response = await fetch(`http://localhost:3030/clientes/${user.nombre}/${user.apellido}/cuentas`);
            if (!response.ok) throw new Error('Error fetching accounts');
            const accounts = await response.json();
            onSelectUser({ ...user, accounts });
        } catch (error) {
            console.error('Error fetching accounts:', error);
        }
    };

    return (
        <aside id="sidebar">
            <ul id="user-list">
                {users.map(user => (
                    <li
                        key={user.id} // Usar el ID proporcionado por Firebase
                        id="user-item"
                        onClick={() => handleUserClick(user)}
                    >
                        <div>
                            <strong>{user.nombre} {user.apellido}</strong>
                        </div>
                        <span>{user.numeroCuenta}</span>
                    </li>
                ))}
            </ul>
        </aside>
    );
};

export default Sidebar;
