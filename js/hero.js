const heroSlider = document.querySelector('[data-hero-slider]');

if (heroSlider) {
  const slides = Array.from(heroSlider.querySelectorAll('[data-slide]'));
  const thumbs = Array.from(heroSlider.querySelectorAll('[data-hero-thumb]'));
  const prevButton = heroSlider.querySelector('[data-hero-prev]');
  const nextButton = heroSlider.querySelector('[data-hero-next]');
  const progressBar = heroSlider.querySelector('[data-hero-progress]');
  const autoplayDelay = 5000;
  let activeIndex = 0;
  let autoplayId = null;
  let transitionCleanupId = null;
  let hasStartedTransitions = false;

  const stopSlideAnimations = () => {
    slides.forEach((slide) => {
      if (typeof slide.getAnimations !== 'function') {
        return;
      }

      slide.getAnimations().forEach((animation) => {
        animation.cancel();
      });
    });
  };

  const animateSlideTransition = (previousIndex, nextIndex, direction) => {
    if (previousIndex === nextIndex || typeof slides[nextIndex]?.animate !== 'function') {
      return;
    }

    const incomingSlide = slides[nextIndex];
    const outgoingSlide = slides[previousIndex];
    const incomingContent = incomingSlide?.querySelector('.hero-slider__content');
    const outgoingContent = outgoingSlide?.querySelector('.hero-slider__content');
    const offset = direction === 'prev' ? -96 : 96;
    const exitOffset = direction === 'prev' ? 56 : -56;

    stopSlideAnimations();

    incomingSlide.animate(
      [
        {
          opacity: 0,
          transform: `translate3d(${offset}px, 0, 0) scale(1.04)`,
          filter: 'blur(10px)'
        },
        {
          opacity: 1,
          transform: 'translate3d(0, 0, 0) scale(1)',
          filter: 'blur(0)'
        }
      ],
      {
        duration: 950,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        fill: 'both'
      }
    );

    outgoingSlide?.animate(
      [
        {
          opacity: 1,
          transform: 'translate3d(0, 0, 0) scale(1)',
          filter: 'blur(0)'
        },
        {
          opacity: 0,
          transform: `translate3d(${exitOffset}px, 0, 0) scale(0.985)`,
          filter: 'blur(6px)'
        }
      ],
      {
        duration: 780,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        fill: 'both'
      }
    );

    incomingContent?.animate(
      [
        {
          opacity: 0,
          transform: `translate3d(${direction === 'prev' ? -48 : 48}px, 0, 0)`
        },
        {
          opacity: 1,
          transform: 'translate3d(0, 0, 0)'
        }
      ],
      {
        duration: 900,
        delay: 120,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        fill: 'both'
      }
    );

    outgoingContent?.animate(
      [
        {
          opacity: 1,
          transform: 'translate3d(0, 0, 0)'
        },
        {
          opacity: 0,
          transform: `translate3d(${direction === 'prev' ? 24 : -24}px, 0, 0)`
        }
      ],
      {
        duration: 360,
        easing: 'ease-out',
        fill: 'both'
      }
    );
  };

  const ensureSlideMedia = (index) => {
    const slide = slides[index];
    const image = slide?.querySelector('.hero-slider__image[data-src]');

    if (!image || image.dataset.loaded === 'true') {
      return;
    }

    if (image.dataset.srcset) {
      image.srcset = image.dataset.srcset;
    }

    if (image.dataset.sizes) {
      image.sizes = image.dataset.sizes;
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
    window.requestAnimationFrame(() => {
      progressBar.classList.add('is-animating');
    });
  };

  const syncSlides = (nextIndex) => {
    const previousIndex = activeIndex;
    const wrappedDirection =
      previousIndex === slides.length - 1 && nextIndex === 0
        ? 'next'
        : previousIndex === 0 && nextIndex === slides.length - 1
          ? 'prev'
          : nextIndex >= previousIndex
            ? 'next'
            : 'prev';

    window.clearTimeout(transitionCleanupId);
    heroSlider.dataset.direction = wrappedDirection;

    slides.forEach((slide) => {
      slide.classList.remove('is-exiting');
    });

    if (slides[previousIndex] && previousIndex !== nextIndex) {
      slides[previousIndex].classList.add('is-exiting');
      transitionCleanupId = window.setTimeout(() => {
        slides.forEach((slide) => {
          slide.classList.remove('is-exiting');
        });
      }, 1200);
    }

    animateSlideTransition(previousIndex, nextIndex, wrappedDirection);

    activeIndex = nextIndex;
    ensureSlideMedia(activeIndex);
    primeNearbySlides();

    slides.forEach((slide, index) => {
      const isActive = index === activeIndex;
      const isExiting = slide.classList.contains('is-exiting');
      slide.classList.toggle('is-active', isActive);
      slide.setAttribute('aria-hidden', String(!isActive));
      slide.style.zIndex = isActive ? '2' : isExiting ? '1' : '0';
    });

    thumbs.forEach((thumb, index) => {
      const isActive = index === activeIndex;
      thumb.classList.toggle('is-active', isActive);
      thumb.setAttribute('aria-selected', String(isActive));
    });

    restartProgress();
  };

  const scheduleAutoplay = () => {
    window.clearTimeout(autoplayId);
    autoplayId = window.setTimeout(() => {
      if (!hasStartedTransitions) {
        heroSlider.dataset.ready = 'true';
        hasStartedTransitions = true;
      }
      syncSlides((activeIndex + 1) % slides.length);
      scheduleAutoplay();
    }, autoplayDelay);
  };

  const goToSlide = (nextIndex) => {
    if (!hasStartedTransitions) {
      heroSlider.dataset.ready = 'true';
      hasStartedTransitions = true;
    }
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
