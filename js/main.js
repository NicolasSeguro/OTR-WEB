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
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  const statusEl = document.getElementById('contact-form-status');
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
    const name = contactForm.querySelector('#cf-name')?.value || '';
    const email = contactForm.querySelector('#cf-email')?.value || '';
    const message = contactForm.querySelector('#cf-message')?.value || '';

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
