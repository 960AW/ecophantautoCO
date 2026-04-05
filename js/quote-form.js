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
  const serviceInputs = Array.from(form.querySelectorAll('input[name="services"]'));
  const quoteConfig = window.ECOPHANT_QUOTE_CONFIG || {};
  const emailJsConfig = quoteConfig.emailjs || {};
  const makeConfig = quoteConfig.make || {};

  let step = 0;
  let lastTrigger = null;
  let autoAdvanceTimer = null;

  const stepFields = [
    ['fullName', 'phone', 'email', 'make', 'model', 'year', 'color'],
    ['services', 'message']
  ];

  const isLastStep = (index) => index === panels.length - 1;

  const isEmailJsConfigured = () => (
    emailJsConfig.serviceId &&
    emailJsConfig.templateId &&
    emailJsConfig.publicKey
  );

  const isMakeConfigured = () => Boolean(makeConfig.webhookUrl);

  const setStatus = (message, type = '') => {
    status.textContent = message;
    status.className = 'quote-form__status';
    if (type) status.classList.add(type);
  };

  const clearAutoAdvance = () => {
    if (autoAdvanceTimer) {
      window.clearTimeout(autoAdvanceTimer);
      autoAdvanceTimer = null;
    }
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
    clearAutoAdvance();
    modal.classList.remove('is-visible');
    body.classList.remove('quote-modal-open');
    window.setTimeout(() => {
      modal.hidden = true;
      if (lastTrigger) lastTrigger.focus();
    }, 180);
  };

  const toggleOtherMake = () => {
    const isOther = makeSelect && makeSelect.value === 'Otra marca';
    if (otherMakeWrap) otherMakeWrap.hidden = !isOther;
    if (otherMakeInput) {
      otherMakeInput.required = isOther;
      if (!isOther) otherMakeInput.value = '';
    }
  };

  const toggleOtherColor = () => {
    const isOther = colorSelect && colorSelect.value === 'Otro color';
    if (otherColorWrap) otherColorWrap.hidden = !isOther;
    if (otherColorInput) {
      otherColorInput.required = isOther;
      if (!isOther) otherColorInput.value = '';
    }
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

  const validateAttachments = (report = true) => {
    if (!attachmentInput || !attachmentInput.files.length) return true;

    const allowed = ['jpg', 'jpeg', 'png', 'heic', 'heif', 'webp', 'mp4', 'mov'];
    for (const file of attachmentInput.files) {
      const ext = file.name.split('.').pop().toLowerCase();
      if (!allowed.includes(ext)) {
        if (report) setStatus('Uno de los archivos no tiene un formato permitido.', 'is-error');
        return false;
      }
      if (file.size > 20 * 1024 * 1024) {
        if (report) setStatus('Cada archivo debe pesar menos de 20 MB.', 'is-error');
        return false;
      }
    }
    return true;
  };

  const isPhoneValid = () => !phoneInput || /^\d{10}$/.test(phoneInput.value.trim());

  const validateStep = (index = step, report = true) => {
    const names = stepFields[index] || [];

    if (index === 1 && !serviceInputs.some((input) => input.checked)) {
      if (report) setStatus('Selecciona al menos un servicio para continuar.', 'is-error');
      return false;
    }

    if (index === 0 && makeSelect && makeSelect.value === 'Otra marca' && otherMakeInput && !otherMakeInput.value.trim()) {
      if (report) {
        otherMakeInput.reportValidity();
        setStatus('Especifica la marca para continuar.', 'is-error');
      }
      return false;
    }

    if (index === 0 && colorSelect && colorSelect.value === 'Otro color' && otherColorInput && !otherColorInput.value.trim()) {
      if (report) {
        otherColorInput.reportValidity();
        setStatus('Especifica el color para continuar.', 'is-error');
      }
      return false;
    }

    if (index === 0 && !isPhoneValid()) {
      if (report) {
        phoneInput.reportValidity();
        setStatus('El celular debe tener exactamente 10 números.', 'is-error');
      }
      return false;
    }

    if (index === 1 && !validateAttachments(report)) {
      return false;
    }

    for (const name of names) {
      if (name === 'services') continue;
      const field = form.elements[name];
      if (!field) continue;
      if (!field.checkValidity()) {
        if (report) {
          field.reportValidity();
          setStatus('Completa los campos requeridos antes de continuar.', 'is-error');
        }
        return false;
      }
    }

    if (report) setStatus('');
    return true;
  };

  const syncActionState = () => {
    const currentStepReady = validateStep(step, false);

    if (!nextButton.hidden) {
      nextButton.disabled = !currentStepReady;
    }

    if (!submitButton.hidden) {
      submitButton.disabled = !currentStepReady;
    }
  };

  const readFileAsBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      const parts = result.split(',');
      resolve(parts.length > 1 ? parts[1] : result);
    };
    reader.onerror = () => reject(new Error(`No fue posible leer el archivo ${file.name}.`));
    reader.readAsDataURL(file);
  });

  const serializeAttachments = async () => {
    if (!attachmentInput || !attachmentInput.files.length) return [];

    return Promise.all(Array.from(attachmentInput.files).map(async (file) => ({
      name: file.name,
      type: file.type || 'application/octet-stream',
      size: file.size,
      contentBase64: await readFileAsBase64(file)
    })));
  };

  const getSelectedServices = () => serviceInputs
    .filter((input) => input.checked)
    .map((input) => input.value);

  const buildLeadPayload = async () => {
    const services = getSelectedServices();
    const attachments = await serializeAttachments();

    return {
      fullName: form.elements.fullName.value.trim(),
      phone: form.elements.phone.value.trim(),
      email: form.elements.email.value.trim(),
      make: makeSelect.value === 'Otra marca' && otherMakeInput ? otherMakeInput.value.trim() : form.elements.make.value.trim(),
      model: form.elements.model.value.trim(),
      year: form.elements.year.value.trim(),
      color: colorSelect.value === 'Otro color' && otherColorInput ? otherColorInput.value.trim() : form.elements.color.value.trim(),
      message: form.elements.message.value.trim(),
      services,
      servicesText: services.join(', '),
      attachmentCount: attachments.length,
      attachments,
      sourceUrl: window.location.href,
      submittedAt: new Date().toISOString()
    };
  };

  const sendWithEmailJs = async (payload, signal) => {
    if (!isEmailJsConfigured()) return false;

    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        service_id: emailJsConfig.serviceId,
        template_id: emailJsConfig.templateId,
        user_id: emailJsConfig.publicKey,
        template_params: {
          full_name: payload.fullName,
          phone: payload.phone,
          email: payload.email,
          make: payload.make,
          model: payload.model,
          year: payload.year,
          color: payload.color,
          services: payload.servicesText,
          message: payload.message || 'Sin mensaje adicional.',
          attachment_count: String(payload.attachmentCount),
          source_url: payload.sourceUrl,
          submitted_at: payload.submittedAt
        }
      }),
      signal
    });

    if (!response.ok) {
      const responseText = await response.text();
      throw new Error(responseText || 'EmailJS no aceptó la solicitud.');
    }

    return true;
  };

  const sendWithMake = async (payload, signal) => {
    if (!isMakeConfigured()) return false;

    const response = await fetch(makeConfig.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal
    });

    if (!response.ok) {
      throw new Error('Make no aceptó la solicitud.');
    }

    return true;
  };

  const focusFirstFieldInStep = () => {
    const activePanel = panels[step];
    if (!activePanel) return;
    const firstField = activePanel.querySelector('input:not([type="hidden"]), select, textarea');
    if (firstField) firstField.focus();
  };

  const updateStep = ({ focus = false } = {}) => {
    clearAutoAdvance();

    panels.forEach((panel, index) => {
      const active = index === step;
      panel.hidden = !active;
      panel.classList.toggle('is-active', active);
    });

    indicators.forEach((indicator, index) => {
      indicator.classList.toggle('is-active', index === step);
    });

    prevButton.hidden = step === 0;
    nextButton.hidden = isLastStep(step);
    submitButton.hidden = !isLastStep(step);
    setStatus('');
    syncActionState();

    if (focus) {
      focusFirstFieldInStep();
    }
  };

  const goToNextStep = ({ focus = true } = {}) => {
    if (step >= panels.length - 1) return;
    step += 1;
    updateStep({ focus });
  };

  const queueAutoAdvance = () => {
    clearAutoAdvance();

    if (isLastStep(step) || !validateStep(step, false)) {
      return;
    }

    autoAdvanceTimer = window.setTimeout(() => {
      if (validateStep(step, false)) {
        goToNextStep({ focus: true });
      }
    }, 180);
  };

  const handleFieldInput = () => {
    setStatus('');
    clearAutoAdvance();
    syncActionState();
  };

  const handleFieldCommit = () => {
    setStatus('');
    syncActionState();
    queueAutoAdvance();
  };

  if (phoneInput) {
    phoneInput.addEventListener('input', () => {
      phoneInput.value = phoneInput.value.replace(/\D+/g, '').slice(0, 10);
      handleFieldInput();
    });
    phoneInput.addEventListener('blur', handleFieldCommit);
  }

  populateYears();
  toggleOtherMake();
  toggleOtherColor();

  makeSelect?.addEventListener('change', () => {
    toggleOtherMake();
    handleFieldCommit();
  });

  colorSelect?.addEventListener('change', () => {
    toggleOtherColor();
    handleFieldCommit();
  });

  form.querySelectorAll('input, select, textarea').forEach((field) => {
    if (field === phoneInput || field === makeSelect || field === colorSelect) return;

    if (field.type === 'checkbox' || field.type === 'file' || field.tagName === 'SELECT') {
      field.addEventListener('change', handleFieldInput);
      return;
    }

    field.addEventListener('input', handleFieldInput);
    field.addEventListener('blur', handleFieldCommit);
  });

  serviceInputs.forEach((input) => {
    input.addEventListener('change', handleFieldInput);
  });

  attachmentInput?.addEventListener('change', () => {
    syncActionState();
    validateAttachments(false);
  });

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
      updateStep({ focus: true });
    }
  });

  nextButton.addEventListener('click', () => {
    if (!validateStep(step, true)) return;
    goToNextStep({ focus: true });
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!validateStep(step, true)) return;

    submitButton.disabled = true;
    nextButton.disabled = true;
    prevButton.disabled = true;
    setStatus('Enviando solicitud...');

    try {
      if (!isEmailJsConfigured() && !isMakeConfigured()) {
        throw new Error('Falta configurar EmailJS o Make en D:\\Ecophant Bogota\\Codex\\cotiza-ahora.html.');
      }

      const payload = await buildLeadPayload();
      const controller = new AbortController();
      const requestTimeout = window.setTimeout(() => controller.abort(), 30000);

      await Promise.all([
        sendWithEmailJs(payload, controller.signal),
        sendWithMake(payload, controller.signal)
      ]);
      window.clearTimeout(requestTimeout);

      form.reset();
      step = 0;
      toggleOtherMake();
      toggleOtherColor();
      updateStep();
      setStatus('Solicitud enviada. Te responderemos pronto.', 'is-success');
      window.setTimeout(closeModal, 900);
    } catch (error) {
      const message = error && error.name === 'AbortError'
        ? 'La solicitud tardo demasiado. Revisa la configuración de EmailJS o Make e intenta de nuevo.'
        : (error.message || 'No fue posible enviar la solicitud.');
      setStatus(message, 'is-error');
      syncActionState();
    } finally {
      submitButton.disabled = false;
      prevButton.disabled = false;
      syncActionState();
    }
  });

  updateStep();
})();
