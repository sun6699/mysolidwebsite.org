// script.js
// - Mobile nav toggles
// - Smooth scrolling
// - Contact form validation + Formspree POST (configurable endpoint)
// - IntersectionObserver-based scroll reveal

(function () {
  // CONFIG: Replace with your Formspree form endpoint when ready:
  // Example: 'https://formspree.io/f/mxyzabc'
  const FORM_ENDPOINT = 'https://formspree.io/f/your-form-id'; // <-- replace this

  // DOM references
  const nav = document.getElementById('mainNav') || document.getElementById('mainNav2');
  const toggle = document.getElementById('navToggle') || document.getElementById('navToggle2');
  const yearEls = [document.getElementById('year'), document.getElementById('year2')].filter(Boolean);
  const form = document.getElementById('contactForm');

  // set year
  yearEls.forEach(el => el.textContent = new Date().getFullYear());

  // Mobile nav toggle
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', nav.classList.contains('open'));
    });
  }

  // Smooth internal link scrolling (works across pages)
  document.querySelectorAll('a[href^="#"], a[href$="index.html"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (nav && nav.classList.contains('open')) nav.classList.remove('open');
      }
    });
  });

  // Highlight active nav links (simple)
  document.querySelectorAll('.nav a').forEach(a => {
    if (a.href === location.href || (a.getAttribute('href') === location.pathname.split('/').pop())) {
      a.classList.add('active');
    }
  });

  // Scroll reveal: observe elements with .reveal
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // Contact form: validation + send
  if (form) {
    const successEl = document.getElementById('formSuccess');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearErrors();

      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const message = form.message.value.trim();

      let ok = true;
      if (name.length < 2) { showError('name', 'Please enter your name (2+ chars).'); ok = false; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showError('email', 'Please enter a valid email.'); ok = false; }
      if (message.length < 10) { showError('message', 'Message must be at least 10 characters.'); ok = false; }
      if (!ok) return;

      // If the placeholder endpoint is still present, simulate send with helpful message.
      if (FORM_ENDPOINT.includes('your-form-id')) {
        successEl.textContent = 'Simulated send: replace FORM_ENDPOINT in script.js with your Formspree endpoint to enable real submission.';
        // tiny animated "sent" feel
        setTimeout(() => {
          successEl.textContent = 'Thanks! Your message has been simulated as sent.';
          form.reset();
        }, 700);
        return;
      }

      try {
        successEl.textContent = 'Sending...';
        const payload = {
          name, email, message, page: location.href
        };

        const res = await fetch(FORM_ENDPOINT, {
          method: 'POST',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          successEl.textContent = 'Thanks! Your message has been sent.';
          form.reset();
        } else {
          const data = await res.json().catch(() => ({}));
          successEl.textContent = data.error || 'Submission failed. Try again later.';
        }
      } catch (err) {
        successEl.textContent = 'Network error. Check your connection and try again.';
        console.error(err);
      }
    });

    function showError(field, text) {
      const el = document.querySelector(`.error[data-for="${field}"]`);
      if (el) el.textContent = text;
    }
    function clearErrors() {
      document.querySelectorAll('.error').forEach(e => e.textContent = '');
      const success = document.getElementById('formSuccess');
      if (success) success.textContent = '';
    }
  }

  // Expose a tiny debug helper in browser console
  window.mysite = {
    revealObserver,
    simulateReveal: (delay = 60) => {
      document.querySelectorAll('.reveal').forEach((el, i) => {
        setTimeout(() => el.classList.add('revealed'), i * delay);
      });
    }
  };
})();