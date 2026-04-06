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

const getPageType = () => {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';

  if (path === '/') return 'home';
  if (path === '/quienes-somos') return 'about';
  if (path === '/cotiza-ahora') return 'quote';
  if (path === '/gracias-cotizacion') return 'thank_you';
  if (path === '/blog-detailing' || path === '/blog-detailing/') return 'blog_index';
  if (path.startsWith('/blog-detailing/')) return 'blog_post';
  if (path.startsWith('/servicios/')) return 'service';

  return 'page';
};

const getServiceNameFromPath = () => {
  const path = window.location.pathname.replace(/\/+$/, '');
  const serviceMap = {
    '/servicios/ppf-paint-protection-film': 'ppf',
    '/servicios/ceramic-coating': 'ceramic',
    '/servicios/polarizado-de-vidrios': 'polarizado',
    '/servicios/vinyl-wrap': 'vinyl_wrap',
    '/servicios/auto-detailing': 'auto_detailing'
  };

  return serviceMap[path] || '';
};

const normalizeTrackingText = (value) => (value || '')
  .replace(/\s+/g, ' ')
  .trim();

const getTrackingLocation = (element) => {
  if (!element) return 'unknown';

  const area = element.closest('header, footer, main, section, article, aside, nav, div');
  const className = area && typeof area.className === 'string' ? area.className : '';
  const id = area && area.id ? area.id : '';
  const source = (className + ' ' + id).toLowerCase();

  if (source.includes('site-header')) return 'header';
  if (source.includes('hero-slider')) return 'hero';
  if (source.includes('quote-form-hero')) return 'quote_hero';
  if (source.includes('quote-inline-shell')) return 'quote_inline';
  if (source.includes('quote-modal')) return 'quote_modal';
  if (source.includes('service-hero')) return 'service_hero';
  if (source.includes('service-packages')) return 'packages';
  if (source.includes('service-faq')) return 'faq';
  if (source.includes('services-section')) return 'services_section';
  if (source.includes('blog-section')) return 'blog_section';
  if (source.includes('site-footer__reviews')) return 'footer_reviews';
  if (source.includes('site-footer')) return 'footer';

  return 'content';
};

const pushTrackingEvent = (eventName, detail = {}) => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    page_type: getPageType(),
    page_path: window.location.pathname,
    page_title: document.title,
    service_name: getServiceNameFromPath(),
    ...detail
  });
};

const initSiteTracking = () => {
  const pageType = getPageType();
  const serviceName = getServiceNameFromPath();
  const articleTitle = normalizeTrackingText(document.querySelector('main h1')?.textContent || '');

  if (pageType === 'service' && serviceName) {
    pushTrackingEvent('view_service', { service_name: serviceName });
  }

  if (pageType === 'blog_post') {
    pushTrackingEvent('view_blog_post', { article_name: articleTitle || document.title });
  }

  if (pageType === 'thank_you') {
    pushTrackingEvent('generate_lead', { lead_type: 'quote_form', conversion_page: 'gracias_cotizacion' });
  }

  document.addEventListener('click', (event) => {
    const target = event.target.closest('a, button');
    if (!target) return;

    const label = normalizeTrackingText(target.textContent || target.getAttribute('aria-label') || '');
    const href = target.getAttribute('href') || '';
    const lowerLabel = label.toLowerCase();
    const className = typeof target.className === 'string' ? target.className.toLowerCase() : '';

    if (href.startsWith('https://wa.me/') || href.includes('api.whatsapp.com')) {
      pushTrackingEvent('whatsapp_click', {
        cta_label: label || 'WhatsApp',
        cta_location: getTrackingLocation(target)
      });
      return;
    }

    if (href.startsWith('tel:')) {
      pushTrackingEvent('phone_click', {
        cta_label: label || href,
        cta_location: getTrackingLocation(target)
      });
      return;
    }

    if (href.startsWith('mailto:')) {
      pushTrackingEvent('email_click', {
        cta_label: label || href,
        cta_location: getTrackingLocation(target)
      });
      return;
    }

    const looksLikeCta =
      className.includes('cta') ||
      className.includes('button') ||
      lowerLabel.includes('cotiza') ||
      lowerLabel.includes('whatsapp') ||
      lowerLabel.includes('llama') ||
      lowerLabel.includes('escrib') ||
      lowerLabel.includes('conoce') ||
      lowerLabel.includes('mas info') ||
      lowerLabel.includes('m s info') ||
      lowerLabel.includes('ver mas') ||
      lowerLabel.includes('presupuesto');

    if (looksLikeCta) {
      pushTrackingEvent('cta_click', {
        cta_label: label || target.id || 'cta',
        cta_location: getTrackingLocation(target),
        destination: href || ''
      });
    }
  }, { passive: true });

  let quoteFormStarted = false;
  const quoteForm = document.getElementById('quote-form');
  if (quoteForm) {
    const markQuoteFormStart = () => {
      if (quoteFormStarted) return;
      quoteFormStarted = true;
      pushTrackingEvent('form_start', { form_id: 'quote-form' });
    };

    quoteForm.addEventListener('focusin', markQuoteFormStart);
    quoteForm.addEventListener('input', markQuoteFormStart);
  }

  let inlineFormStarted = false;
  const inlineForm = document.querySelector('.leform-inline[data-id="69"]');
  if (inlineForm) {
    const markInlineFormStart = () => {
      if (inlineFormStarted) return;
      inlineFormStarted = true;
      pushTrackingEvent('form_start', { form_id: 'leform-69' });
    };

    inlineForm.addEventListener('focusin', markInlineFormStart);
    inlineForm.addEventListener('input', markInlineFormStart);
    inlineForm.addEventListener('pointerdown', markInlineFormStart);
  }
};

window.EcophantTracking = {
  getPageType,
  getServiceNameFromPath,
  pushTrackingEvent
};

initSiteTracking();
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
