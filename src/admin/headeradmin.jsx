import React, { useState } from 'react';
import logo from '../img/logo_vertex.png';
import '../estilos/estilos_inicio.css';
import { Link } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Header = ({ userName, onLogout, users = [], onSelectUser }) => {
    const [search, setSearch] = useState('');

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <header className="header">
            <nav className="nav container">
                <a href="#" className="nav_logo">
                    <img src={logo} className="logo_img" alt="VertexCapital Logo" />
                    VertexCapital
                </a>
                <div id="nav-menu" className="nav_menu">
                    <div className="nav_list">
                        <div className="search-container">
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                            <ul className="search-results">
                                {filteredUsers.map(user => (
                                    <li
                                        key={user.id} // Usar un identificador único para las llaves
                                        onClick={() => {
                                            onSelectUser(user);
                                            setSearch('');
                                        }}
                                    >
                                        {user.name}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <Link to="/perfil" className="nav_link">
                        Hola, 
                             {userName || 'admin'}
                        </Link>
                        <Link to="/" className="nav_link_inicio" onClick={onLogout}>
                            Cerrar Sesión
                        </Link>
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Header;
