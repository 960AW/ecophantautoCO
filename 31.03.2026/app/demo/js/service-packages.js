document.addEventListener('DOMContentLoaded', () => {
  const packageSections = document.querySelectorAll('[data-ppf-packages]');

  packageSections.forEach((section) => {
    const tabs = Array.from(section.querySelectorAll('[data-ppf-tab]'));
    const panels = Array.from(section.querySelectorAll('[data-ppf-panel]'));

    if (!tabs.length || !panels.length) {
      return;
    }

    const activateTab = (target) => {
      tabs.forEach((tab) => {
        const isActive = tab.dataset.ppfTab === target;
        tab.classList.toggle('is-active', isActive);
        tab.setAttribute('aria-selected', String(isActive));
        tab.tabIndex = isActive ? 0 : -1;
      });

      panels.forEach((panel) => {
        const isActive = panel.dataset.ppfPanel === target;
        panel.classList.toggle('is-active', isActive);
        panel.hidden = !isActive;
      });
    };

    tabs.forEach((tab, index) => {
      tab.tabIndex = index === 0 ? 0 : -1;

      tab.addEventListener('click', () => {
        activateTab(tab.dataset.ppfTab);
      });

      tab.addEventListener('keydown', (event) => {
        const currentIndex = tabs.indexOf(tab);
        let nextIndex = currentIndex;

        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
          nextIndex = (currentIndex + 1) % tabs.length;
        }

        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
          nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        }

        if (event.key === 'Home') {
          nextIndex = 0;
        }

        if (event.key === 'End') {
          nextIndex = tabs.length - 1;
        }

        if (nextIndex !== currentIndex) {
          event.preventDefault();
          tabs[nextIndex].focus();
          activateTab(tabs[nextIndex].dataset.ppfTab);
        }
      });
    });

    activateTab(tabs[0].dataset.ppfTab);
  });
});
