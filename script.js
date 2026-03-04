/* ================================================================
   EKKO MUSIC — Script principal
   ================================================================ */

'use strict';

// ── CURSEUR PERSONNALISÉ ────────────────────────────────────────
const dot  = document.getElementById('cursor-dot');
const ring = document.getElementById('cursor-ring');

let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  dot.style.left  = mx + 'px';
  dot.style.top   = my + 'px';
});

// Ring suit avec un léger lag
(function animRing() {
  rx += (mx - rx) * 0.12;
  ry += (my - ry) * 0.12;
  ring.style.left = rx + 'px';
  ring.style.top  = ry + 'px';
  requestAnimationFrame(animRing);
})();

document.querySelectorAll('a, button, .cover, .pcard, .svc').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});

// ── NAVBAR SCROLL ───────────────────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// ── MENU MOBILE ─────────────────────────────────────────────────
const toggle = document.getElementById('navToggle');
const links  = document.getElementById('navLinks');

toggle.addEventListener('click', () => {
  toggle.classList.toggle('open');
  links.classList.toggle('open');
});
links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  toggle.classList.remove('open');
  links.classList.remove('open');
}));

/* ================================================================
   ARC 3D DE COVERS
   ================================================================
   Principe : les covers sont placées en arc (cercle vu de face).
   L'arc tourne lentement en continu (auto-drift).
   La souris crée un léger parallax supplémentaire.
   ================================================================ */
(function initArc() {
  const covers  = [...document.querySelectorAll('.cover')];
  const N       = covers.length;
  if (!N) return;

  // Paramètres de l'arc
  const RADIUS     = Math.min(window.innerWidth * 0.55, 520); // rayon du cercle
  const SPREAD     = 0.62;   // portion du cercle utilisée (0.5 = demi-cercle)
  const DRIFT_SPD  = 0.00018; // vitesse de rotation auto (rad/frame)
  const TILT       = 18;      // inclinaison X de la scène (deg)

  let baseAngle    = 0;       // angle de base (auto-drift)
  let mouseOffsetX = 0;       // parallax souris
  let targetMouseX = 0;

  // Écoute souris pour parallax
  document.addEventListener('mousemove', e => {
    targetMouseX = ((e.clientX / window.innerWidth) - 0.5) * 0.3;
  });

  // Profondeur → opacité + échelle
  function depthToStyle(z, maxZ) {
    const t = (z + maxZ) / (2 * maxZ); // 0→1 (0=arrière, 1=avant)
    return {
      scale:   0.65 + t * 0.35,
      opacity: 0.25 + t * 0.75,
      blur:    (1 - t) * 3,
    };
  }

  function layout() {
    mouseOffsetX += (targetMouseX - mouseOffsetX) * 0.06;

    const totalAngle = Math.PI * 2 * SPREAD;
    const startAngle = -totalAngle / 2;

    covers.forEach((cover, i) => {
      const fraction = N > 1 ? i / (N - 1) : 0.5;
      const theta = startAngle + fraction * totalAngle + baseAngle + mouseOffsetX;

      const x = Math.sin(theta) * RADIUS;
      const z = Math.cos(theta) * RADIUS;

      const { scale, opacity, blur } = depthToStyle(z, RADIUS);

      // zIndex : les covers à l'avant passent par-dessus
      const zIndex = Math.round((z + RADIUS) * 10);

      cover.style.zIndex   = zIndex;
      cover.style.opacity  = opacity;

      // translateX + translateZ dans la perspective, translateY centrage vertical
      cover.style.transform =
        `translateX(${x}px) translateZ(${z * 0.4}px) translateY(-50%) scale(${scale})`;

      if (blur > 0.3) {
        cover.style.filter = `blur(${blur.toFixed(1)}px)`;
      } else {
        cover.style.filter = 'none';
      }
    });

    baseAngle -= DRIFT_SPD;
    requestAnimationFrame(layout);
  }

  // Applique perspective sur le track
  const track = document.getElementById('arcTrack');
  track.style.transformStyle  = 'preserve-3d';
  track.style.transform       = `rotateX(${TILT}deg)`;
  track.style.width           = '0px'; // les covers sont positionnées absolument

  layout();

  // Pause au survol d'une cover
  covers.forEach(cover => {
    cover.addEventListener('mouseenter', () => { /* drift continue, juste visuellement agrandi */ });
  });
})();

/* ================================================================
   FILTRE PROJETS
   ================================================================ */
document.querySelectorAll('.f-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.f-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const f = btn.dataset.f;
    document.querySelectorAll('.pcard').forEach(card => {
      const show = f === 'all' || card.dataset.f === f;
      card.style.transition = 'opacity .35s, transform .35s';
      if (show) {
        card.classList.remove('hidden');
        requestAnimationFrame(() => { card.style.opacity = '1'; card.style.transform = ''; });
      } else {
        card.style.opacity = '0';
        card.style.transform = 'translateY(8px)';
        setTimeout(() => card.classList.add('hidden'), 350);
      }
    });
  });
});

/* ================================================================
   SCROLL REVEAL
   ================================================================ */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity  = '1';
      e.target.style.transform = 'translateY(0)';
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll(
  '.svc, .pcard, .apropos-right, .contact-left, .contact-form, .section-head'
).forEach(el => {
  el.style.opacity   = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity .7s ease, transform .7s ease';
  revealObs.observe(el);
});

/* ================================================================
   FORMULAIRE CONTACT → mailto
   ================================================================ */
document.getElementById('contactForm').addEventListener('submit', e => {
  e.preventDefault();
  const nom     = document.getElementById('nom').value.trim();
  const email   = document.getElementById('email').value.trim();
  const sujet   = document.getElementById('sujet').value;
  const message = document.getElementById('message').value.trim();

  if (!nom || !email || !message) {
    const form = e.target;
    form.style.animation = 'shake .4s ease';
    form.addEventListener('animationend', () => form.style.animation = '', { once: true });
    return;
  }

  const subj = encodeURIComponent(`[Ekko Music${sujet ? ' · ' + sujet : ''}] Message de ${nom}`);
  const body = encodeURIComponent(`Bonjour Ekko,\n\n${message}\n\nCordialement,\n${nom}\n${email}`);
  window.location.href = `mailto:ekkomusicoff@gmail.com?subject=${subj}&body=${body}`;
});

// CSS shake
const s = document.createElement('style');
s.textContent = `
  @keyframes shake {
    0%,100%{ transform:translateX(0) }
    20%,60%{ transform:translateX(-6px) }
    40%,80%{ transform:translateX(6px) }
  }
`;
document.head.appendChild(s);
