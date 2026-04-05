const serviceFaq = document.querySelector('[data-service-faq]');

if (serviceFaq) {
  const buttons = Array.from(serviceFaq.querySelectorAll('[data-faq-question]'));
  const answerTitle = serviceFaq.querySelector('[data-faq-answer-title]');
  const answerCopy = serviceFaq.querySelector('[data-faq-answer-copy]');
  const answerPanel = serviceFaq.querySelector('[data-faq-answer-panel]') || serviceFaq.querySelector('.service-faq__answer');
  const mobileAnswers = [];
  const isMobileLayout = () => window.innerWidth <= 767;

  const closeMobileFaq = (button, answer) => {
    button.classList.remove('is-active', 'is-expanded');
    button.setAttribute('aria-selected', 'false');
    button.setAttribute('aria-expanded', 'false');
    button.tabIndex = 0;
    answer.hidden = true;
    answer.classList.remove('is-open');
  };

  const openMobileFaq = (button, answer) => {
    button.classList.add('is-active', 'is-expanded');
    button.setAttribute('aria-selected', 'true');
    button.setAttribute('aria-expanded', 'true');
    answer.hidden = false;
    answer.classList.add('is-open');
  };

  const closeAllMobileFaqs = () => {
    mobileAnswers.forEach(({ button, answer }) => {
      closeMobileFaq(button, answer);
    });
  };

  const syncMobileState = () => {
    if (isMobileLayout()) {
      closeAllMobileFaqs();
      return;
    }

    mobileAnswers.forEach(({ answer }) => {
      answer.hidden = true;
      answer.classList.remove('is-open');
    });
  };

  const activateFaq = (button) => {
    if (isMobileLayout()) {
      const mobileEntry = mobileAnswers.find((item) => item.button === button);
      const shouldOpen = mobileEntry ? mobileEntry.answer.hidden : false;

      closeAllMobileFaqs();

      if (mobileEntry && shouldOpen) {
        openMobileFaq(button, mobileEntry.answer);
      }

      return;
    }

    buttons.forEach((item) => {
      const isActive = item === button;
      item.classList.toggle('is-active', isActive);
      item.classList.remove('is-expanded');
      item.setAttribute('aria-selected', String(isActive));
      item.setAttribute('aria-expanded', String(isActive));
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
    const mobileAnswer = document.createElement('article');
    mobileAnswer.className = 'service-faq__mobile-answer';
    mobileAnswer.hidden = true;
    mobileAnswer.innerHTML = `<h3 class="service-faq__answer-title site-display-font">${button.dataset.faqTitle || ''}</h3><div class="service-faq__answer-copy">${button.dataset.faqCopy || ''}</div>`;
    button.insertAdjacentElement('afterend', mobileAnswer);
    button.setAttribute('aria-expanded', 'false');
    mobileAnswers.push({ button, answer: mobileAnswer });

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
    if (isMobileLayout()) {
      closeAllMobileFaqs();
    } else {
      activateFaq(buttons[0]);
    }
  }

  window.addEventListener('resize', syncMobileState);
  syncMobileState();
}