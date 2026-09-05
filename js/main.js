// OTR — On The Rocks — main.js
'use strict';

// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    navbar.style.paddingTop = '16px';
  } else {
    navbar.style.paddingTop = '33px';
  }
}, { passive: true });

// Mobile nav menu
const menuToggle = document.querySelector('.navbar-menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');

if (menuToggle && mobileMenu) {
  const onKeydown = (e) => {
    if (e.key === 'Escape') closeMobileMenu();
  };

  const onClickOutside = (e) => {
    if (!mobileMenu.contains(e.target) && !menuToggle.contains(e.target)) {
      closeMobileMenu({ focusToggle: false });
    }
  };

  function openMobileMenu() {
    mobileMenu.hidden = false;
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.classList.add('is-open');
    const firstLink = mobileMenu.querySelector('a');
    if (firstLink) firstLink.focus();
    document.addEventListener('keydown', onKeydown);
    document.addEventListener('click', onClickOutside, true);
  }

  function closeMobileMenu({ focusToggle = true } = {}) {
    mobileMenu.hidden = true;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.classList.remove('is-open');
    document.removeEventListener('keydown', onKeydown);
    document.removeEventListener('click', onClickOutside, true);
    if (focusToggle) menuToggle.focus();
  }

  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    if (isOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => closeMobileMenu({ focusToggle: false }));
  });
}

function toggleFaq(item) {
  const isOpen = item.classList.contains('faq-open');
  document.querySelectorAll('.faq-item.faq-open').forEach(openItem => {
    if (openItem !== item) {
      openItem.classList.remove('faq-open');
      openItem.setAttribute('aria-expanded', 'false');
    }
  });
  item.classList.toggle('faq-open', !isOpen);
  item.setAttribute('aria-expanded', String(!isOpen));
}

document.querySelectorAll('.faq-item').forEach(item => {
  item.addEventListener('click', () => toggleFaq(item));
  item.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleFaq(item);
    }
  });
});

// Smooth scroll for nav links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Section reveal on scroll (incluye el wordmark "ON THE ROCKS." del footer,
// que hasta ahora aparecía sin ninguna animación de entrada)
const revealTargets = document.querySelectorAll(
  '.section-work .work-inner, .section-portfolio .portfolio-inner, .section-service .service-inner, .section-trusted .trusted-inner, .section-faq .faq-inner, .section-contact .contact-inner'
);
revealTargets.forEach(el => el.classList.add('reveal'));

// .contact-logotype ya trae su propio estado inicial/visible en CSS,
// no necesita la clase genérica .reveal — solo que este observer le agregue is-visible.
const logotypeTargets = document.querySelectorAll('.contact-logotype');
const allRevealTargets = [...revealTargets, ...logotypeTargets];

if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  allRevealTargets.forEach(el => io.observe(el));
} else {
  allRevealTargets.forEach(el => el.classList.add('is-visible'));
}

// Portfolio page filters
const portfolioFilters = document.querySelectorAll('.portfolio-filter');
const portfolioCards = document.querySelectorAll('.pgrid-card');

if (portfolioFilters.length && portfolioCards.length) {
  const activateFilter = (btn) => {
    // Figma no tiene un pill "todos": por defecto no hay ninguno activo y se
    // ven todas las cards. Clickear un filtro ya activo lo apaga y vuelve
    // a mostrar todo; clickear otro lo activa en exclusiva.
    const alreadyActive = btn.classList.contains('is-active');

    portfolioFilters.forEach(b => {
      b.classList.remove('is-active');
      b.setAttribute('aria-pressed', 'false');
    });

    if (alreadyActive) {
      portfolioCards.forEach(card => card.classList.remove('is-hidden'));
      return;
    }

    btn.classList.add('is-active');
    btn.setAttribute('aria-pressed', 'true');

    const filter = btn.getAttribute('data-filter');
    portfolioCards.forEach(card => {
      const show = card.getAttribute('data-cat') === filter;
      card.classList.toggle('is-hidden', !show);
    });
  };

  portfolioFilters.forEach(btn => {
    btn.addEventListener('click', () => activateFilter(btn));
  });

  // Llegar desde SERVICE con ?filter=audiovisual activa esa tab directamente.
  const requestedFilter = new URLSearchParams(window.location.search).get('filter');
  if (requestedFilter) {
    const targetBtn = Array.from(portfolioFilters).find(b => b.getAttribute('data-filter') === requestedFilter);
    if (targetBtn) activateFilter(targetBtn);
  }
}

