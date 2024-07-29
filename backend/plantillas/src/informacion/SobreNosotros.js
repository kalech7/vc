import React from 'react';
import '../estilos/estilos_SobreNosotros.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Header from '../inicio/Header.js';
import Footer from '../inicio/Footer.js';
const SobreNosotros = () => {
  return (
    <div>
      <Header />
        <div id ="contenedori" className='contenedori'>
          <section id="sobre" className="sobre-nosotros">
            <h2>Quiénes Somos</h2>
            <p>En VertexCapital, nos dedicamos a ofrecer soluciones financieras innovadoras y personalizadas para satisfacer las necesidades de nuestros clientes. Nos esforzamos por proporcionar un servicio de excelencia, basado en la confianza y la transparencia.</p>
            <p>Nuestra misión es ser el banco preferido por nuestra comunidad, ofreciendo productos y servicios que faciliten el crecimiento y el bienestar financiero de nuestros clientes. Nos enorgullece nuestro compromiso con la innovación y la mejora continua, siempre buscando maneras de mejorar la experiencia bancaria.</p>
            <p>En VertexCapital, valoramos la integridad, la responsabilidad y el respeto. Estamos dedicados a crear un entorno inclusivo y colaborativo, donde todos nuestros clientes se sientan valorados y comprendidos.</p>
          </section>
       

          <section id="historia" className="historia">
            <h2>Nuestra Historia</h2>
            <p>Fundada en 2020, VertexCapital inicia como una aplicacion web donde se puede realizar transferencias entre cuentas del mismo banco.</p>
            <p>Desde nuestros humildes comienzos, hemos evolucionado para convertirnos en un herramienta para que nuestros clientes agilicen sus operaciones bancarias dentro de la comunidad </p>
          </section>

          <section id="valores" className="valores">
            <h2>Nuestros Valores</h2>
            <ul>
              <li><i className="fas fa-check-circle"></i> Integridad</li>
              <li><i className="fas fa-check-circle"></i> Transparencia</li>
              <li><i className="fas fa-check-circle"></i> Innovación</li>
              <li><i className="fas fa-check-circle"></i> Compromiso con la comunidad</li>
              <li><i className="fas fa-check-circle"></i> Inclusión</li>
            </ul>
          </section>

          <section id="equipo" className="equipo">
            <h2>Nuestro Equipo</h2>
            <p>En VertexCapital, nuestro equipo está compuesto por estudiantes de la politecnica y profesionales en el area de desarrollo web para facilitar la atencion.</p>
            <p>Nos esforzamos por crear un ambiente de trabajo colaborativo y respetuoso, donde cada empleado pueda desarrollarse y crecer profesionalmente para el mundo laboral.</p>
          </section>
        </div>

      
      <Footer />
    </div>
  );
};

export default SobreNosotros;
