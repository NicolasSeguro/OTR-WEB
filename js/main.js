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
      const filter = btn.getAttribute('data-filter');

      portfolioFilters.forEach(b => {
        b.classList.toggle('is-active', b === btn);
        b.setAttribute('aria-pressed', String(b === btn));
      });

      portfolioCards.forEach(card => {
        const cat = card.getAttribute('data-cat');
        const show = filter === 'all' || cat === filter;
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
