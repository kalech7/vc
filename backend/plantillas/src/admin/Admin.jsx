import React, { useState, useEffect } from 'react';
import "../estilos/estilos_admin.css";
import { useNavigate } from 'react-router-dom';

const Admin = () => { // Verificar que setAdmin es una prop
    const [admin, setAdmin] = useState(null); 
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [blockTime, setBlockTime] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        let timer;
        if (blockTime) {
            timer = setInterval(() => {
                const now = Date.now();
                const timeLeft = Math.max(0, Math.ceil((blockTime - now) / 1000));
                if (timeLeft <= 0) {
                    clearInterval(timer);
                    setBlockTime(null);
                    setMessage('');
                } else {
                    setMessage(`Cuenta bloqueada temporalmente. Intente de nuevo en ${timeLeft} segundos.`);
                }
            }, 1000);
        }

        return () => clearInterval(timer);
    }, [blockTime]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const response = await fetch('http://localhost:3030/loginadmin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (response.status === 200) {
                const data = await response.json();
                console.log('Server response:', data);

                if (data.admin) {
                    setAdmin(data.admin); // Actualiza el estado del admin en App.js
                    setMessage('Inicio de sesión exitoso.');
                    navigate('/dashadmin', { state: { admin: data.admin } });
                } else {
                    setMessage('Error al iniciar sesión.');
                }
            } else if (response.status === 401) {
                setMessage('Contraseña incorrecta.');
            } else if (response.status === 404) {
                setMessage('Usuario no encontrado.');
            } else if (response.status === 403) {
                const retryAfter = 30; // 30 segundos de bloqueo
                setBlockTime(Date.now() + retryAfter * 1000);
            } else {
                setMessage('Error al iniciar sesión.');
            }
        } catch (error) {
            console.error('Error al procesar la respuesta del servidor:', error);
            setMessage('Error al iniciar sesión.');
        }
    };

    return (
        <div className="admin-container">
            <form onSubmit={handleSubmit} className="login-form">
                <div className="form-admin-user">
                    <label htmlFor="username">Usuario</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="form-admin-pass">
                    <label htmlFor="password">Contraseña</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="form-admin-login">
                    <button type="submit">Iniciar Sesión</button>
                </div>
                {message && <div className="form-message">{message}</div>}
            </form>
        </div>
    );
};

export default Admin;
