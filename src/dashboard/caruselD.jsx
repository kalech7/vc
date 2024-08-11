import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import movil from '../img/movil.jpg';
import '../estilos/estilos_carouselD.css';
import cripto from '../img/criptos.jpg';
const CarouselD = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardWidth, setCardWidth] = useState(0);
  const carouselRef = useRef(null);
  const navigate = useNavigate();

  const cardsData = [
    {
      image: movil,
      title: 'App Movil',
      copy: '¡Próximamente disponible! Prepárate para obtener el mejor banco en tus manos.',
      button: 'Más información',
      link: '/ofertas',
    },
    {
      image: cripto,
      title: 'Criptomonedas',
      copy: '¡Próximamente disponible! Prepárate para transferir criptos',
      button: 'Más información',
      link: '/ofertas',
    },
  ];

  useEffect(() => {
    const handleResize = () => {
      setCardWidth(calculateCardWidth());
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const calculateCardWidth = () => {
    if (carouselRef.current) {
      const firstCard = carouselRef.current.querySelector('.carouseld-card');
      if (firstCard) {
        const computedStyle = window.getComputedStyle(firstCard);
        const margin = parseInt(computedStyle.marginRight);
        return firstCard.offsetWidth + margin;
      }
    }
    return 0;
  };

  const nextCard = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % cardsData.length);
  };

  const prevCard = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + cardsData.length) % cardsData.length
    );
  };

  const handleButtonClick = (link) => {
    navigate(link);
  };

  return (
    <div className="carouseld-container">
      <button className="carouseld-button left" onClick={prevCard}>
        &lt;
      </button>
      <div className="carouseld" ref={carouselRef}>
        {cardsData.map((card, index) => (
          <div
            key={index}
            className="carouseld-item"
            style={{
              transform: `translateX(-${currentIndex * 100}%)`,
            }}
          >
            <div className="carouseld-card">
              <img src={card.image} alt={card.title} />
              <div>
                <h3>{card.title}</h3>
                <p>{card.copy}</p>
                <button onClick={() => handleButtonClick(card.link)}>
                  {card.button}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button className="carouseld-button right" onClick={nextCard}>
        &gt;
      </button>
    </div>
  );
};

export default CarouselD;
