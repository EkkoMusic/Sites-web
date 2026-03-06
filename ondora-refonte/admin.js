/* ═══════════════════════════════════════════
   ONDORA — Admin Panel · admin.js
   ═══════════════════════════════════════════ */

// Hash SHA-256 du mot de passe (le mot de passe en clair n'est jamais stocké)
const ADMIN_HASH   = '92819205c29c2f8ea2a7651f5538d64f9d8816113d6c98af5f73921480540c03';
const MAX_PROJECTS = 10;
const STORAGE_KEY  = 'ondora_projects';

let projects    = [];
let editIndex   = null;
let deleteIndex = null;

async function sha256(str) {
  const buf  = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ─── Auth ───────────────────────────────────
const loginScreen = document.getElementById('loginScreen');
const app         = document.getElementById('app');
const pwInput     = document.getElementById('pwInput');
const loginBtn    = document.getElementById('loginBtn');
const loginError  = document.getElementById('loginError');
const logoutBtn   = document.getElementById('logoutBtn');

function checkAuth() {
  if (sessionStorage.getItem('ondora_admin') === '1') showApp();
}

function showApp() {
  loginScreen.style.display = 'none';
  app.style.display = 'flex';
  loadData();
}

loginBtn.addEventListener('click', async () => {
  const hash = await sha256(pwInput.value);
  if (hash === ADMIN_HASH) {
    sessionStorage.setItem('ondora_admin', '1');
    loginError.style.display = 'none';
    showApp();
  } else {
    loginError.style.display = 'block';
    pwInput.value = '';
    pwInput.focus();
  }
});
pwInput.addEventListener('keydown', e => { if (e.key === 'Enter') loginBtn.click(); });

logoutBtn.addEventListener('click', () => {
  sessionStorage.removeItem('ondora_admin');
  location.reload();
});

// ─── Data ───────────────────────────────────
async function loadData() {
  // Priorité : localStorage (modifications en cours) → projects.json (source de vérité)
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    projects = JSON.parse(saved);
    renderGrid();
    return;
  }
  try {
    const res = await fetch('projects.json?v=' + Date.now());
    projects  = await res.json();
    renderGrid();
  } catch (e) {
    toast('Impossible de charger projects.json', 'error');
  }
}

function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

// ─── Render ─────────────────────────────────
const grid    = document.getElementById('admGrid');
const counter = document.getElementById('counter');

