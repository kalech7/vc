document.addEventListener('DOMContentLoaded', function () {
  const carousel = document.querySelector('.carousel');
  const prevButton = document.getElementById('prevButton');
  const nextButton = document.getElementById('nextButton');
  const cards = carousel.querySelectorAll('.card');

  let currentIndex = 0;
  const cardWidth =
    cards[0].offsetWidth +
    parseInt(window.getComputedStyle(cards[0]).marginRight);
  const scrollAmount = 5; // Cantidad de píxeles a desplazar por cada intervalo
  let scrollInterval = null; // Variable para almacenar el intervalo de desplazamiento automático

  function showCards() {
    carousel.scrollLeft = currentIndex * cardWidth;
  }

  function nextCard() {
    if (currentIndex < cards.length - 1) {
      currentIndex++;
      showCards();
    }
  }

  function prevCard() {
    if (currentIndex > 0) {
      currentIndex--;
      showCards();
    }
  }

  // Función para desplazamiento automático hacia adelante al mantener presionado
  function startAutoScrollNext() {
    scrollInterval = setInterval(function () {
      if (currentIndex < cards.length - 1) {
        currentIndex++;
        showCards();
      }
    }, 0); // Intervalo de desplazamiento en milisegundos (ajusta según sea necesario)
  }

  // Función para desplazamiento automático hacia atrás al mantener presionado
  function startAutoScrollPrev() {
    scrollInterval = setInterval(function () {
      if (currentIndex > 0) {
        currentIndex--;
        showCards();
      }
    }, 10); // Intervalo de desplazamiento en milisegundos (ajusta según sea necesario)
  }

  // Detener el desplazamiento automático al soltar el botón
  function stopAutoScroll() {
    clearInterval(scrollInterval);
  }

  // Mostrar las tarjetas visibles al cargar la página
  showCards();

  // Configurar eventos para las flechas de navegación
  nextButton.addEventListener('click', nextCard);
  prevButton.addEventListener('click', prevCard);

  // Configurar eventos para desplazamiento automático al mantener presionado
  nextButton.addEventListener('mousedown', startAutoScrollNext);
  prevButton.addEventListener('mousedown', startAutoScrollPrev);

  // Detener el desplazamiento automático al soltar el botón
  window.addEventListener('mouseup', stopAutoScroll);
});
