/* ═══════════════════════════════════════════════════════
   ONDORA PRODUCTIONS — Script
   ═══════════════════════════════════════════════════════ */

// ─── Navbar scroll effect ───
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const currentScroll = window.scrollY;
  if (currentScroll > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  lastScroll = currentScroll;
}, { passive: true });

// ─── Mobile nav toggle ───
const navToggle = document.getElementById('navToggle');
const navLinks = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  // Animate hamburger
  const spans = navToggle.querySelectorAll('span');
  if (navLinks.classList.contains('open')) {
    spans[0].style.transform = 'translateY(7px) rotate(45deg)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
  } else {
    spans[0].style.transform = '';
    spans[1].style.opacity = '';
    spans[2].style.transform = '';
  }
});

// Close mobile nav on link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    const spans = navToggle.querySelectorAll('span');
    spans[0].style.transform = '';
    spans[1].style.opacity = '';
    spans[2].style.transform = '';
  });
});

// ─── Scroll reveal ───
const revealElements = document.querySelectorAll(
  '.service-card, .projet-card, .apropos-feature, .studio-badge, .floating-card, .section-header'
);

revealElements.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger reveal for cards in same parent
      const siblings = [...entry.target.parentElement.querySelectorAll('.reveal')];
      const index = siblings.indexOf(entry.target);
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, index * 80);
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -60px 0px'
});

revealElements.forEach(el => revealObserver.observe(el));

// ─── Effet perspective souris sur le bandeau diagonal ───
const heroEl = document.querySelector('.hero');
const albumsInner = document.getElementById('heroAlbumsInner');

let targetTiltX = 0, targetTiltY = 0;
let currentTiltX = 0, currentTiltY = 0;
let tiltRafId = null;

if (heroEl && albumsInner) {
  heroEl.addEventListener('mousemove', (e) => {
    const rect = heroEl.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    // Normalise entre -1 et +1
    const nx = (e.clientX - rect.left - cx) / cx;
    const ny = (e.clientY - rect.top - cy) / cy;
    targetTiltX = ny * -3;   // rotateX : ±3°
    targetTiltY = nx * 4;    // rotateY : ±4°
  }, { passive: true });

  heroEl.addEventListener('mouseleave', () => {
    targetTiltX = 0;
    targetTiltY = 0;
  });

  function animateTilt() {
    // Lerp pour un mouvement fluide et retardé
    currentTiltX += (targetTiltX - currentTiltX) * 0.07;
    currentTiltY += (targetTiltY - currentTiltY) * 0.07;

    albumsInner.style.transform =
      `rotate(-7deg) perspective(1400px) rotateX(${currentTiltX}deg) rotateY(${currentTiltY}deg)`;

    tiltRafId = requestAnimationFrame(animateTilt);
  }
  animateTilt();
}

// ─── Effet tilt 3D sur le bloc photo À propos ───
const aproposVisual = document.querySelector('.apropos-visual');
const aproposTilt   = document.getElementById('aproposTilt');

let apTargetX = 0, apTargetY = 0;
let apCurrentX = 0, apCurrentY = 0;
let apRafId = null;

if (aproposVisual && aproposTilt) {
  aproposVisual.addEventListener('mousemove', (e) => {
    const rect = aproposVisual.getBoundingClientRect();
    const nx = (e.clientX - rect.left  - rect.width  / 2) / (rect.width  / 2);
    const ny = (e.clientY - rect.top   - rect.height / 2) / (rect.height / 2);
    apTargetX = ny * -5;   // rotateX ±5°
    apTargetY = nx *  6;   // rotateY ±6°
  }, { passive: true });

  aproposVisual.addEventListener('mouseleave', () => {
    apTargetX = 0;
    apTargetY = 0;
  });

  function animateAproposTilt() {
    apCurrentX += (apTargetX - apCurrentX) * 0.07;
    apCurrentY += (apTargetY - apCurrentY) * 0.07;
    aproposTilt.style.transform =
      `perspective(1200px) rotateX(${apCurrentX}deg) rotateY(${apCurrentY}deg)`;
    apRafId = requestAnimationFrame(animateAproposTilt);
  }
  animateAproposTilt();
}

// ─── Services — carousel vertical style Resort Kaskady ───
const servicesScrollZone = document.getElementById('servicesScrollZone');
const svcCards           = document.querySelectorAll('.svc-card');
const svcDots            = document.querySelectorAll('.svc-dot');
const servicesGhostEl    = document.getElementById('servicesGhost');
const svcScrollHintEl    = document.getElementById('svcScrollHint');
const TOTAL_SLIDES       = 3;
const SLIDE_NAMES        = ['Post-Production', 'Composition', 'Enregistrement'];

let svcTargetOffset  = 0;
let svcCurrentOffset = 0;
let svcActiveDot     = -1;

function updateServicesTarget() {
  if (!servicesScrollZone) return;
  const rect      = servicesScrollZone.getBoundingClientRect();
  const zoneH     = servicesScrollZone.offsetHeight;
  const vh        = window.innerHeight;
  const scrolled  = Math.max(0, -rect.top);
  const maxScroll = zoneH - vh;
  const progress  = Math.min(1, scrolled / maxScroll);

  svcTargetOffset = progress * (TOTAL_SLIDES - 1) * 100;

  // Scroll hint : disparaît dès qu'on entre dans la zone
  if (svcScrollHintEl) {
    svcScrollHintEl.style.opacity = scrolled > 40 ? '0' : '1';
  }
}

