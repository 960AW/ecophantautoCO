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
  let frameId = null;
  let desktopMetrics = {
    stageWidth: 0,
    panelWidth: 0,
    gap: 0,
  };

  const isMobileLayout = () => window.innerWidth <= 767;

  const measureTrack = () => {
    if (!track || !stage || panels.length === 0 || isMobileLayout()) {
      desktopMetrics = {
        stageWidth: 0,
        panelWidth: 0,
        gap: 0,
      };
      return;
    }

    const firstPanel = panels[0];
    desktopMetrics = {
      stageWidth: stage.clientWidth,
      panelWidth: firstPanel ? firstPanel.clientWidth : 0,
      gap: parseFloat(window.getComputedStyle(track).gap || '0'),
    };
  };

  const updateTrack = () => {
    if (!track || !stage || panels.length === 0) return;

    if (isMobileLayout()) {
      track.style.transform = 'translateX(0)';
      return;
    }

    if (!desktopMetrics.panelWidth || !desktopMetrics.stageWidth) {
      measureTrack();
    }

    if (!desktopMetrics.panelWidth || !desktopMetrics.stageWidth) {
      return;
    }

    const offset = (activeIndex * (desktopMetrics.panelWidth + desktopMetrics.gap)) - ((desktopMetrics.stageWidth - desktopMetrics.panelWidth) / 2);
    track.style.transform = `translateX(-${Math.max(0, offset)}px)`;
  };

  const scheduleTrackUpdate = () => {
    window.cancelAnimationFrame(frameId);
    frameId = window.requestAnimationFrame(() => {
      updateTrack();
    });
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
      step.setAttribute('aria-pressed', String(isActive));
    });

    panels.forEach((panel, panelIndex) => {
      const isActive = panelIndex === activeIndex;
      panel.hidden = false;
      panel.classList.toggle('is-active', isActive);
      panel.classList.toggle('is-neighbor', !mobileLayout && (panelIndex === activeIndex - 1 || panelIndex === activeIndex + 1));
      panel.setAttribute('aria-hidden', String(!isActive && mobileLayout));
    });

    scheduleTrackUpdate();
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
  window.addEventListener('resize', () => {
    measureTrack();
    scheduleTrackUpdate();
  });
  window.addEventListener('beforeunload', () => {
    window.clearTimeout(autoplayId);
    window.cancelAnimationFrame(frameId);
  });

  measureTrack();
  activateReason(0);
}