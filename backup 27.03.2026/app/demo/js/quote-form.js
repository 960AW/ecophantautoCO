(() => {
  const form = document.getElementById('quote-form');
  const modal = document.getElementById('quote-modal');
  const openButtons = Array.from(document.querySelectorAll('[data-open-quote-modal]'));
  const closeButtons = Array.from(document.querySelectorAll('[data-close-quote-modal]'));
  const body = document.body;

  if (!form || !modal) return;

  const panels = Array.from(form.querySelectorAll('[data-step-panel]'));
  const indicators = Array.from(document.querySelectorAll('[data-step-indicator]'));
  const prevButton = document.getElementById('quote-prev');
  const nextButton = document.getElementById('quote-next');
  const submitButton = document.getElementById('quote-submit');
  const status = document.getElementById('quote-form-status');
  const makeSelect = form.elements.make;
  const yearSelect = form.elements.year;
  const colorSelect = form.elements.color;
  const attachmentInput = form.elements.attachments;
  const phoneInput = form.elements.phone;
  const otherMakeWrap = document.getElementById('quote-other-make-wrap');
  const otherMakeInput = form.elements.otherMake;
  const otherColorWrap = document.getElementById('quote-other-color-wrap');
  const otherColorInput = form.elements.otherColor;
  let step = 0;
  let lastTrigger = null;

  const stepFields = [
    ['fullName', 'phone', 'email'],
    ['make', 'model', 'year', 'color'],
    ['services'],
    []
  ];

  const setStatus = (message, type = '') => {
    status.textContent = message;
    status.className = 'quote-form__status';
    if (type) status.classList.add(type);
  };

  const openModal = (trigger) => {
    lastTrigger = trigger || null;
    modal.hidden = false;
    body.classList.add('quote-modal-open');
    window.requestAnimationFrame(() => {
      modal.classList.add('is-visible');
      const firstField = form.querySelector('input, select, textarea, button');
      if (firstField) firstField.focus();
    });
  };

  const closeModal = () => {
    modal.classList.remove('is-visible');
    body.classList.remove('quote-modal-open');
    window.setTimeout(() => {
      modal.hidden = true;
      if (lastTrigger) lastTrigger.focus();
    }, 180);
  };

  const updateStep = () => {
    panels.forEach((panel, index) => {
      const active = index === step;
      panel.hidden = !active;
      panel.classList.toggle('is-active', active);
    });

    indicators.forEach((indicator, index) => {
      indicator.classList.toggle('is-active', index === step);
    });

    prevButton.hidden = step === 0;
    nextButton.hidden = step === panels.length - 1;
    submitButton.hidden = step !== panels.length - 1;
    setStatus('');
  };

  const toggleOtherMake = () => {
    const isOther = makeSelect && makeSelect.value === 'Otra marca';
    if (otherMakeWrap) otherMakeWrap.hidden = !isOther;
    if (otherMakeInput) otherMakeInput.required = isOther;
  };

  const toggleOtherColor = () => {
    const isOther = colorSelect && colorSelect.value === 'Otro color';
    if (otherColorWrap) otherColorWrap.hidden = !isOther;
    if (otherColorInput) otherColorInput.required = isOther;
  };

  const populateYears = () => {
    if (!yearSelect || yearSelect.options.length > 1) return;
    for (let year = 2026; year >= 1915; year -= 1) {
      const option = document.createElement('option');
      option.value = String(year);
      option.textContent = String(year);
      yearSelect.appendChild(option);
    }
  };

  const validateAttachments = () => {
    if (!attachmentInput || !attachmentInput.files.length) return true;

    const allowed = ['jpg', 'jpeg', 'png', 'heic', 'heif', 'webp', 'mp4', 'mov'];
    for (const file of attachmentInput.files) {
      const ext = file.name.split('.').pop().toLowerCase();
      if (!allowed.includes(ext)) {
        setStatus('Uno de los archivos no tiene un formato permitido.', 'is-error');
        return false;
      }
      if (file.size > 20 * 1024 * 1024) {
        setStatus('Cada archivo debe pesar menos de 20 MB.', 'is-error');
        return false;
      }
    }
    return true;
  };

  const validateStep = () => {
    const names = stepFields[step];

    if (names.includes('services')) {
      const checked = form.querySelectorAll('input[name="services"]:checked');
      if (!checked.length) {
        setStatus('Selecciona al menos un servicio para continuar.', 'is-error');
        return false;
      }
    }

    if (step === 1 && makeSelect && makeSelect.value === 'Otra marca' && (!otherMakeInput.value || !otherMakeInput.value.trim())) {
      otherMakeInput.reportValidity();
      setStatus('Especifica la marca para continuar.', 'is-error');
      return false;
    }

    if (step === 1 && colorSelect && colorSelect.value === 'Otro color' && (!otherColorInput.value || !otherColorInput.value.trim())) {
      otherColorInput.reportValidity();
      setStatus('Especifica el color para continuar.', 'is-error');
      return false;
    }

    if (step === 0 && phoneInput && !/^\d{11}$/.test(phoneInput.value.trim())) {
      phoneInput.reportValidity();
      setStatus('El celular debe tener exactamente 10 numeros.', 'is-error');
      return false;
    }

    if (step === 3 && !validateAttachments()) {
      return false;
    }

    for (const name of names) {
      if (name === 'services') continue;
      const field = form.elements[name];
      if (!field || !field.checkValidity()) {
        field.reportValidity();
        setStatus('Completa los campos requeridos antes de continuar.', 'is-error');
        return false;
      }
    }

    setStatus('');
    return true;
  };

  if (phoneInput) {
    phoneInput.addEventListener('input', () => {
      phoneInput.value = phoneInput.value.replace(/\D+/g, '').slice(0, 11);
    });
  }

  populateYears();
  toggleOtherMake();
  toggleOtherColor();
  makeSelect.addEventListener('change', toggleOtherMake);
  colorSelect.addEventListener('change', toggleOtherColor);

  openButtons.forEach((button) => {
    button.addEventListener('click', () => openModal(button));
  });

  closeButtons.forEach((button) => {
    button.addEventListener('click', closeModal);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modal.hidden) {
      closeModal();
    }
  });

  prevButton.addEventListener('click', () => {
    if (step > 0) {
      step -= 1;
      updateStep();
    }
  });

  nextButton.addEventListener('click', () => {
    if (!validateStep()) return;
    if (step < panels.length - 1) {
      step += 1;
      updateStep();
    }
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!validateStep()) return;

    const data = new FormData();
    data.append('fullName', form.elements.fullName.value.trim());
    data.append('phone', form.elements.phone.value.trim());
    data.append('email', form.elements.email.value.trim());
    data.append('make', makeSelect.value === 'Otra marca' ? otherMakeInput.value.trim() : form.elements.make.value.trim());
    data.append('model', form.elements.model.value.trim());
    data.append('year', form.elements.year.value.trim());
    data.append('color', colorSelect.value === 'Otro color' ? otherColorInput.value.trim() : form.elements.color.value.trim());
    data.append('message', form.elements.message.value.trim());

    Array.from(form.querySelectorAll('input[name="services"]:checked')).forEach((input) => {
      data.append('services', input.value);
    });

    if (attachmentInput && attachmentInput.files.length) {
      Array.from(attachmentInput.files).forEach((file) => {
        data.append('attachments', file);
      });
    }

    submitButton.disabled = true;
    nextButton.disabled = true;
    prevButton.disabled = true;
    setStatus('Enviando solicitud...');

    try {
      const response = await fetch('/demo/send-quote.aspx', {
        method: 'POST',
        body: data
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'No fue posible enviar la solicitud.');
      }

      form.reset();
      step = 0;
      toggleOtherMake();
      toggleOtherColor();
      updateStep();
      setStatus('Solicitud enviada. Te responderemos pronto.', 'is-success');
      window.setTimeout(closeModal, 900);
    } catch (error) {
      setStatus(error.message || 'No fue posible enviar la solicitud.', 'is-error');
    } finally {
      submitButton.disabled = false;
      nextButton.disabled = false;
      prevButton.disabled = false;
    }
  });

  updateStep();
})();







