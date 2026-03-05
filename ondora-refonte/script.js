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

// ─── Services scroll-driven carousel (continu + lerp) ───
const servicesScrollZone   = document.getElementById('servicesScrollZone');
const servicesTrack        = document.getElementById('servicesCarouselTrack');
const servicesDots         = document.querySelectorAll('.services-dot');
const servicesProgressFill = document.getElementById('servicesProgressFill');
const servicesScrollHint   = document.getElementById('servicesScrollHint');
const TOTAL_SLIDES = 8;

let svcTargetOffset  = 0;   // offset cible en % (0 → 700)
let svcCurrentOffset = 0;   // offset affiché (lerp)
let svcActiveDot     = -1;

function updateServicesTarget() {
  if (!servicesScrollZone) return;
  const rect      = servicesScrollZone.getBoundingClientRect();
  const zoneH     = servicesScrollZone.offsetHeight;
  const vh        = window.innerHeight;
  const scrolled  = Math.max(0, -rect.top);
  const maxScroll = zoneH - vh;
  const progress  = Math.min(1, scrolled / maxScroll);

  // Offset continu : 0% → 700% (7 transitions pour 8 slides)
  svcTargetOffset = progress * (TOTAL_SLIDES - 1) * 100;

  // Scroll hint : disparaît dès qu'on commence à scroller dans la zone
  if (servicesScrollHint) {
    servicesScrollHint.style.opacity = scrolled > 40 ? '0' : '1';
  }
}

