import React, { useState, useEffect } from 'react';
import HeaderD from '../dashboard/HeaderDashboard.js';
import { Link } from 'react-router-dom';
import '../estilos/estilos_tickets.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle, faListAlt, faTicketAlt } from '@fortawesome/free-solid-svg-icons';

const Tickets = ({ user }) => {
  const [menuOpen, setMenuOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('create');
  const [asunto, setAsunto] = useState('');
  const [tipoProblema, setTipoProblema] = useState('');
  const [fechaTransaccion, setFechaTransaccion] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tickets, setTickets] = useState([]);

  const userState = useState(() => {
    const storedUser = localStorage.getItem(`user_${user.id}`);
    return storedUser ? JSON.parse(storedUser) : user;
  })[0];

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch(
          `https://vc-su7z.onrender.com/tickets?usuario=${userState.username}`
        );
        if (!response.ok) {
          throw new Error('Error al obtener los tickets');
        }
        const data = await response.json();
        setTickets(data);
      } catch (error) {
        console.error('Error al obtener los tickets:', error);
      }
    };

    fetchTickets();
  }, [userState.username]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fechaActual = new Date();
    const fechaFormateada = `${fechaActual.getFullYear()}-${(
      fechaActual.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}-${fechaActual
      .getDate()
      .toString()
      .padStart(2, '0')} ${fechaActual
      .getHours()
      .toString()
      .padStart(2, '0')}:${fechaActual
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${fechaActual
      .getSeconds()
      .toString()
      .padStart(2, '0')}`;
    setFechaTransaccion(fechaFormateada);

    try {
      const response = await fetch('https://vc-su7z.onrender.com/creartickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuario: userState.username,
          nodocumento: userState.nodocumento,
          asunto,
          tipoProblema,
          descripcion,
          FechaTicket: fechaFormateada,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al crear el ticket');
      }

      const data = await response.json();
      console.log('Ticket creado:', data);
      setAsunto('');
      setTipoProblema('');
      setDescripcion('');
      setTickets([...tickets, data]);
    } catch (error) {
      console.error('Error al crear el ticket:', error);
    }
  };

  return (
    <div>
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
          <Link to="/tickets" className="button">
            Soporte
          </Link>
        </div>
      </div>
      <div className="tabs-container">
        <button
          className={`tab ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          <FontAwesomeIcon icon={faPlusCircle} style={{ marginRight: '10px' }} />
          Crear Ticket
        </button>
        <button
          className={`tab ${activeTab === 'view' ? 'active' : ''}`}
          onClick={() => setActiveTab('view')}
        >
          <FontAwesomeIcon icon={faListAlt} style={{ marginRight: '10px' }} />
          Mis Tickets
        </button>
      </div>
      {activeTab === 'create' && (
        <div className="tickets-form">
          <form onSubmit={handleSubmit}>
            <label>
              Asunto:
              <input
                type="text"
                value={asunto}
                onChange={(e) => setAsunto(e.target.value)}
                required
              />
            </label>
            <label>
              Tipo de Problema:
              <select
                value={tipoProblema}
                onChange={(e) => setTipoProblema(e.target.value)}
                required
              >
                <option value="">Selecciona un tipo de problema</option>
                <option value="problemas-de-cuenta">Problemas de cuenta</option>
                <option value="seguridad">Seguridad</option>
                <option value="estado-de-cuenta">Estado de cuenta</option>
                <option value="soporte">Soporte</option>
                <option value="casos-especiales">Otros</option>
              </select>
            </label>
            <label>
              Descripción:
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                required
              />
            </label>
            <button type="submit">
              <FontAwesomeIcon icon={faTicketAlt} style={{ marginRight: '10px' }} />
              Crear Ticket
            </button>
          </form>
        </div>
      )}
      {activeTab === 'view' && (
        <div className="tickets-list">
          <h2>Mis Tickets</h2>
          <ul>
            {tickets.map((ticket) => (
              <li
                key={ticket.id}
                className={`ticket-item ${
                  ticket.estado === 'resuelto' ? 'resolved' : 'open'
                }`}
              >
                <h3>{ticket.asunto}</h3>
                <p>{ticket.descripcion}</p>
                <p>
                  <strong>Tipo de Problema:</strong> {ticket.tipoProblema}
                </p>
                <p>
                  <strong>Fecha de Creación:</strong> {ticket.fechaTicket}
                </p>
                <p>
                  <strong>Estado:</strong> {ticket.estado}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Tickets;
