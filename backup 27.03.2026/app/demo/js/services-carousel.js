const servicesCarousel = document.querySelector('[data-services-carousel]');

if (servicesCarousel) {
  const track = servicesCarousel.querySelector('[data-services-track]');
  const slides = Array.from(servicesCarousel.querySelectorAll('[data-services-slide]'));
  const prevButton = servicesCarousel.querySelector('[data-services-prev]');
  const nextButton = servicesCarousel.querySelector('[data-services-next]');
  const autoplayDelay = 4200;
  let activeIndex = 0;
  let autoplayId = null;

  const getVisibleCount = () => {
    if (window.innerWidth < 768) return 1;
    if (window.innerWidth < 1024) return 2;
    return 3;
  };

  const getMaxIndex = () => Math.max(0, slides.length - getVisibleCount());

  const render = () => {
    if (!track || slides.length === 0) return;

    const trackStyles = window.getComputedStyle(track);
    const gap = parseFloat(trackStyles.gap || trackStyles.columnGap || '0') || 0;
    const slideWidth = slides[0].getBoundingClientRect().width;
    const offset = activeIndex * (slideWidth + gap);
    track.style.transform = `translateX(-${offset}px)`;
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
    activeIndex = Math.min(activeIndex, getMaxIndex());
    render();
  });

  render();
  scheduleAutoplay();
}