function animateServicesCarousel() {
  // Lerp fluide vers la cible (coeff 0.08 = suivi rapide mais doux)
  svcCurrentOffset += (svcTargetOffset - svcCurrentOffset) * 0.08;

  if (servicesTrack) {
    servicesTrack.style.transform = `translateX(-${svcCurrentOffset.toFixed(3)}%)`;
  }

  // Mise à jour dot actif (arrondi le plus proche)
  const dotIndex = Math.min(
    Math.round(svcCurrentOffset / 100),
    TOTAL_SLIDES - 1
  );
  if (dotIndex !== svcActiveDot) {
    svcActiveDot = dotIndex;
    servicesDots.forEach((d, i) => d.classList.toggle('active', i === dotIndex));
    if (servicesProgressFill) {
      servicesProgressFill.style.width = `${((dotIndex + 1) / TOTAL_SLIDES) * 100}%`;
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

// ─── Caméra 3D Three.js (PXW-X160 / modèle procédural) ───
(function initCameraScene() {
  const canvas = document.getElementById('cameraCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const W = 360, H = 270;
  canvas.width  = W * window.devicePixelRatio;
  canvas.height = H * window.devicePixelRatio;
  canvas.style.width  = W + 'px';
  canvas.style.height = H + 'px';

  // ── Renderer ──
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(W, H);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  // ── Scène ──
  const scene = new THREE.Scene();

  // ── Caméra viewport ──
  const threeCamera = new THREE.PerspectiveCamera(40, W / H, 0.1, 100);
  // Angle 3/4 avant-droit légèrement en hauteur, comme l'image de référence
  threeCamera.position.set(3.8, 2.8, 4.5);
  threeCamera.lookAt(0, 0.3, 0);

  // ── Lumières studio ──

  // Lumière ambiante très faible (pièce sombre)
  scene.add(new THREE.AmbientLight(0x0d0d1a, 1));

  // Key light : spot chaud venant du haut-gauche (simule un projecteur de studio)
  const keyLight = new THREE.SpotLight(0xfff4e0, 6, 25, Math.PI / 5, 0.3, 1.5);
  keyLight.position.set(-5, 8, 6);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(512, 512);
  scene.add(keyLight);
  scene.add(keyLight.target); // target reste à l'origine

  // Fill light : violet doux depuis la droite-arrière
  const fillLight = new THREE.PointLight(0x7c3aed, 2.5, 14);
  fillLight.position.set(5, -1, 3);
  scene.add(fillLight);

  // Rim light : rose chaud derrière la caméra (séparation)
  const rimLight = new THREE.PointLight(0xec4899, 3, 10);
  rimLight.position.set(1, 4, -5);
  scene.add(rimLight);

  // Point de lumière orbitant autour du modèle (effet "halo de studio")
  const orbitLight = new THREE.PointLight(0x9b5cf6, 4, 8);
  scene.add(orbitLight);

  // ── Modèle procédural de caméra broadcast (PXW-X160) ──
  function buildProceduralCamera() {
    const group = new THREE.Group();
    const matBody = new THREE.MeshStandardMaterial({ color: 0x1c1c1c, roughness: 0.55, metalness: 0.5 });
    const matDark = new THREE.MeshStandardMaterial({ color: 0x0e0e0e, roughness: 0.7, metalness: 0.3 });
    const matAccent = new THREE.MeshStandardMaterial({ color: 0x7c3aed, roughness: 0.2, metalness: 0.9 });
    const matGlass = new THREE.MeshStandardMaterial({ color: 0x0a0a20, roughness: 0.0, metalness: 1.0, transparent: true, opacity: 0.85 });
    const matRed = new THREE.MeshStandardMaterial({ color: 0xff2020, emissive: 0xff0000, emissiveIntensity: 0.6, roughness: 0.4 });

    // Corps principal (bloc épaule)
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.5, 1.2), matBody);
    group.add(body);

    // Plaque d'épaule (dessous, plus large)
    const shoulder = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.35, 1.4), matDark);
    shoulder.position.set(0, -0.92, 0);
    group.add(shoulder);

    // Baril objectif — corps extérieur
    const lensBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.46, 2.0, 28), matBody);
    lensBarrel.rotation.x = Math.PI / 2;
    lensBarrel.position.set(0, 0.1, -1.5);
    group.add(lensBarrel);

    // Baril objectif — anneau avant
    const lensRing = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.12, 28), matAccent);
    lensRing.rotation.x = Math.PI / 2;
    lensRing.position.set(0, 0.1, -2.44);
    group.add(lensRing);

    // Verre de l'objectif
    const lensGlass = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.08, 28), matGlass);
    lensGlass.rotation.x = Math.PI / 2;
    lensGlass.position.set(0, 0.1, -2.52);
    group.add(lensGlass);

    // Viseur (dessus-droite)
    const viewfinder = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.65, 0.9), matBody);
    viewfinder.position.set(0.85, 1.1, 0.15);
    group.add(viewfinder);

    // Oculaire du viseur
    const eyepiece = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.4, 16), matDark);
    eyepiece.rotation.z = Math.PI / 2;
    eyepiece.position.set(1.5, 1.1, 0.15);
    group.add(eyepiece);

    // Poignée (dessus)
    const handle = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.16, 0.32), matBody);
    handle.position.set(0, 1.0, -0.1);
    group.add(handle);

    // Bouton REC
    const recBtn = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.08, 16), matRed);
    recBtn.rotation.x = Math.PI / 2;
    recBtn.position.set(-1.1, 0.42, 0.62);
    group.add(recBtn);

    // Liseré accentué côté gauche (ligne de design)
    const accentStripe = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.3, 1.22), matAccent);
    accentStripe.position.set(-1.32, 0, 0);
    group.add(accentStripe);

    // Petit écran LCD latéral (côté gauche)
    const lcd = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.6, 0.85),
      new THREE.MeshStandardMaterial({ color: 0x000814, roughness: 0, metalness: 0.8, emissive: 0x0a1628, emissiveIntensity: 0.4 })
    );
    lcd.position.set(-1.35, 0.1, -0.05);
    group.add(lcd);

    return group;
  }

  // Groupe principal (contient le modèle — STL ou procédural)
  const cameraGroup = new THREE.Group();
  scene.add(cameraGroup);

  // Essayer de charger le STL, sinon fallback procédural
  function useProceduralModel() {
    const model = buildProceduralCamera();
    cameraGroup.add(model);
    canvas.classList.add('loaded');
  }

  if (typeof THREE.STLLoader !== 'undefined') {
    const loader = new THREE.STLLoader();
    loader.load(
      './images/uploads_files_2562591_PXW-X160.STL',
      (geometry) => {
        geometry.computeVertexNormals();
        // Centrer et normaliser la taille du STL
        geometry.computeBoundingBox();
        const box = geometry.boundingBox;
        const center = new THREE.Vector3();
        box.getCenter(center);
        geometry.translate(-center.x, -center.y, -center.z);
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 3.5 / maxDim;

        const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({
          color: 0x1c1c1c,
          roughness: 0.5,
          metalness: 0.55,
        }));
        mesh.scale.setScalar(scale);
        // Réorientation STL : corps droit, objectif vers le bas-gauche
        // Z-up → Y-up (-PI/2 sur X), puis rotation Y pour angle 3/4 référence
        mesh.rotation.set(-Math.PI / 2, 0, -Math.PI * 0.2);
        cameraGroup.add(mesh);
        canvas.classList.add('loaded');
      },
      undefined,
      () => useProceduralModel() // erreur → fallback
    );
  } else {
    useProceduralModel();
  }

  // ── État animation caméra ──
  let camPanAngle   = 0;   // rotation Y du modèle (suivi carousel)
  let camPanVel     = 0;   // vélocité de panning
  let prevSvcOff    = 0;   // offset carousel précédent
  const clock       = new THREE.Clock();

  // ── Boucle de rendu ──
  function renderCamera() {
    requestAnimationFrame(renderCamera);

    const t = clock.getElapsedTime();

    // --- Suivi carousel ---
    const offsetDelta = svcCurrentOffset - prevSvcOff;
    prevSvcOff = svcCurrentOffset;

    // Le delta fait pivoter la caméra dans la direction du contenu défilant
    camPanVel += offsetDelta * 0.0012;
    camPanVel *= 0.90;                      // friction
    camPanAngle += camPanVel;
    camPanAngle *= 0.96;                    // retour progressif vers zéro
    camPanAngle = Math.max(-0.55, Math.min(0.55, camPanAngle));

    cameraGroup.rotation.y = camPanAngle;

    // Légère inclinaison verticale quand la caméra "suit" (tilt opérateur)
    cameraGroup.rotation.x = camPanVel * 0.4;

    // Float & balancement idle
    cameraGroup.position.y = Math.sin(t * 0.75) * 0.12;
    cameraGroup.rotation.z = Math.sin(t * 0.5)  * 0.018;

    // --- Lumière orbitante ---
    orbitLight.position.set(
      Math.sin(t * 0.45) * 3.5,
      Math.cos(t * 0.3)  * 1.8 + 1.2,
      Math.sin(t * 0.7)  * 2.8
    );
    // Pulsation de l'intensité
    orbitLight.intensity = 3.5 + Math.sin(t * 1.2) * 1.0;

    renderer.render(scene, threeCamera);
  }

  renderCamera();
})();
