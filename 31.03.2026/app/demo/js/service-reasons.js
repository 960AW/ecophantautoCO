const serviceReasons = document.querySelector('[data-service-reasons]');

if (serviceReasons) {
  const steps = Array.from(serviceReasons.querySelectorAll('[data-reason-step]'));
  const panels = Array.from(serviceReasons.querySelectorAll('[data-reason-panel]'));
  const track = serviceReasons.querySelector('.service-reasons__panel-wrap');
  const stage = serviceReasons.querySelector('.service-reasons__stage');
  const prevButton = serviceReasons.querySelector('[data-reason-prev]');
  const nextButton = serviceReasons.querySelector('[data-reason-next]');
  const autoplayDelay = 7000;
  let activeIndex = 0;
  let autoplayId = null;

  const isMobileLayout = () => window.innerWidth <= 767;

  const updateTrack = () => {
    if (!track || !stage || panels.length === 0) return;

    if (isMobileLayout()) {
      track.style.transform = 'translateX(0)';
      return;
    }

    const stageWidth = stage.getBoundingClientRect().width;
    const activePanel = panels[activeIndex];
    const panelWidth = activePanel.getBoundingClientRect().width;
    const panelLeft = activePanel.offsetLeft;
    const offset = panelLeft - (stageWidth - panelWidth) / 2;
    track.style.transform = `translateX(-${Math.max(0, offset)}px)`;
  };

  const scheduleAutoplay = () => {
    window.clearTimeout(autoplayId);
    autoplayId = window.setTimeout(() => {
      activateReason((activeIndex + 1) % panels.length);
    }, autoplayDelay);
  };

  const activateReason = (index) => {
    activeIndex = index;
    const mobileLayout = isMobileLayout();

    steps.forEach((step, stepIndex) => {
      const isActive = stepIndex === activeIndex;
      step.classList.toggle('is-active', isActive);
      step.setAttribute('aria-selected', String(isActive));
      step.tabIndex = isActive ? 0 : -1;
    });

    panels.forEach((panel, panelIndex) => {
      const isActive = panelIndex === activeIndex;
      panel.hidden = false;
      panel.classList.toggle('is-active', isActive);
      panel.classList.toggle('is-neighbor', !mobileLayout && (panelIndex === activeIndex - 1 || panelIndex === activeIndex + 1));
      panel.setAttribute('aria-hidden', String(!isActive && mobileLayout));
    });

    updateTrack();
    scheduleAutoplay();
  };

  steps.forEach((step, index) => {
    step.addEventListener('click', () => activateReason(index));
  });

  prevButton?.addEventListener('click', () => {
    activateReason((activeIndex - 1 + panels.length) % panels.length);
  });

  nextButton?.addEventListener('click', () => {
    activateReason((activeIndex + 1) % panels.length);
  });

  serviceReasons.addEventListener('mouseenter', () => window.clearTimeout(autoplayId));
  serviceReasons.addEventListener('mouseleave', scheduleAutoplay);
  window.addEventListener('resize', () => activateReason(activeIndex));
  activateReason(0);
}

