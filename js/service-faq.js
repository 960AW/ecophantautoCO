const serviceFaq = document.querySelector('[data-service-faq]');

if (serviceFaq) {
  const buttons = Array.from(serviceFaq.querySelectorAll('[data-faq-question]'));
  const answerTitle = serviceFaq.querySelector('[data-faq-answer-title]');
  const answerCopy = serviceFaq.querySelector('[data-faq-answer-copy]');
  const answerPanel = serviceFaq.querySelector('[data-faq-answer-panel]') || serviceFaq.querySelector('.service-faq__answer');

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

    if (answerPanel && button.id) {
      answerPanel.setAttribute('aria-labelledby', button.id);
    }
  };

  const moveFocus = (targetIndex) => {
    const nextButton = buttons[targetIndex];
    if (!nextButton) {
      return;
    }

    activateFaq(nextButton);
    nextButton.focus();
  };

  buttons.forEach((button, index) => {
    button.addEventListener('click', () => activateFaq(button));

    button.addEventListener('keydown', (event) => {
      switch (event.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          event.preventDefault();
          moveFocus((index + 1) % buttons.length);
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          event.preventDefault();
          moveFocus((index - 1 + buttons.length) % buttons.length);
          break;
        case 'Home':
          event.preventDefault();
          moveFocus(0);
          break;
        case 'End':
          event.preventDefault();
          moveFocus(buttons.length - 1);
          break;
        default:
          break;
      }
    });
  });

  if (buttons[0]) {
    activateFaq(buttons[0]);
  }
}