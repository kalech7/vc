import React from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../estilos/whatsapp.css';
const WhatsAppIcon = () => {
  const phoneNumber = '593999274384'; // Reemplaza con el número de teléfono de WhatsApp

  const handleWhatsAppClick = () => {
    const url = `https://api.whatsapp.com/send?phone=${phoneNumber}`;
    window.open(url, '_blank');
  };

  return (
    <div className="whatsapp-float" onClick={handleWhatsAppClick}>
      <i className="fab fa-whatsapp whatsapp-icon"></i>
      <span className="whatsapp-tooltip">¿Tienes dudas? Contactanos</span>
    </div>
  );
};

export default WhatsAppIcon;
