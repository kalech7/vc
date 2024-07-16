import React from 'react';
import '../estilos/estilos_historia.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Header from '../inicio/Header.js';
import Footer from '../inicio/Footer.js';
import { Link } from 'react-router-dom';
import vision from '../img/Vision_Vertex.jpg';

const Historia = () => {
  return (
    <div>
      <Header />
      <body className="inf-historia">
        <div id="contenedorh" className='encabezado'>
          <section id="historia">
            <h2 id="thistoria">Conoce tu banco</h2>
            <div className="historia-contenido">
              <h3>Nuestros orígenes, principios, trayectoria en el mercado</h3>
              <img src={vision} className="historia-img" alt="Historia de Vertex" />
            </div>
          </section>
        </div>
        <div id="contenedorb" className='contenedor-body'>
          <section className="tarjetas">
            <div className="tarjeta">
              <h2>Comienzo</h2>
              <p>La idea de VertexCapital surgió en una clase de emprendimiento en la Universidad EPN. Un grupo de estudiantes visionarios identificó un problema común: la dificultad para gestionar el dinero y realizar pagos de servicios dentro de la comunidad estudiantil.</p>
              <p>Motivados por su espíritu emprendedor y con el apoyo de la universidad, se comenzó a desarrollar una plataforma que no solo atendiera estas necesidades, sino que también proporcionara una experiencia bancaria moderna y segura.</p>
            </div>
            <div className="tarjeta">
              <h2>Historia</h2>
              <p>VertexCapital nació de la necesidad de crear una solución bancaria accesible y eficiente para la comunidad estudiantil de la Universidad EPN. Fundada en el año 2020, VertexCapital se estableció como una innovadora aplicación web bancaria diseñada específicamente para estudiantes, ofreciendo un servicio único que facilita las transferencias de dinero y el pago de servicios dentro del campus universitario.</p>
            </div>
            <div className="tarjeta">
              <h2>Crecimiento y expansión</h2>
              <p>En poco tiempo, VertexCapital se ganó la confianza de la comunidad estudiantil de la Universidad EPN. Su éxito radica en su capacidad para adaptarse rápidamente a las necesidades de los usuarios y en su compromiso con la seguridad y la privacidad de las transacciones. El banco ha implementado medidas de seguridad avanzadas, incluyendo autenticación de dos factores y encriptación de extremo a extremo, garantizando que las transacciones sean seguras y los datos de los usuarios estén protegidos.</p>
            </div>
          </section>
        </div>
        

      </body>
      <Footer />
    </div>
  );
};

export default Historia;