function renderGrid() {
  grid.innerHTML = '';
  counter.textContent = `${projects.length} / ${MAX_PROJECTS} projets`;
  counter.className   = 'counter' + (projects.length >= MAX_PROJECTS ? ' full' : '');

  projects.forEach((p, i) => {
    const card = document.createElement('div');
    card.className   = 'adm-card';
    card.draggable   = true;
    card.dataset.idx = i;
    card.innerHTML = `
      <div class="adm-card__thumb">
        <span class="adm-card__num">${i + 1}</span>
        <img src="https://img.youtube.com/vi/${p.video}/mqdefault.jpg" alt="${p.title}" loading="lazy">
      </div>
      <div class="adm-card__body">
        <div class="adm-card__title">${p.title}</div>
        <div class="adm-card__meta">
          ${p.format ? `<span class="adm-card__tag">${p.format}</span>` : ''}
          ${p.annee  ? `<span>${p.annee}</span>` : ''}
          ${p.duree  ? `<span>${p.duree}</span>` : ''}
        </div>
      </div>
      <div class="adm-card__actions">
        <button class="btn btn--ghost btn--sm" data-action="edit" data-idx="${i}">Modifier</button>
        <button class="btn btn--danger btn--sm" data-action="delete" data-idx="${i}">Supprimer</button>
      </div>`;

    // Drag & drop
    card.addEventListener('dragstart', onDragStart);
    card.addEventListener('dragover',  onDragOver);
    card.addEventListener('dragleave', onDragLeave);
    card.addEventListener('drop',      onDrop);
    card.addEventListener('dragend',   onDragEnd);

    grid.appendChild(card);
  });

  // Bouton Ajouter
  if (projects.length < MAX_PROJECTS) {
    const addCard = document.createElement('div');
    addCard.className = 'adm-card adm-card--add';
    addCard.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="16"/>
        <line x1="8" y1="12" x2="16" y2="12"/>
      </svg>
      Ajouter un projet`;
    addCard.addEventListener('click', () => openModal(null));
    grid.appendChild(addCard);
  }

  // Délégation pour Modifier / Supprimer
  grid.addEventListener('click', onGridClick);
}

function onGridClick(e) {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const idx = parseInt(btn.dataset.idx, 10);
  if (btn.dataset.action === 'edit')   openModal(idx);
  if (btn.dataset.action === 'delete') openConfirm(idx);
}

// ─── Drag & Drop ────────────────────────────
let dragSrcIdx = null;

function onDragStart(e) {
  dragSrcIdx = parseInt(this.dataset.idx, 10);
  this.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
}
function onDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  this.classList.add('drag-over');
}
function onDragLeave() { this.classList.remove('drag-over'); }
function onDrop(e) {
  e.preventDefault();
  this.classList.remove('drag-over');
  const targetIdx = parseInt(this.dataset.idx, 10);
  if (dragSrcIdx === null || dragSrcIdx === targetIdx) return;
  const moved = projects.splice(dragSrcIdx, 1)[0];
  projects.splice(targetIdx, 0, moved);
  saveToStorage();
  renderGrid();
  toast('Ordre mis à jour');
}
function onDragEnd() {
  this.classList.remove('dragging');
  dragSrcIdx = null;
}

// ─── Modal Edit / Add ───────────────────────
const modalBackdrop = document.getElementById('modalBackdrop');
const modalTitle    = document.getElementById('modalTitle');
const modalClose    = document.getElementById('modalClose');
const modalCancel   = document.getElementById('modalCancel');
const modalSave     = document.getElementById('modalSave');
const thumbPreview  = document.getElementById('thumbPreview');

const fVideo    = document.getElementById('fVideo');
const fTitle    = document.getElementById('fTitle');
const fFormat   = document.getElementById('fFormat');
const fAnnee    = document.getElementById('fAnnee');
const fDuree    = document.getElementById('fDuree');
const fReal     = document.getElementById('fReal');
const fProd     = document.getElementById('fProd');
const fDesc     = document.getElementById('fDesc');
const fBgSize   = document.getElementById('fBgSize');
const fBgPos    = document.getElementById('fBgPosition');

function openModal(idx) {
  editIndex = idx;
  if (idx !== null) {
    const p = projects[idx];
    modalTitle.textContent = 'Modifier le projet';
    fVideo.value    = p.video       || '';
    fTitle.value    = p.title       || '';
    fFormat.value   = p.format      || '';
    fAnnee.value    = p.annee       || '';
    fDuree.value    = p.duree       || '';
    fReal.value     = p.real        || '';
    fProd.value     = p.prod        || '';
    fDesc.value     = p.desc        || '';
    fBgSize.value   = p.bgSize      || '';
    fBgPos.value    = p.bgPosition  || '';
    updateThumb(p.video);
  } else {
    modalTitle.textContent = 'Ajouter un projet';
    [fVideo,fTitle,fFormat,fAnnee,fDuree,fReal,fProd,fDesc,fBgSize,fBgPos]
      .forEach(f => f.value = '');
    thumbPreview.src = '';
  }
  modalBackdrop.classList.add('open');
  fVideo.focus();
}

function closeModal() { modalBackdrop.classList.remove('open'); }
modalClose.addEventListener('click',  closeModal);
modalCancel.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', e => { if (e.target === modalBackdrop) closeModal(); });

fVideo.addEventListener('input', () => updateThumb(fVideo.value.trim()));

function updateThumb(videoId) {
  if (videoId && videoId.length > 5) {
    thumbPreview.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    thumbPreview.style.display = 'block';
  } else {
    thumbPreview.src = '';
    thumbPreview.style.display = 'none';
  }
}

modalSave.addEventListener('click', () => {
  const videoId = fVideo.value.trim();
  const title   = fTitle.value.trim();
  if (!videoId || !title) {
    toast('L\'ID vidéo et le titre sont requis', 'error');
    return;
  }

  const project = {
    id:         editIndex !== null ? projects[editIndex].id : Date.now(),
    video:      videoId,
    title,
    format:     fFormat.value.trim()  || null,
    annee:      fAnnee.value.trim()   || null,
    duree:      fDuree.value.trim()   || null,
    real:       fReal.value.trim()    || null,
    prod:       fProd.value.trim()    || null,
    desc:       fDesc.value.trim()    || null,
    bgSize:     fBgSize.value.trim()  || null,
    bgPosition: fBgPos.value.trim()   || null,
  };

  if (editIndex !== null) {
    projects[editIndex] = project;
    toast(`"${title}" mis à jour`);
  } else {
    projects.push(project);
    toast(`"${title}" ajouté`);
  }

  saveToStorage();
  closeModal();
  renderGrid();
});

// ─── Confirm Delete ─────────────────────────
const confirmBackdrop = document.getElementById('confirmBackdrop');
const confirmClose    = document.getElementById('confirmClose');
const confirmCancel   = document.getElementById('confirmCancel');
const confirmDelete   = document.getElementById('confirmDelete');
const confirmText     = document.getElementById('confirmText');

function openConfirm(idx) {
  deleteIndex = idx;
  confirmText.textContent = `Supprimer "${projects[idx].title}" ? Cette action ne peut pas être annulée.`;
  confirmBackdrop.classList.add('open');
}
function closeConfirm() { confirmBackdrop.classList.remove('open'); }
confirmClose.addEventListener('click',  closeConfirm);
confirmCancel.addEventListener('click', closeConfirm);
confirmBackdrop.addEventListener('click', e => { if (e.target === confirmBackdrop) closeConfirm(); });
confirmDelete.addEventListener('click', () => {
  const name = projects[deleteIndex].title;
  projects.splice(deleteIndex, 1);
  saveToStorage();
  renderGrid();
  closeConfirm();
  toast(`"${name}" supprimé`);
});

// ─── Export JSON ────────────────────────────
document.getElementById('exportBtn').addEventListener('click', () => {
  // Nettoie les IDs internes avant export
  const clean = projects.map(({ id, ...rest }) => rest);
  const blob  = new Blob([JSON.stringify(clean, null, 2)], { type: 'application/json' });
  const url   = URL.createObjectURL(blob);
  const a     = document.createElement('a');
  a.href      = url;
  a.download  = 'projects.json';
  a.click();
  URL.revokeObjectURL(url);
  toast('projects.json exporté — remplace l\'ancien fichier et commit !', 'success');
});

// ─── Toast ──────────────────────────────────
const toastEl = document.getElementById('toast');
let toastTimer;
function toast(msg, type = 'success') {
  toastEl.textContent = msg;
  toastEl.className   = `toast toast--${type} show`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3500);
}

// ─── Escape closes modals ───────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeModal(); closeConfirm(); }
});

// ─── Init ───────────────────────────────────
checkAuth();