function animateServicesCarousel() {
  svcCurrentOffset += (svcTargetOffset - svcCurrentOffset) * 0.08;

  // Positionnement vertical de chaque carte (en vh)
  const scrollFrac = svcCurrentOffset / 100;
  svcCards.forEach((card, i) => {
    const yVh = (i - scrollFrac) * 100;
    card.style.transform = `translateY(${yVh}vh)`;
  });

  // Slide active (dot + texte fantôme)
  const dotIndex = Math.min(Math.round(scrollFrac), TOTAL_SLIDES - 1);
  if (dotIndex !== svcActiveDot) {
    svcActiveDot = dotIndex;
    svcDots.forEach((d, i) => d.classList.toggle('active', i === dotIndex));

    // Fondu du texte fantôme
    if (servicesGhostEl) {
      servicesGhostEl.style.opacity = '0';
      setTimeout(() => {
        servicesGhostEl.textContent = SLIDE_NAMES[dotIndex];
        servicesGhostEl.style.opacity = '1';
      }, 200);
    }
  }

  requestAnimationFrame(animateServicesCarousel);
}

window.addEventListener('scroll', updateServicesTarget, { passive: true });
updateServicesTarget();
animateServicesCarousel();

// ─── Projets — brackets inversion + panel vidéo ───
const PJ_OFFSET = 10; // distance bracket / bord de la carte (px)
const PJ_SIZE   = 16; // taille du bracket (px)
let   pjActiveCard = null;

function pjOpenProject(card) {
  // Animer les brackets vers leurs coins inverses
  const W  = card.offsetWidth;
  const H  = card.offsetHeight;
  const dx = W - 2 * PJ_OFFSET - PJ_SIZE;
  const dy = H - 2 * PJ_OFFSET - PJ_SIZE;

  card.querySelector('.pj-br--tl').style.transform = `translate(${dx}px, ${dy}px)`;
  card.querySelector('.pj-br--tr').style.transform = `translate(-${dx}px, ${dy}px)`;
  card.querySelector('.pj-br--bl').style.transform = `translate(${dx}px, -${dy}px)`;
  card.querySelector('.pj-br--br').style.transform = `translate(-${dx}px, -${dy}px)`;

  pjActiveCard = card;

  // Ouvrir le panel après la mi-animation (250ms)
  setTimeout(() => {
    document.getElementById('pjTitle').textContent = card.dataset.title;
    const metaEl = document.getElementById('pjMeta');
    metaEl.innerHTML = '';
    const metaFields = [
      { key: 'format',  label: 'Format' },
      { key: 'annee', label: 'Année' },
      { key: 'duree', label: 'Durée' },
      { key: 'real',  label: 'Réalisation' },
      { key: 'prod',  label: 'Production' },
    ];
    metaFields.forEach(({ key, label }) => {
      if (card.dataset[key]) {
        const li = document.createElement('li');
        li.innerHTML = `<span class="pj-meta-label">${label}</span><span class="pj-meta-value">${card.dataset[key]}</span>`;
        metaEl.appendChild(li);
      }
    });
    document.getElementById('pjDesc').textContent  = card.dataset.desc;
    document.getElementById('pjIframe').src =
      `https://www.youtube.com/embed/${card.dataset.video}?autoplay=1&rel=0`;
    document.getElementById('pjPanel').classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }, 250);
}

function pjCloseProject() {
  // Remettre les brackets à leur position initiale
  if (pjActiveCard) {
    pjActiveCard.querySelectorAll('.pj-br').forEach(br => {
      br.style.transform = '';
    });
    pjActiveCard = null;
  }
  document.getElementById('pjPanel').classList.remove('is-open');
  document.getElementById('pjIframe').src = '';
  document.body.style.overflow = '';
}

// Clic sur une carte
document.querySelectorAll('.pj-card').forEach(card => {
  card.addEventListener('click', () => pjOpenProject(card));
});

// Fermeture
const pjClose    = document.getElementById('pjClose');
const pjBackdrop = document.getElementById('pjPanelBackdrop');
if (pjClose)    pjClose.addEventListener('click',   pjCloseProject);
if (pjBackdrop) pjBackdrop.addEventListener('click', pjCloseProject);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') pjCloseProject();
});


// ─── Smooth anchor scrolling ───
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ─── Active nav link on scroll ───
const sections = document.querySelectorAll('section[id]');
const navAnchorLinks = document.querySelectorAll('.nav-links a[href^="#"]');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 120;
    if (window.scrollY >= sectionTop) {
      current = section.getAttribute('id');
    }
  });

  navAnchorLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
}, { passive: true });

// ─── Pause banner animation on reduced motion ───
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const bannerTrack = document.getElementById('bannerTrack');
  if (bannerTrack) {
    bannerTrack.style.animationPlayState = 'paused';
  }
}

