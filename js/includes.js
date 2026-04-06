const GTM_ID = 'GTM-548QWJPN';

const initGoogleTagManager = () => {
  if (!document.head || !document.body) {
    return;
  }

  window.dataLayer = window.dataLayer || [];

  if (!document.querySelector('script[data-gtm-loader]')) {
    window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });

    const firstScript = document.head.querySelector('script');
    const gtmScript = document.createElement('script');
    gtmScript.async = true;
    gtmScript.src = 'https://www.googletagmanager.com/gtm.js?id=' + GTM_ID;
    gtmScript.dataset.gtmLoader = 'true';

    if (firstScript) {
      firstScript.parentNode.insertBefore(gtmScript, firstScript);
    } else {
      document.head.prepend(gtmScript);
    }
  }

  if (!document.querySelector('noscript[data-gtm-noscript]')) {
    const noScript = document.createElement('noscript');
    noScript.dataset.gtmNoscript = 'true';
    noScript.innerHTML = '<iframe src="https://www.googletagmanager.com/ns.html?id=' + GTM_ID + '" height="0" width="0" style="display:none;visibility:hidden"></iframe>';
    document.body.insertAdjacentElement('afterbegin', noScript);
  }
};

initGoogleTagManager();

const includeTargets = Array.from(document.querySelectorAll('[data-include]'));
const includeBasePath = document.body.dataset.includeBasePath || '/components';

const initFooterReviews = () => {
  const carousels = Array.from(document.querySelectorAll('[data-reviews-carousel]'));

  carousels.forEach((carousel) => {
    if (carousel.dataset.ready === 'true') {
      return;
    }

    const track = carousel.querySelector('[data-reviews-track]');
    const slides = Array.from(carousel.querySelectorAll('[data-review-slide]'));
    const prevButton = carousel.querySelector('[data-reviews-prev]');
    const nextButton = carousel.querySelector('[data-reviews-next]');
    const dotsHost = carousel.querySelector('[data-reviews-dots]');

    if (!track || slides.length === 0 || !prevButton || !nextButton || !dotsHost) {
      return;
    }

    const mobileQuery = window.matchMedia('(max-width: 767px)');
    let activeIndex = 0;
    let autoRotateId = null;
    const dots = slides.map((_, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'site-footer__reviews-dot';
      dot.setAttribute('aria-label', `Ver opini?n ${index + 1}`);
      dot.addEventListener('click', () => {
        activeIndex = index;
        render();
        restartAutoRotate();
      });
      dotsHost.appendChild(dot);
      return dot;
    });

    const stopAutoRotate = () => {
      if (autoRotateId) {
        window.clearInterval(autoRotateId);
        autoRotateId = null;
      }
    };

    const render = () => {
      const mobileMode = mobileQuery.matches;

      carousel.classList.toggle('is-mobile-carousel', mobileMode);
      track.style.transform = mobileMode ? `translateX(-${activeIndex * 100}%)` : '';
      track.setAttribute('aria-live', mobileMode ? 'polite' : 'off');

      slides.forEach((slide, index) => {
        const isActive = index === activeIndex;
        slide.classList.toggle('is-active', isActive);
        slide.setAttribute('aria-hidden', mobileMode ? String(!isActive) : 'false');
      });

      dots.forEach((dot, index) => {
        const isActive = index === activeIndex;
        dot.classList.toggle('is-active', isActive);
        dot.setAttribute('aria-pressed', String(isActive));
      });
    };

    const goToStep = (direction) => {
      activeIndex = (activeIndex + direction + slides.length) % slides.length;
      render();
    };

    const restartAutoRotate = () => {
      stopAutoRotate();

      if (!mobileQuery.matches || slides.length < 2) {
        return;
      }

      autoRotateId = window.setInterval(() => {
        goToStep(1);
      }, 5000);
    };

    const syncMode = () => {
      activeIndex = 0;
      render();
      restartAutoRotate();
    };

    prevButton.addEventListener('click', () => {
      goToStep(-1);
      restartAutoRotate();
    });

    nextButton.addEventListener('click', () => {
      goToStep(1);
      restartAutoRotate();
    });

    carousel.addEventListener('mouseenter', stopAutoRotate);
    carousel.addEventListener('mouseleave', restartAutoRotate);
    carousel.addEventListener('focusin', stopAutoRotate);
    carousel.addEventListener('focusout', restartAutoRotate);

    if (typeof mobileQuery.addEventListener === 'function') {
      mobileQuery.addEventListener('change', syncMode);
    } else if (typeof mobileQuery.addListener === 'function') {
      mobileQuery.addListener(syncMode);
    }

    render();
    restartAutoRotate();
    carousel.dataset.ready = 'true';
  });
};

const initFooterAccordions = () => {
  const accordions = Array.from(document.querySelectorAll('.site-footer__accordion'));

  if (accordions.length === 0) {
    return;
  }

  const mobileQuery = window.matchMedia('(max-width: 767px)');

  const syncAccordions = () => {
    accordions.forEach((accordion) => {
      accordion.open = !mobileQuery.matches;
    });
  };

  if (!accordions[0].dataset.syncReady) {
    if (typeof mobileQuery.addEventListener === 'function') {
      mobileQuery.addEventListener('change', syncAccordions);
    } else if (typeof mobileQuery.addListener === 'function') {
      mobileQuery.addListener(syncAccordions);
    }

    accordions.forEach((accordion) => {
      accordion.dataset.syncReady = 'true';
    });
  }

  syncAccordions();
};

const loadIncludes = async () => {
  if (includeTargets.length === 0) {
    return;
  }

  await Promise.all(
    includeTargets.map(async (target) => {
      const name = target.dataset.include;
      const response = await fetch(`${includeBasePath}/${name}.html`);

      if (!response.ok) {
        throw new Error(`No se pudo cargar el componente: ${name}`);
      }

      target.innerHTML = await response.text();
    })
  );

  if (typeof window.initHeader === 'function') {
    window.initHeader();
  }

  initFooterReviews();
  initFooterAccordions();
};

loadIncludes().catch((error) => {
  console.error(error);
});
