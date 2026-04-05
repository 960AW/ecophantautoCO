const serviceGallery = document.querySelector('[data-service-gallery]');

if (serviceGallery) {
  const track = serviceGallery.querySelector('[data-gallery-track]');
  const slides = Array.from(serviceGallery.querySelectorAll('[data-gallery-slide]'));
  const prevButton = serviceGallery.querySelector('[data-gallery-prev]');
  const nextButton = serviceGallery.querySelector('[data-gallery-next]');
  const autoplayDelay = 5000;
  let activeIndex = 0;
  let autoplayId = null;

  const isMobileLayout = () => window.innerWidth <= 767;

  const lightbox = document.createElement('div');
  lightbox.className = 'service-gallery__lightbox';
  lightbox.innerHTML = `
    <div class="service-gallery__lightbox-dialog">
      <button type="button" class="service-gallery__lightbox-close" aria-label="Cerrar imagen ampliada">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
          <path d="M6 6L18 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
          <path d="M18 6L6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
        </svg>
      </button>
      <img class="service-gallery__lightbox-image" alt="Trabajo ampliado">
    </div>
  `;
  document.body.appendChild(lightbox);

  const lightboxImage = lightbox.querySelector('.service-gallery__lightbox-image');
  const lightboxClose = lightbox.querySelector('.service-gallery__lightbox-close');

  const openLightbox = (image) => {
    if (!isMobileLayout() || !image || !lightboxImage) return;
    lightboxImage.src = image.currentSrc || image.src;
    lightboxImage.alt = image.alt || 'Trabajo ampliado';
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
  };

  slides.forEach((slide) => {
    const image = slide.querySelector('.service-gallery__image');
    slide.addEventListener('click', () => openLightbox(image));
  });

  const getStepSize = () => {
    if (!slides.length || !track) return 0;
    const slideWidth = slides[0].getBoundingClientRect().width;
    const gap = parseFloat(window.getComputedStyle(track).gap || '0');
    return slideWidth + gap;
  };

  const render = (withTransition = true) => {
    if (!track || slides.length === 0) return;
    track.style.transition = withTransition ? 'transform 420ms cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none';
    track.style.transform = `translateX(-${activeIndex * getStepSize()}px)`;
  };

  const scheduleAutoplay = () => {
    window.clearTimeout(autoplayId);
    autoplayId = window.setTimeout(() => {
      goTo(activeIndex + 1);
    }, autoplayDelay);
  };

  const normalizeIndex = (index) => {
    if (slides.length === 0) return 0;
    if (index < 0) return slides.length - 1;
    if (index >= slides.length) return 0;
    return index;
  };

  const goTo = (nextIndex) => {
    if (!slides.length) return;
    activeIndex = normalizeIndex(nextIndex);
    render(true);
    scheduleAutoplay();
  };

  prevButton?.addEventListener('click', () => goTo(activeIndex - 1));
  nextButton?.addEventListener('click', () => goTo(activeIndex + 1));
  lightboxClose?.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && lightbox.classList.contains('is-open')) {
      closeLightbox();
    }
  });

  serviceGallery.addEventListener('mouseenter', () => window.clearTimeout(autoplayId));
  serviceGallery.addEventListener('mouseleave', scheduleAutoplay);
  window.addEventListener('resize', () => render(false));

  render(false);
  scheduleAutoplay();
}
