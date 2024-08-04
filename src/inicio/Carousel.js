import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import tarjeta3 from '../img/tarjetas.jpeg';
import prestamo3 from '../img/prestamo3.jpg';
import inversion2 from '../img/inversion2.jpg';
import Ahorro1 from '../img/Ahorro1.jpg';
import '../estilos/estilos_inicio.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCreditCard,
  faFileContract,
  faMoneyBill,
  faPiggyBank,
} from '@fortawesome/free-solid-svg-icons';

const Carousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardWidth, setCardWidth] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const navigate = useNavigate();

  // Array de datos de las tarjetas
  const cardsData = [
    {
      image: tarjeta3,
      title: 'Tarjeta',
      copy: 'Solicita tu nueva tarjeta en pocos pasos y comienza a disfrutar de sus beneficios de inmediato.',
      button: 'Solicitar tarjeta',
      link: '/tarjeta', // Agrega la ruta a la que debería ir este botón
    },
    {
      image: prestamo3,
      title: 'Préstamo',
      copy: 'Solicita tu préstamo ahora mismo y obtén una respuesta inmediata para cumplir tus metas financieras.',
      button: 'Solicitar préstamo',
      link: '/prestamo', // Agrega la ruta a la que debería ir este botón
    },
    {
      image: inversion2,
      title: 'Inversiones',
      copy: 'Simula tu inversión y obtén el mejor interés, todo desde la comodidad de tu hogar con nuestro sitio web.',
      button: 'Simular inversión',
      link: '/calculadora', // Ruta para InterestCalculator
    },
    {
      image: Ahorro1,
      title: 'Ahorro Flexible',
      copy: 'Multiplica tus ahorros aumentando un 5% de interés y accede a tu dinero en cualquier momento.',
      button: 'Abrir cuenta',
      link: '/ahorro-flexible', // Agrega la ruta a la que debería ir este botón
    },
  ];

  useEffect(() => {
    // Calcular el ancho inicial de las tarjetas al cargar
    setCardWidth(calculateCardWidth());

    // Agregar un listener para cambiar el estado cuando el tamaño de la ventana cambie
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Función para calcular el ancho de cada tarjeta
  const calculateCardWidth = () => {
    const carousel = document.querySelector('.carousel');
    const firstCard = carousel.querySelector('.card');
    if (firstCard) {
      const computedStyle = window.getComputedStyle(firstCard);
      const margin = parseInt(computedStyle.marginRight);
      return firstCard.offsetWidth + margin;
    }
    return 0;
  };

  // Función para avanzar a la siguiente tarjeta
  const nextCard = () => {
    setCurrentIndex((prevIndex) => prevIndex + 1);
  };

  // Función para retroceder a la tarjeta anterior
  const prevCard = () => {
    setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
  };

  // Función para manejar el click en el botón de cada tarjeta
  const handleButtonClick = (link) => {
    navigate(link);
  };

  return (
    <article className="carousel">
      {!isMobile && (
        <button
          id="prevButton"
          className="carousel-button prev-button"
          onClick={prevCard}
        >
          <i className="fas fa-chevron-left"></i>
        </button>
      )}
      <div className="cards">
        {(isMobile
          ? cardsData
          : Array.from({ length: cardsData.length * 100 })
        ).map((_, index) => {
          const dataIndex = index % cardsData.length;
          return (
            <div
              key={index}
              className="card"
              style={{
                transform: `translateX(-${currentIndex * cardWidth}px)`,
              }}
            >
              <img
                src={cardsData[dataIndex].image}
                className="card_img"
                alt={cardsData[dataIndex].title}
              />
              <div className="cards_text">
                <h3 className="card_title">
                  {dataIndex === 0 && <FontAwesomeIcon icon={faCreditCard} />}{' '}
                  {dataIndex === 1 && <FontAwesomeIcon icon={faFileContract} />}{' '}
                  {dataIndex === 2 && <FontAwesomeIcon icon={faMoneyBill} />}{' '}
                  {dataIndex === 3 && <FontAwesomeIcon icon={faPiggyBank} />}{' '}
                  {cardsData[dataIndex].title}
                </h3>
                <p className="card_copy">{cardsData[dataIndex].copy}</p>
                <button
                  className="card_button"
                  onClick={() => handleButtonClick(cardsData[dataIndex].link)}
                >
                  {cardsData[dataIndex].button}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {!isMobile && (
        <button
          id="nextButton"
          className="carousel-button next-button"
          onClick={nextCard}
        >
          <i className="fas fa-chevron-right"></i>
        </button>
      )}
    </article>
  );
};

export default Carousel;
