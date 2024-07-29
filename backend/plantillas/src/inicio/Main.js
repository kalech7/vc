import React from 'react';
import { motion } from 'framer-motion';
import inicio0 from '../img2/inicio0.jpg';
import Carousel from './Carousel';
import Header from './Header';
import Footer from './Footer';
import '../estilos/estilos_inicio.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Whatsaap from './whatsapp';
const Main = () => {
  return (
    <div>
      <Header />

      <main>
        <motion.section
          className="container encabezado_main"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <div
            className="encabezado_textos"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            <h1 className="title">
              Tu dinero disponible{' '}
              <span className="title--active">
                en cualquier momento y lugar
              </span>
            </h1>
            <p className="copy">
              El mejor refugio para tus ahorros esta
              <span className="copy_active"> aquí, en nuestro banco.</span>
            </p>
            <a href="#info" className="cta">
              Conoce más ▼
            </a>
          </div>
          <img src={inicio0} className="portada" alt="Portada Banco" />
        </motion.section>

        <motion.section
          id="info"
          className="info"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1.3, y: 0 }}
          transition={{ duration: 1.5 }}
        >
          <div className="container">
            <h2 className="subtitle">Servicios Online</h2>
            <p className="copy_section">
              Encuentra todo lo que necesitas sin moverte de tu hogar.
            </p>

            <Carousel />
          </div>
        </motion.section>
      </main>
      <Whatsaap />
      <Footer />
    </div>
  );
};

export default Main;
