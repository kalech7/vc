import React from 'react';
import PropTypes from 'prop-types';
import '../estilos/estilos_dashadmin.css';

const ContactInfo = ({ contacto, onClose }) => {
    return (
        <div className="contact-info-modal">
            <div className="contact-info-content">
                <h2>Información de Contacto</h2>
                <p><strong>Correo:</strong> {contacto.correo}</p>
                <p><strong>Celular:</strong> {contacto.celular}</p>
                <button onClick={onClose} className="btn-close">Cerrar</button>
            </div>
        </div>
    );
};

ContactInfo.propTypes = {
    contacto: PropTypes.shape({
        correo: PropTypes.string.isRequired,
        celular: PropTypes.string.isRequired
    }).isRequired,
    onClose: PropTypes.func.isRequired
};

export default ContactInfo;
