const viewElements = Array.from(document.querySelectorAll('[data-blog-views]'));
const articleRoot = document.querySelector('[data-blog-article]');

const formatViews = (count) => `${count} ${count === 1 ? 'vista' : 'vistas'}`;

const getViewCount = (slug) => {
  return Number(window.localStorage.getItem(`ecophant-blog-views:${slug}`) || '0');
};

const setViewCount = (slug, count) => {
  window.localStorage.setItem(`ecophant-blog-views:${slug}`, String(count));
};

const renderViews = () => {
  viewElements.forEach((element) => {
    const slug = element.dataset.slug;
    if (!slug) return;
    element.textContent = formatViews(getViewCount(slug));
  });
};

const registerArticleView = () => {
  if (!articleRoot) return;

  const slug = articleRoot.dataset.blogArticle;
  if (!slug) return;

  const sessionKey = `ecophant-blog-viewed:${slug}`;
  if (!window.sessionStorage.getItem(sessionKey)) {
    const nextCount = getViewCount(slug) + 1;
    setViewCount(slug, nextCount);
    window.sessionStorage.setItem(sessionKey, 'true');
  }
};

registerArticleView();
renderViews();

