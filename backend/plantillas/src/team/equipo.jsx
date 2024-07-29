// src/components/Equipo.js
import React from 'react';
import Header from '../inicio/Header';
import Footer from '../inicio/Footer';
import './equipo.css';
import yop from './yop.jpg';
import cesarines from './cesarines.jpg';
import wilsito from './wilsito.jpg';
import eli from './eli.jpg';
import michael from './michael.jpg';
import team from './tmpteam.jpg';
import burndown from './burndown2.png';
const Equipo = () => {
  return (
    <div>
      <Header />
      <div className="tr-page-wrapper">
        <div id="tr-sections-container" className="tr-content-wrapper">
          <input type="radio" name="toggle" id="tr-toggle1" />
          <input type="radio" name="toggle" id="tr-toggle2" />
          <input type="radio" name="toggle" id="tr-toggle3" />
          <input type="radio" name="toggle" id="tr-toggle4" />
          <input type="radio" name="toggle" id="tr-toggle5" />
          <input type="radio" name="toggle" id="tr-toggle6" />

          <section id="tr-section-1">
            <div className="tr-image-container">
              <img src={team} alt="Image 1" />
            </div>
            <div className="tr-info-container">
              <h1>Nuestro Equipo</h1>
              <label htmlFor="tr-toggle2" class="btn-next">
                Siguiente
              </label>
            </div>
          </section>

          <section id="tr-section-2">
            <div className="tr-image-container">
              <img id="alech" src={yop} alt="alech" />
            </div>
            <div className="tr-info-container">
              <h1>Scrum Master</h1>
              <p>Alejandro Chávez</p>
              <p>Coach, visionario y desarrollador full stack</p>
              <a
                href="https://www.linkedin.com/in/alech7/"
                target="_blank"
                rel="noopener noreferrer"
                class="btn-link"
              >
                Visitar perfil
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/0/01/LinkedIn_Logo.svg"
                  alt="LinkedIn"
                  class="btn-icon"
                />
              </a>
              <label htmlFor="tr-toggle3" class="btn-next">
                Siguiente
              </label>
            </div>
          </section>

          <section id="tr-section-3">
            <div className="tr-image-container">
              <img id="michael" src={michael} alt="Image 3" />
            </div>
            <div className="tr-info-container">
              <h1>Development Team</h1>
              <p>Michael Pillaga</p>
              <p>Titan, Bitcoinlover y mago de la codificación </p>
              <a
                href="https://www.linkedin.com/in/michael-pillaga-sosa-4071712b7/"
                target="_blank"
                rel="noopener noreferrer"
                class="btn-link"
              >
                {' '}
                Visitar perfil
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/0/01/LinkedIn_Logo.svg"
                  alt="LinkedIn"
                  class="btn-icon"
                />
              </a>
              <label htmlFor="tr-toggle4" class="btn-next">
                Siguiente
              </label>
            </div>
          </section>
          <section id="tr-section-4">
            <div className="tr-image-container">
              <img id="cesarines" src={cesarines} alt="cesarines" />
            </div>
            <div className="tr-info-container">
              <h1>Development Team</h1>
              <p>Cesar Sarango</p>
              <p>Hombre de negocios, filántropo y desarollador full stack </p>
              <a
                href="https://ec.linkedin.com/in/cesar-sarango-601037142 "
                target="_blank"
                rel="noopener noreferrer"
                class="btn-link"
              >
                {' '}
                Visitar perfil
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/0/01/LinkedIn_Logo.svg"
                  alt="LinkedIn"
                  class="btn-icon"
                />
              </a>
              <label htmlFor="tr-toggle5" class="btn-next">
                Siguiente
              </label>
            </div>
          </section>

          <section id="tr-section-5">
            <div className="tr-image-container">
              <img id="wilsito" src={wilsito} alt="wilsito" />
            </div>
            <div className="tr-info-container">
              <h1>Development Team</h1>
              <p>Wilmer Rivas</p>
              <p>
                Estratega de negocios, colaborador y desarrollador full stack
              </p>
              <a
                href="https://www.linkedin.com/in/wilmerrivas/"
                target="_blank"
                rel="noopener noreferrer"
                class="btn-link"
              >
                {' '}
                Visitar perfil
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/0/01/LinkedIn_Logo.svg"
                  alt="LinkedIn"
                  class="btn-icon"
                />
              </a>
              <label htmlFor="tr-toggle6" class="btn-next">
                Siguiente
              </label>
            </div>
          </section>
          <section id="tr-section-6">
            <div className="tr-image-container">
              <img id="eli" src={eli} alt="eli" />
            </div>
            <div className="tr-info-container">
              <h1>Development Team-Tester</h1>
              <p>Elias Bolaños</p>
              <p>Desarrollador de software y soluciones</p>
              <a href="https://www.linkedin.com/in/elias-bola%C3%B1os-865b911aa/" target="_blank" rel="noopener noreferrer" class="btn-link"> 
              {' '}
                Visitar perfil
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/0/01/LinkedIn_Logo.svg"
                  alt="LinkedIn"
                  class="btn-icon"
                />
              </a>
              

              <label htmlFor="tr-toggle1" class="btn-next">
                Ir al inicio
              </label>
            </div>
          </section>
        </div>
      </div>
      <div className="burndown-container">
        <h2>Burndown Chart</h2>
        <img id="burndown" src={burndown} alt="burndown" />
      </div>
      <Footer />
    </div>
  );
};

export default Equipo;
