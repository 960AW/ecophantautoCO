const serviceHero = document.querySelector('[data-service-hero]');

if (serviceHero) {
  const serviceName = serviceHero.dataset.serviceName || 'SERVICIO';
  const rawBenefits = serviceHero.dataset.benefits || '';
  const benefits = rawBenefits
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean);

  const typingTarget = serviceHero.querySelector('[data-service-typing]');
  const numberTarget = serviceHero.querySelector('[data-service-number]');
  const benefitCards = Array.from(serviceHero.querySelectorAll('[data-service-benefit]'));
  const changeDelay = 3000;
  const typeSpeed = 58;
  let activeIndex = 0;
  let timeoutId = null;

  const renderState = async () => {
    const benefit = benefits[activeIndex] || '';
    const prefix = `${serviceName}: `;

    benefitCards.forEach((card, index) => {
      card.classList.toggle('is-active', index === activeIndex);
    });

    if (numberTarget) {
      numberTarget.textContent = String(activeIndex + 1).padStart(2, '0');
    }

    if (!typingTarget) return;

    typingTarget.textContent = '';
    const fullText = `${prefix}${benefit}`;

    for (let index = 0; index < fullText.length; index += 1) {
      typingTarget.textContent = fullText.slice(0, index + 1);
      await new Promise((resolve) => {
        timeoutId = window.setTimeout(resolve, typeSpeed);
      });
    }

    timeoutId = window.setTimeout(() => {
      activeIndex = (activeIndex + 1) % benefits.length;
      renderState();
    }, Math.max(900, changeDelay - fullText.length * typeSpeed));
  };

  if (benefits.length > 0) {
    renderState();
  }

  window.addEventListener('beforeunload', () => {
    window.clearTimeout(timeoutId);
  });
}
