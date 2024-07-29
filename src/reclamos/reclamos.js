import React from 'react';
import Header from '../inicio/Header'; // Importa el Header
import Footer from '../inicio/Footer'; // Importa el Footer
import '../estilos/estilos_reclamos.css'; // Importa los estilos específicos para Reclamos
import InstructivoPDF from '../pdf/VertexCapital_Formulario_de_Reclamos.pdf'; // Asegúrate de ajustar la ruta al PDF

const Reclamos = () => {
  return (
    <div>
      <Header />
      <main className="reclamos-container">
        <div className="canales-atencion">
          <h2>Canales de atención al cliente</h2>
          <div className="canal">
            <i className="fas fa-map-marker-alt"></i>
            <h4>Agencia</h4>
            <p>Acércate a la agencia de tu preferencia.</p>
          </div>
          <div className="canal">
            <i className="fas fa-envelope"></i>
            <h4>Reclamos</h4>
            <p>Escribe a Unidad de Atención al Cliente: reclamos@vertexcapital.com</p>
          </div>
          <div className="canal">
            <i className="fas fa-phone"></i>
            <h4>Banca Telefónica</h4>
            <p>Si tienes una emergencia, llama al PBX: (02) 2563-988</p>
          </div>
        </div>

        <div className="procedimiento-atencion">
          <h2>Procedimiento de atención de consultas, quejas y reclamos en los diferentes canales</h2>
          <p>Instructivo para atención de consultas, quejas y reclamos</p>
          <a href={InstructivoPDF} download="VertexCapital_Formulario_de_Reclamos.pdf" className="conoce-mas">
            Descarga aqui el formulario <i className="fas fa-chevron-down"></i>
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Reclamos;
