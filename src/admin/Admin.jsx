import React, { useState } from "react";
import { Link } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import '../estilos/estilos_admin.css';
const Admin = () => {
    return (
        <div className="admin-container">
            <form action="/login" method="post" className="login-form">
            <div className="form-admin-user">
                <label htmlFor="username">Usuario</label>
                <input type="text" id="username" name="username" required />
            </div>
            <div className="form-admin-pass">
                <label htmlFor="password">Contraseña</label>
                <input type="password" id="password" name="password" required />
            </div>
            <div className="form-admin-login">
                <button type="submit">Iniciar Sesión</button>
            </div>
            </form>
        </div>
    );
};

export default Admin;
