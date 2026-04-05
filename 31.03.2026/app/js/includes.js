const includeTargets = Array.from(document.querySelectorAll('[data-include]'));
const includeBasePath = document.body.dataset.includeBasePath || '/components';

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
};

loadIncludes().catch((error) => {
  console.error(error);
});
