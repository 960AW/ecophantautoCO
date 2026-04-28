const ceramicDaysHero = document.querySelector('[data-ceramic-days-hero]');

if (ceramicDaysHero) {
  const image = ceramicDaysHero.querySelector('[data-days-hero-image]');
  const images = (ceramicDaysHero.dataset.images || '')
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean);

  if (image && images.length > 0) {
    const dayIndex = Math.floor(Date.now() / 86400000) % images.length;
    image.src = images[dayIndex];
    image.alt = ceramicDaysHero.dataset.alt || image.alt;
  }
}
