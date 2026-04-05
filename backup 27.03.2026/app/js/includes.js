const includeTargets = Array.from(document.querySelectorAll('[data-include]'));
const includeBasePath = document.body.dataset.includeBasePath || '/components';

const loadExternalScripts = () => {
  const hasElfsight = document.querySelector('.elfsight-app-96edc98c-a545-433b-9ed0-e189ecbde1a2');

  if (hasElfsight && !document.querySelector('script[data-elfsight-platform]')) {
    const script = document.createElement('script');
    script.src = 'https://elfsightcdn.com/platform.js';
    script.async = true;
    script.dataset.elfsightPlatform = 'true';
    document.head.appendChild(script);
  }
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

  loadExternalScripts();
};

loadIncludes().catch((error) => {
  console.error(error);
});