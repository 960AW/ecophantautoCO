document.addEventListener('DOMContentLoaded', () => {
  const sections = Array.from(document.querySelectorAll('[data-mobile-package-tabs]'));

  sections.forEach((section) => {
    const grid = section.querySelector('.service-packages__grid');
    const cards = Array.from(section.querySelectorAll('.service-packages__card'));

    if (!grid || cards.length !== 3) {
      return;
    }

    const tabs = document.createElement('div');
    tabs.className = 'service-packages__mobile-tabs';
    tabs.setAttribute('aria-label', 'Seleccion de paquetes');

    let activeIndex = 0;

    const setActiveCard = (index) => {
      activeIndex = index;

      cards.forEach((card, cardIndex) => {
        card.classList.toggle('is-mobile-active', cardIndex === activeIndex);
      });

      Array.from(tabs.querySelectorAll('.service-packages__mobile-tab')).forEach((tab, tabIndex) => {
        const isActive = tabIndex === activeIndex;
        tab.classList.toggle('is-active', isActive);
        tab.setAttribute('aria-pressed', String(isActive));
      });
    };

    cards.forEach((card, index) => {
      const title = card.querySelector('.service-packages__name')?.textContent?.trim() || `Paquete ${index + 1}`;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'service-packages__mobile-tab';
      button.setAttribute('aria-pressed', 'false');
      button.innerHTML = `<span class="service-packages__mobile-tab-step">${String(index + 1).padStart(2, '0')}</span><span class="service-packages__mobile-tab-label">${title}</span>`;
      button.addEventListener('click', () => setActiveCard(index));
      tabs.appendChild(button);
    });

    grid.parentNode.insertBefore(tabs, grid);

    const syncLayout = () => {
      if (window.innerWidth <= 767) {
        tabs.hidden = false;
        setActiveCard(activeIndex);
        return;
      }

      tabs.hidden = true;
      cards.forEach((card) => {
        card.classList.remove('is-mobile-active');
      });
    };

    syncLayout();
    window.addEventListener('resize', syncLayout);
  });
});