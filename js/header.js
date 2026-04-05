window.initHeader = () => {
  const header = document.querySelector('.site-header');

  if (!header || header.dataset.ready === 'true') {
    return;
  }

  const dropdown = header.querySelector('[data-dropdown]');
  const dropdownButton = dropdown?.querySelector('button');
  const dropdownMenu = dropdown?.querySelector('.site-header__dropdown-menu');
  const mobileToggle = header.querySelector('.site-header__mobile-toggle');
  const mobileMenu = header.querySelector('.site-header__mobile-menu');
  const currentPath = window.location.pathname.replace(/\/+$/, '') || '/';

  const setActiveNav = () => {
    const navKey = currentPath.includes('/quienes-somos')
      ? 'about'
      : currentPath.includes('/servicios/')
        ? 'services'
        : currentPath.includes('/blog-detailing')
          ? 'blog'
          : currentPath === '/' || currentPath === '/index.html'
            ? 'home'
            : null;

    const serviceKey = currentPath.includes('/servicios/')
      ? currentPath.split('/').pop().replace(/\.html$/, '')
      : null;

    if (!navKey) {
      return;
    }

    header.querySelectorAll(`[data-nav="${navKey}"]`).forEach((element) => {
      element.classList.add('is-active');

      if (element.tagName === 'DETAILS') {
        element.open = true;
      }

      if (element.tagName === 'A') {
        element.setAttribute('aria-current', 'page');
      }
    });

    if (!serviceKey) {
      return;
    }

    header.querySelectorAll(`[data-service="${serviceKey}"]`).forEach((element) => {
      element.classList.add('is-active');
      element.setAttribute('aria-current', 'page');
    });
  };

  const closeDropdown = () => {
    if (!dropdown || !dropdownButton || !dropdownMenu) return;
    dropdownButton.setAttribute('aria-expanded', 'false');
    dropdownMenu.classList.remove('is-open');
  };

  if (dropdown && dropdownButton && dropdownMenu) {
    dropdownButton.addEventListener('click', () => {
      const isOpen = dropdownMenu.classList.toggle('is-open');
      dropdownButton.setAttribute('aria-expanded', String(isOpen));
    });

    document.addEventListener('click', (event) => {
      if (!dropdown.contains(event.target)) {
        closeDropdown();
      }
    });
  }

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('is-open');
      mobileToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  setActiveNav();
  header.dataset.ready = 'true';
};
