const heroSlider = document.querySelector('[data-hero-slider]');

if (heroSlider) {
  const slides = Array.from(heroSlider.querySelectorAll('[data-slide]'));
  const thumbs = Array.from(heroSlider.querySelectorAll('[data-hero-thumb]'));
  const prevButton = heroSlider.querySelector('[data-hero-prev]');
  const nextButton = heroSlider.querySelector('[data-hero-next]');
  const progressBar = heroSlider.querySelector('[data-hero-progress]');
  const autoplayDelay = 5000;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let activeIndex = 0;
  let autoplayId = null;

  const ensureSlideMedia = (index) => {
    const slide = slides[index];
    const image = slide?.querySelector('.hero-slider__image[data-src]');

    if (!image || image.dataset.loaded === 'true') {
      return;
    }

    image.src = image.dataset.src;
    image.dataset.loaded = 'true';
  };

  const primeNearbySlides = () => {
    ensureSlideMedia((activeIndex + 1) % slides.length);
    ensureSlideMedia((activeIndex + slides.length - 1) % slides.length);
  };

  const restartProgress = () => {
    if (!progressBar) return;

    progressBar.classList.remove('is-animating');
    void progressBar.offsetWidth;

    if (!prefersReducedMotion) {
      progressBar.classList.add('is-animating');
    }
  };

  const syncSlides = (nextIndex) => {
    activeIndex = nextIndex;
    ensureSlideMedia(activeIndex);
    primeNearbySlides();

    slides.forEach((slide, index) => {
      const isActive = index === activeIndex;
      slide.classList.toggle('is-active', isActive);
      slide.setAttribute('aria-hidden', String(!isActive));
      slide.style.zIndex = isActive ? '1' : '0';
    });

    thumbs.forEach((thumb, index) => {
      const isActive = index === activeIndex;
      thumb.classList.toggle('is-active', isActive);
      thumb.setAttribute('aria-selected', String(isActive));
    });

    restartProgress();
  };

  const scheduleAutoplay = () => {
    if (prefersReducedMotion) return;

    window.clearTimeout(autoplayId);
    autoplayId = window.setTimeout(() => {
      syncSlides((activeIndex + 1) % slides.length);
      scheduleAutoplay();
    }, autoplayDelay);
  };

  const goToSlide = (nextIndex) => {
    syncSlides((nextIndex + slides.length) % slides.length);
    scheduleAutoplay();
  };

  prevButton?.addEventListener('click', () => {
    goToSlide(activeIndex - 1);
  });

  nextButton?.addEventListener('click', () => {
    goToSlide(activeIndex + 1);
  });

  thumbs.forEach((thumb) => {
    thumb.addEventListener('click', () => {
      const nextIndex = Number(thumb.dataset.index);
      goToSlide(nextIndex);
    });
  });

  heroSlider.addEventListener('pointermove', (event) => {
    const activeSlide = slides[activeIndex];
    const activeImage = activeSlide?.querySelector('.hero-slider__image');

    if (!activeImage || window.innerWidth < 768) return;

    const bounds = heroSlider.getBoundingClientRect();
    const offsetX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 28;
    const offsetY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 18;

    activeImage.style.setProperty('--parallax-x', `${offsetX}px`);
    activeImage.style.setProperty('--parallax-y', `${offsetY}px`);
  });

  heroSlider.addEventListener('pointerleave', () => {
    const activeSlide = slides[activeIndex];
    const activeImage = activeSlide?.querySelector('.hero-slider__image');

    if (!activeImage) return;

    activeImage.style.setProperty('--parallax-x', '0px');
    activeImage.style.setProperty('--parallax-y', '0px');
  });

  heroSlider.addEventListener('mouseenter', () => {
    window.clearTimeout(autoplayId);
  });

  heroSlider.addEventListener('mouseleave', () => {
    scheduleAutoplay();
  });

  ensureSlideMedia(activeIndex);
  syncSlides(activeIndex);
  scheduleAutoplay();
}
