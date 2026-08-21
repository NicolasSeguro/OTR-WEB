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

// Section reveal on scroll
const revealTargets = document.querySelectorAll(
  '.section-work .work-inner, .section-portfolio .portfolio-inner, .section-service .service-inner, .section-trusted .trusted-inner, .section-faq .faq-inner, .section-contact .contact-inner'
);
revealTargets.forEach(el => el.classList.add('reveal'));

if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealTargets.forEach(el => io.observe(el));
} else {
  revealTargets.forEach(el => el.classList.add('is-visible'));
}

// Portfolio page filters
const portfolioFilters = document.querySelectorAll('.portfolio-filter');
const portfolioCards = document.querySelectorAll('.pgrid-card');

if (portfolioFilters.length && portfolioCards.length) {
  portfolioFilters.forEach(btn => {
    btn.addEventListener('click', () => {
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
    });
  });
}

// Contact form — no backend yet, so "Enviar" opens the visitor's email
// client with the fields pre-filled. Swap for a real submit once there's
// an endpoint to send to.
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const reason = contactForm.querySelector('input[name="reason"]:checked')?.value || '';
    const name = contactForm.querySelector('#cf-name')?.value || '';
    const email = contactForm.querySelector('#cf-email')?.value || '';
    const message = contactForm.querySelector('#cf-message')?.value || '';

    const subject = encodeURIComponent(`${reason} — ${name}`.trim());
    const body = encodeURIComponent(`Nombre: ${name}\nEmail: ${email}\n\n${message}`);
    window.location.href = `mailto:hola@ontherocks.com.ar?subject=${subject}&body=${body}`;
  });
}