// Contact form — no backend yet, so "Enviar" opens the visitor's email
// client with the fields pre-filled. Swap for a real fetch() submit (with
// this as the mailto fallback if it fails) once there's an endpoint to send to.
// Reusable so both the /contact.html page form and the footer modal's copy
// of the same form share one implementation.
function wireContactForm(contactForm) {
  if (!contactForm || contactForm.dataset.wired) return;
  contactForm.dataset.wired = 'true';

  const statusEl = contactForm.querySelector('.contact-form-status');
  const submitBtn = contactForm.querySelector('.contact-submit');
  let isSubmitting = false;

  const setStatus = (message, kind) => {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.classList.remove('is-error', 'is-success');
    if (kind) statusEl.classList.add(kind);
  };

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      setStatus('Revisá los campos marcados antes de enviar.', 'is-error');
      return;
    }

    isSubmitting = true;
    if (submitBtn) submitBtn.disabled = true;

    const reason = contactForm.querySelector('input[name="reason"]:checked')?.value || '';
    const name = contactForm.querySelector('input[name="name"]')?.value || '';
    const email = contactForm.querySelector('input[name="email"]')?.value || '';
    const message = contactForm.querySelector('textarea[name="message"]')?.value || '';

    const subject = encodeURIComponent(`${reason} — ${name}`.trim());
    const body = encodeURIComponent(`Nombre: ${name}\nEmail: ${email}\n\n${message}`);
    window.location.href = `mailto:hola@ontherocks.com.ar?subject=${subject}&body=${body}`;

    setStatus('Se abrió tu cliente de correo con estos datos completados. Si no pasó nada, escribinos directamente a hola@ontherocks.com.ar.', 'is-success');

    window.setTimeout(() => {
      isSubmitting = false;
      if (submitBtn) submitBtn.disabled = false;
    }, 1500);
  });
}

wireContactForm(document.getElementById('contact-form'));

// Footer "Get in touch" → el propio footer (.section-contact, a su tamaño
// real) revela el formulario ahí mismo, anclado a la derecha, en vez de
// navegar a /contact.html (excepto en la propia página de contacto, donde
// el formulario completo ya está a la vista).
const footerSection = document.querySelector('.section-contact');
const contactTriggers = Array.from(document.querySelectorAll('.contact-btn'))
  .filter(btn => !document.body.classList.contains('page-contact'));

if (contactTriggers.length && footerSection) {
  const dimOverlay = document.createElement('div');
  dimOverlay.className = 'contact-dim-overlay';
  dimOverlay.hidden = true;
  document.body.appendChild(dimOverlay);

  const modalPanel = document.createElement('div');
  modalPanel.className = 'contact-modal';
  modalPanel.hidden = true;
  modalPanel.setAttribute('role', 'dialog');
  modalPanel.setAttribute('aria-modal', 'true');
  modalPanel.setAttribute('aria-labelledby', 'contact-modal-title');
  modalPanel.innerHTML = `
    <button type="button" class="contact-modal-close">close</button>
    <h2 id="contact-modal-title" class="contact-modal-title">¿Tenés un proyecto en mente?</h2>
    <form class="contact-form" id="contact-modal-form" novalidate>
      <fieldset class="contact-reasons">
        <legend class="sr-only">Motivo de contacto</legend>
        <label class="contact-radio">
          <input type="radio" name="reason" value="Nuevos negocios" checked>
          <span class="contact-radio-dot" aria-hidden="true"></span>
          Nuevos negocios
        </label>
        <label class="contact-radio">
          <input type="radio" name="reason" value="Consultas de prensa">
          <span class="contact-radio-dot" aria-hidden="true"></span>
          Consultas de prensa
        </label>
        <label class="contact-radio">
          <input type="radio" name="reason" value="Todo lo demás">
          <span class="contact-radio-dot" aria-hidden="true"></span>
          Todo lo demás
        </label>
      </fieldset>

      <a href="contact.html#equipo" class="contact-jobs-link">¿Buscás oportunidades laborales?</a>

      <p class="contact-form-hint">Dejanos tus datos para que podamos contactarte. Respondemos en menos de 48 hs.</p>

      <div class="contact-form-fields">
        <div class="contact-field">
          <label for="cfm-name">Nombre y apellido</label>
          <input type="text" name="name" id="cfm-name" autocomplete="name" required>
        </div>
        <div class="contact-field">
          <label for="cfm-email">Email</label>
          <input type="email" name="email" id="cfm-email" autocomplete="email" required>
        </div>
        <div class="contact-field">
          <label for="cfm-message">Mensaje</label>
          <textarea name="message" id="cfm-message" rows="3" placeholder="Contanos sobre tu proyecto" required></textarea>
        </div>
      </div>

      <p class="contact-form-note">Al enviar se abre tu cliente de correo con estos datos ya completados.</p>

      <button type="submit" class="contact-submit">
        Enviar
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M3 9L9 3M9 3H4.5M9 3V7.5" stroke="#15141D" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <p class="contact-form-status" role="status" aria-live="polite"></p>
    </form>
  `;
  footerSection.appendChild(modalPanel);
  wireContactForm(document.getElementById('contact-modal-form'));

  const closeBtn = modalPanel.querySelector('.contact-modal-close');
  let lastFocusedEl = null;

  const onModalKeydown = (e) => {
    if (e.key === 'Escape') {
      closeContactModal();
      return;
    }
    if (e.key !== 'Tab') return;
    const focusable = modalPanel.querySelectorAll('button, a[href], input, textarea');
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  function openContactModal() {
    lastFocusedEl = document.activeElement;
    dimOverlay.hidden = false;
    modalPanel.hidden = false;
    footerSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    closeBtn.focus();
    document.addEventListener('keydown', onModalKeydown);
  }

  function closeContactModal() {
    dimOverlay.hidden = true;
    modalPanel.hidden = true;
    document.removeEventListener('keydown', onModalKeydown);
    if (lastFocusedEl) lastFocusedEl.focus();
  }

  contactTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openContactModal();
    });
  });

  closeBtn.addEventListener('click', closeContactModal);
  dimOverlay.addEventListener('click', closeContactModal);
}
