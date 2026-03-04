/* ================================================================
   EKKO MUSIC — Script principal
   ================================================================ */

// ── NAVBAR SCROLL ──────────────────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

// ── MENU MOBILE ────────────────────────────────────────────────
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('open');
  navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

// ── REVEAL AU SCROLL ───────────────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // stagger delay basé sur la position dans la grille
      const delay = entry.target.closest('.services-grid, .projets-grid')
        ? [...entry.target.parentElement.children].indexOf(entry.target) * 80
        : 0;
      setTimeout(() => entry.target.classList.add('visible'), delay);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── FILTRE PROJETS ─────────────────────────────────────────────
const filterBtns  = document.querySelectorAll('.filter-btn');
const projetCards = document.querySelectorAll('.projet-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    projetCards.forEach(card => {
      const match = filter === 'all' || card.dataset.category === filter;
      card.style.opacity = '0';
      card.style.transform = 'translateY(12px)';

      setTimeout(() => {
        card.classList.toggle('hidden', !match);
        if (match) {
          requestAnimationFrame(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          });
        }
      }, 200);
    });
  });
});

// Transition CSS pour les cartes de projet
projetCards.forEach(card => {
  card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
});

// ── PARTICLES HERO ─────────────────────────────────────────────
(function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  const COUNT = 40;
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < COUNT; i++) {
    const p = document.createElement('div');
    const size = Math.random() * 2 + 0.5;
    const x    = Math.random() * 100;
    const y    = Math.random() * 100;
    const dur  = Math.random() * 8 + 6;
    const del  = Math.random() * 6;

    p.style.cssText = `
      position: absolute;
      left: ${x}%;
      top: ${y}%;
      width: ${size}px;
      height: ${size}px;
      background: rgba(201, 168, 76, ${Math.random() * 0.4 + 0.1});
      border-radius: 50%;
      animation: floatParticle ${dur}s ${del}s ease-in-out infinite alternate;
      pointer-events: none;
    `;
    fragment.appendChild(p);
  }

  container.appendChild(fragment);

  // Injection du keyframe si absent
  if (!document.getElementById('particleKF')) {
    const style = document.createElement('style');
    style.id = 'particleKF';
    style.textContent = `
      @keyframes floatParticle {
        from { transform: translate(0, 0) scale(1); opacity: 0.3; }
        to   { transform: translate(${randRange(-30, 30)}px, ${randRange(-40, -10)}px) scale(1.3); opacity: 0.8; }
      }
    `;
    document.head.appendChild(style);
  }

  function randRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
})();

// ── FORMULAIRE DE CONTACT ──────────────────────────────────────
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const nom     = document.getElementById('nom').value.trim();
    const email   = document.getElementById('email').value.trim();
    const sujet   = document.getElementById('sujet').value;
    const message = document.getElementById('message').value.trim();

    if (!nom || !email || !message) {
      shakeForm(contactForm);
      return;
    }

    const sujetLabel = sujet
      ? `[Ekko Music - ${sujet}] Message de ${nom}`
      : `[Ekko Music] Message de ${nom}`;

    const body = encodeURIComponent(
      `Bonjour Ekko,\n\nJe m'appelle ${nom}.\n\n${message}\n\nCordialement,\n${nom}\n${email}`
    );

    window.location.href =
      `mailto:ekkomusicoff@gmail.com?subject=${encodeURIComponent(sujetLabel)}&body=${body}`;
  });
}

function shakeForm(form) {
  form.style.animation = 'shake 0.4s ease';
  form.addEventListener('animationend', () => { form.style.animation = ''; }, { once: true });

  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%, 60%  { transform: translateX(-6px); }
      40%, 80%  { transform: translateX(6px); }
    }
  `;
  document.head.appendChild(style);
}

// ── ACTIVE NAV LINK AU SCROLL ─────────────────────────────────
const sections    = document.querySelectorAll('section[id]');
const navAnchors  = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navAnchors.forEach(a => {
        a.style.color = '';
        if (a.getAttribute('href') === `#${entry.target.id}`) {
          a.style.color = 'var(--gold)';
        }
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));

// ── CURSEUR PERSONNALISÉ (desktop uniquement) ─────────────────
if (window.matchMedia('(pointer: fine)').matches) {
  const cursor = document.createElement('div');
  cursor.id = 'custom-cursor';
  cursor.style.cssText = `
    position: fixed;
    width: 8px; height: 8px;
    background: var(--gold, #c9a84c);
    border-radius: 50%;
    pointer-events: none;
    z-index: 9999;
    transition: transform 0.15s ease, opacity 0.3s ease;
    transform: translate(-50%, -50%);
    top: 0; left: 0;
  `;

  const cursorRing = document.createElement('div');
  cursorRing.style.cssText = `
    position: fixed;
    width: 32px; height: 32px;
    border: 1px solid rgba(201, 168, 76, 0.5);
    border-radius: 50%;
    pointer-events: none;
    z-index: 9998;
    transition: transform 0.25s ease, width 0.25s ease, height 0.25s ease;
    transform: translate(-50%, -50%);
    top: 0; left: 0;
  `;

  document.body.appendChild(cursor);
  document.body.appendChild(cursorRing);

  let mx = 0, my = 0;
  document.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
    cursorRing.style.left = mx + 'px';
    cursorRing.style.top  = my + 'px';
  });

  document.querySelectorAll('a, button, .projet-card, .service-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursorRing.style.width  = '52px';
      cursorRing.style.height = '52px';
      cursorRing.style.borderColor = 'rgba(201, 168, 76, 0.9)';
      cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
    });
    el.addEventListener('mouseleave', () => {
      cursorRing.style.width  = '32px';
      cursorRing.style.height = '32px';
      cursorRing.style.borderColor = 'rgba(201, 168, 76, 0.5)';
      cursor.style.transform = 'translate(-50%, -50%) scale(1)';
    });
  });
}
