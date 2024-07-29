import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../inicio/Header'; // Ruta ajustada a la carpeta correcta
import Footer from '../inicio/Footer'; // Ruta ajustada a la carpeta correcta
import tarjeta1 from '../img2/tarjeta1.jpg';
import prestamo1 from '../img2/prestamo1.jpg';
import inversion2 from '../img2/inversion2.jpg';
import ahorro2 from '../img2/ahorro2.jpg';
import '../estilos/estilos_ofertas.css'; // Asegúrate de crear y definir tus estilos en este archivo

const OfertasPage = () => {
  const navigate = useNavigate(); // Hook para la navegación

  const offers = [
    {
      image: tarjeta1,
      title: 'Tarjeta',
      description: 'Obtén tu tarjeta bancaria en pocos pasos y disfruta de múltiples beneficios.',
    },
    {
      image: prestamo1,
      title: 'Préstamo',
      description: 'Solicita tu préstamo fácilmente y obtén una respuesta inmediata.',
    },
    {
      image: inversion2,
      title: 'Inversiones',
      description: 'Realiza inversiones seguras y rentables con la mejor asesoría.',
    },
    {
      image: ahorro2,
      title: 'Ahorro Flexible',
      description: 'Ahorra con flexibilidad y obtén los mejores intereses del mercado.',
      link: '/calculadora', // Link para la redirección
    },
  ];

  return (
    <div>
      <Header />

      <main className="offers-page">
        <section className="container">
          <h1 id="ofertas">Nuestras Ofertas</h1> {/* Añade un ID aquí */}
          <div className="offers-container">
            {offers.map((offer, index) => (
              <div key={index} className={`offer-card ${index % 2 === 0 ? 'left' : 'right'}`}>
                {index % 2 === 0 ? (
                  <>
                    <img src={offer.image} alt={offer.title} className="offer-image" />
                    <div className="offer-text">
                      <h2 className="offer-title">{offer.title}</h2>
                      <p className="offer-description">{offer.description}</p>
                      <button
                        className="more-info-button"
                        onClick={() => offer.link ? navigate(offer.link) : alert('Información no disponible en este momento.')}
                      >
                        ¿Quieres saber más?
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="offer-text">
                      <h2 className="offer-title">{offer.title}</h2>
                      <p className="offer-description">{offer.description}</p>
                      <button
                        className="more-info-button"
                        onClick={() => offer.link ? navigate(offer.link) : alert('Información no disponible en este momento.')}
                      >
                        ¿Quieres saber más?
                      </button>
                    </div>
                    <img src={offer.image} alt={offer.title} className="offer-image" />
                  </>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default OfertasPage;