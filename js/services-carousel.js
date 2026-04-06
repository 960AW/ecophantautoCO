const servicesCarousel = document.querySelector('[data-services-carousel]');

if (servicesCarousel) {
  const track = servicesCarousel.querySelector('[data-services-track]');
  const slides = Array.from(servicesCarousel.querySelectorAll('[data-services-slide]'));
  const prevButton = servicesCarousel.querySelector('[data-services-prev]');
  const nextButton = servicesCarousel.querySelector('[data-services-next]');
  const autoplayDelay = 4200;
  let activeIndex = 0;
  let autoplayId = null;
  let visibleCount = 3;

  const syncViewportMetrics = () => {
    if (window.matchMedia('(max-width: 767px)').matches) {
      visibleCount = 1;
      return;
    }

    if (window.matchMedia('(max-width: 1023px)').matches) {
      visibleCount = 2;
      return;
    }

    visibleCount = 3;
  };

  const getMaxIndex = () => Math.max(0, slides.length - visibleCount);

  const getOffsetExpression = () => {
    if (visibleCount === 1) {
      return `${activeIndex} * (100% + 0.85rem)`;
    }

    if (visibleCount === 2) {
      return `${activeIndex} * ((100% + 1.25rem) / 2)`;
    }

    return `${activeIndex} * ((100% + 1.25rem) / 3)`;
  };

  const render = () => {
    if (!track || slides.length === 0) return;
    track.style.transform = `translateX(calc(-1 * (${getOffsetExpression()})))`;
  };

  const goTo = (nextIndex) => {
    const maxIndex = getMaxIndex();
    activeIndex = nextIndex;

    if (activeIndex < 0) {
      activeIndex = maxIndex;
    }

    if (activeIndex > maxIndex) {
      activeIndex = 0;
    }

    render();
    scheduleAutoplay();
  };

  const scheduleAutoplay = () => {
    window.clearTimeout(autoplayId);
    autoplayId = window.setTimeout(() => {
      goTo(activeIndex + 1);
    }, autoplayDelay);
  };

  prevButton?.addEventListener('click', () => goTo(activeIndex - 1));
  nextButton?.addEventListener('click', () => goTo(activeIndex + 1));

  servicesCarousel.addEventListener('mouseenter', () => window.clearTimeout(autoplayId));
  servicesCarousel.addEventListener('mouseleave', () => scheduleAutoplay());
  window.addEventListener('resize', () => {
    syncViewportMetrics();
    activeIndex = Math.min(activeIndex, getMaxIndex());
    render();
  });

  syncViewportMetrics();
  render();
  scheduleAutoplay();
}
