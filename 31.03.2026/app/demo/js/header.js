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
  const normalizedPath = currentPath.startsWith('/demo')
    ? currentPath.slice(5) || '/'
    : currentPath;

  const setActiveNav = () => {
    const navKey = normalizedPath.includes('/quienes-somos')
      ? 'about'
      : normalizedPath.includes('/servicios/')
        ? 'services'
        : normalizedPath.includes('/blog-detailing')
          ? 'blog'
          : normalizedPath === '/' || normalizedPath === '/index.html'
            ? 'home'
            : null;

    const serviceKey = normalizedPath.includes('/servicios/')
      ? normalizedPath.split('/').pop().replace(/\.html$/, '')
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
    dropdown.setAttribute('aria-expanded', 'false');
    dropdownButton.setAttribute('aria-expanded', 'false');
    dropdownMenu.classList.remove('is-open');
  };

  if (dropdown && dropdownButton && dropdownMenu) {
    dropdownButton.addEventListener('click', () => {
      const isOpen = dropdownMenu.classList.toggle('is-open');
      dropdown.setAttribute('aria-expanded', String(isOpen));
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
