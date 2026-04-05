const serviceBenefitsSections = Array.from(document.querySelectorAll('.service-benefits'));

serviceBenefitsSections.forEach((section) => {
  const grid = section.querySelector('.service-benefits__grid');
  const cards = Array.from(section.querySelectorAll('.service-benefits__card'));

  if (!grid || cards.length < 2) return;

  const viewport = document.createElement('div');
  viewport.className = 'service-benefits__viewport';

  grid.parentNode.insertBefore(viewport, grid);
  viewport.appendChild(grid);

  const nav = document.createElement('div');
  nav.className = 'service-benefits__nav';
  nav.setAttribute('aria-label', 'Navegacion de beneficios');

  const prevButton = document.createElement('button');
  prevButton.type = 'button';
  prevButton.className = 'service-benefits__arrow service-benefits__arrow--prev';
  prevButton.setAttribute('aria-label', 'Beneficio anterior');
  prevButton.innerHTML = '<svg class="service-benefits__arrow-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M14.5 5.5L8 12L14.5 18.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg>';

  const nextButton = document.createElement('button');
  nextButton.type = 'button';
  nextButton.className = 'service-benefits__arrow service-benefits__arrow--next';
  nextButton.setAttribute('aria-label', 'Siguiente beneficio');
  nextButton.innerHTML = '<svg class="service-benefits__arrow-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M9.5 5.5L16 12L9.5 18.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg>';

  nav.append(prevButton, nextButton);
  viewport.insertAdjacentElement('afterend', nav);

  const autoplayDelay = 5000;
  let activeIndex = 0;
  let autoplayId = null;
  let touchStartX = 0;
  let touchCurrentX = 0;
  let isDragging = false;

  const isMobile = () => window.innerWidth <= 768;

  const update = () => {
    if (!isMobile()) {
      grid.style.transform = 'translateX(0)';
      return;
    }

    grid.style.transform = `translateX(-${activeIndex * 100}%)`;
  };

  const restartAutoplay = () => {
    window.clearTimeout(autoplayId);

    if (!isMobile()) return;

    autoplayId = window.setTimeout(() => {
      goTo(activeIndex + 1);
    }, autoplayDelay);
  };

  const goTo = (index) => {
    activeIndex = (index + cards.length) % cards.length;
    update();
    restartAutoplay();
  };

  prevButton.addEventListener('click', () => goTo(activeIndex - 1));
  nextButton.addEventListener('click', () => goTo(activeIndex + 1));

  viewport.addEventListener('touchstart', (event) => {
    if (!isMobile()) return;

    touchStartX = event.touches[0].clientX;
    touchCurrentX = touchStartX;
    isDragging = true;
    window.clearTimeout(autoplayId);
  }, { passive: true });

  viewport.addEventListener('touchmove', (event) => {
    if (!isMobile() || !isDragging) return;
    touchCurrentX = event.touches[0].clientX;
  }, { passive: true });

  viewport.addEventListener('touchend', () => {
    if (!isMobile() || !isDragging) return;

    const deltaX = touchCurrentX - touchStartX;

    if (Math.abs(deltaX) > 40) {
      goTo(activeIndex + (deltaX < 0 ? 1 : -1));
    } else {
      restartAutoplay();
    }

    isDragging = false;
  });

  window.addEventListener('resize', () => {
    update();
    restartAutoplay();
  });

  window.addEventListener('beforeunload', () => {
    window.clearTimeout(autoplayId);
  });

  update();
  restartAutoplay();
});