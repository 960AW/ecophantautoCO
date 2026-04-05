const serviceFaq = document.querySelector('[data-service-faq]');

if (serviceFaq) {
  const buttons = Array.from(serviceFaq.querySelectorAll('[data-faq-question]'));
  const answerTitle = serviceFaq.querySelector('[data-faq-answer-title]');
  const answerCopy = serviceFaq.querySelector('[data-faq-answer-copy]');

  const activateFaq = (button) => {
    buttons.forEach((item) => {
      const isActive = item === button;
      item.classList.toggle('is-active', isActive);
      item.setAttribute('aria-selected', String(isActive));
      item.tabIndex = isActive ? 0 : -1;
    });

    if (answerTitle) {
      answerTitle.textContent = button.dataset.faqTitle || '';
    }

    if (answerCopy) {
      answerCopy.innerHTML = button.dataset.faqCopy || '';
    }
  };

  buttons.forEach((button) => {
    button.addEventListener('click', () => activateFaq(button));
  });

  if (buttons[0]) {
    activateFaq(buttons[0]);
  }
}