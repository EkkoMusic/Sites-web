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

// ─── Contact form ───
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    btn.textContent = 'Message envoyé !';
    btn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
    btn.disabled = true;
    setTimeout(() => {
      btn.innerHTML = 'Envoyer le message <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';
      btn.style.background = '';
      btn.disabled = false;
      contactForm.reset();
    }, 3000);
  });
}

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

