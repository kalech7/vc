import React, { useState, useEffect } from 'react';
import '../estilos/estilos_dashadmin.css';
import ContactInfo from './ContactoInfo';

const TicketList = () => {
    const [resolvedTickets, setResolvedTickets] = useState([]);
    const [openTickets, setOpenTickets] = useState([]);
    const [contactInfo, setContactInfo] = useState({});
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedContactTicketId, setSelectedContactTicketId] = useState(null); // Estado para el ticket con contacto visible
    const [showTickets, setShowTickets] = useState(false); // Estado para mostrar los tickets
    const [comment, setComment] = useState(''); // Estado para el comentario
    const [selectedTicketId, setSelectedTicketId] = useState(null); // Estado para el ticket seleccionado

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const response = await fetch('http://localhost:3030/tickets');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                const resolved = data.filter(ticket => ticket.estado === 'resuelto');
                const open = data.filter(ticket => ticket.estado === 'abierto');
                setResolvedTickets(resolved);
                setOpenTickets(open);
            } catch (error) {
                console.error('Error fetching tickets:', error);
            }
        };

        fetchTickets();
    }, []);

    const handleResolve = async (ticketId) => {
        try {
            const response = await fetch(`http://localhost:3030/tickets/${ticketId}/resolver`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ comentario: comment }), // Incluir el comentario en la solicitud
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const updatedTicket = await response.json();
            setResolvedTickets(prev => [...prev, updatedTicket]);
            setOpenTickets(prev => prev.filter(ticket => ticket.id !== ticketId));
            setComment(''); // Limpiar el comentario después de resolver
            setSelectedTicketId(null); // Deseleccionar el ticket
        } catch (error) {
            console.error('Error resolving ticket:', error);
        }
    };

    const handleShowContact = async (usuario, ticketId) => {
        setSelectedUser(prev => (prev === usuario ? null : usuario)); // Toggle contacto
        setSelectedContactTicketId(prev => (prev === ticketId ? null : ticketId)); // Toggle ticketId

        if (selectedUser !== usuario) {
            try {
                const response = await fetch(`http://localhost:3030/contacto/${usuario}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const contacto = await response.json();
                console.log('Contacto Data:', contacto);
                setContactInfo({ [usuario]: contacto });
            } catch (error) {
                console.error('Error fetching contact info:', error);
            }
        }
    };

    return (
        <div>
            <button className="btn-show-tickets" onClick={() => setShowTickets(!showTickets)}>
                {showTickets ? 'Ocultar Tickets' : 'Mostrar Tickets'}
            </button>
            {showTickets && (
                <div className="tickets-admin-container">
                    <div className="tickets-section open-tickets">
                        <h2>Tickets Abiertos</h2>
                        <ul>
                            {openTickets.map(ticket => (
                                <li key={ticket.id} className="ticket-item open">
                                    <h3>{ticket.asunto}</h3>
                                    <p>{ticket.descripcion}</p>
                                    <p><strong>Usuario:</strong> {ticket.usuario}</p>
                                    <p><strong>Tipo de Problema:</strong> {ticket.tipoProblema}</p>
                                    <p><strong>Fecha de Creación:</strong> {ticket.fechaTicket}</p>
                                    <button onClick={() => handleShowContact(ticket.usuario, ticket.id)}>
                                        {selectedContactTicketId === ticket.id ? 'Ocultar Contacto' : 'Contacto'}
                                    </button>
                                    <button onClick={() => {
                                        setSelectedTicketId(prev => (prev === ticket.id ? null : ticket.id));
                                        setComment('');
                                    }}>
                                        {selectedTicketId === ticket.id ? 'Cancelar' : 'Resuelto'}
                                    </button>
                                    
                                    {selectedTicketId === ticket.id && (
                                        <div className="comment-form">
                                            <textarea
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                                placeholder="Añadir un comentario sobre la resolución"
                                            />
                                            <button onClick={() => handleResolve(ticket.id)}>Enviar Comentario y Resolver</button>
                                        </div>
                                    )}
                                    
                                    {selectedContactTicketId === ticket.id && contactInfo[ticket.usuario] && (
                                        <div className="contact-info">
                                            <p><strong>Correo:</strong> {contactInfo[ticket.usuario].correo}</p>
                                            <p><strong>Celular:</strong> {contactInfo[ticket.usuario].celular}</p>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="tickets-section resolved-tickets">
                        <h2>Tickets Resueltos</h2>
                        <ul>
                            {resolvedTickets.map(ticket => (
                                <li key={ticket.id} className="ticket-item resolved">
                                    <h3>{ticket.asunto}</h3>
                                    <p>{ticket.descripcion}</p>
                                    <p><strong>Usuario:</strong> {ticket.usuario}</p>
                                    <p><strong>Tipo de Problema:</strong> {ticket.tipoProblema}</p>
                                    <p><strong>Fecha de Creación:</strong> {ticket.fechaTicket}</p>
                                    <p><strong>Fecha de Resolución:</strong> {ticket.fechaResolucion}</p>
                                    <button onClick={() => handleShowContact(ticket.usuario, ticket.id)}>
                                        {selectedContactTicketId === ticket.id ? 'Ocultar Contacto' : 'Contacto'}
                                    </button>
                                    {selectedContactTicketId === ticket.id && contactInfo[ticket.usuario] && (
                                        <div className="contact-info">
                                            <p><strong>Correo:</strong> {contactInfo[ticket.usuario].correo}</p>
                                            <p><strong>Celular:</strong> {contactInfo[ticket.usuario].celular}</p>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TicketList;
