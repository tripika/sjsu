// Shared helpers
function qs(sel, el = document) { return el.querySelector(sel); }
function qsa(sel, el = document) { return Array.from(el.querySelectorAll(sel)); }

function fetchJSON(path) {
  return fetch(path).then((r) => {
    if (!r.ok) throw new Error(`Failed to fetch ${path}`);
    return r.json();
  });
}

function formatPrice(n) {
  try { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n); }
  catch { return `$${n}`; }
}

function initNavActive() {
  const here = location.pathname.split('/').pop() || 'index.html';
  qsa('header .nav a').forEach(a => {
    if (a.getAttribute('href').endsWith(here)) a.style.textDecoration = 'underline';
  });
}

// Page routers
function initHome() {
  // Placeholder: could add dynamic stats or tips.
}

function renderListings(listings) {
  const grid = qs('.listings');
  if (!grid) return;
  grid.innerHTML = '';
  listings.forEach(item => {
    const card = document.createElement('article');
    card.className = 'card listing';
    card.innerHTML = `
      <img src="${item.image}" alt="${item.title}">
      <div><strong>${item.title}</strong></div>
      <div class="muted">${item.category} • ${item.condition}</div>
      <div class="price">${formatPrice(item.price)}</div>
      <div class="muted">${item.location}</div>
    `;
    grid.appendChild(card);
  });
}

function initMarketplace() {
  let all = [];
  const search = qs('#search');
  const category = qs('#category');
  const condition = qs('#condition');
  const resetBtn = qs('#resetFilters');

  function applyFilters() {
    const term = (search.value || '').toLowerCase();
    const cat = category.value;
    const cond = condition.value;
    const filtered = all.filter((it) => {
      const t = `${it.title} ${it.category} ${it.location}`.toLowerCase();
      const okTerm = !term || t.includes(term);
      const okCat = !cat || it.category === cat;
      const okCond = !cond || it.condition === cond;
      return okTerm && okCat && okCond;
    });
    renderListings(filtered);
  }

  fetchJSON('assets/mock/listings.json')
    .then((data) => { all = data; renderListings(all); })
    .catch((e) => { console.error(e); });

  [search, category, condition].forEach(el => el && el.addEventListener('input', applyFilters));
  if (resetBtn) resetBtn.addEventListener('click', () => {
    search.value = '';
    category.value = '';
    condition.value = '';
    renderListings(all);
  });

  // Modal open/close (mock)
  const openModal = qs('#openPostItem');
  const backdrop = qs('#modalBackdrop');
  const cancel = qs('#cancelModal');
  openModal && openModal.addEventListener('click', () => backdrop.style.display = 'flex');
  cancel && cancel.addEventListener('click', () => backdrop.style.display = 'none');
}

function renderEvents(events) {
  const grid = qs('.events');
  if (!grid) return;
  grid.innerHTML = '';
  events.forEach(ev => {
    const card = document.createElement('article');
    card.className = 'card event';
    const date = new Date(ev.date);
    const dateStr = isNaN(date) ? ev.date : date.toLocaleString([], { dateStyle: 'medium', timeStyle: ev.time ? 'short' : undefined });
    card.innerHTML = `
      <div><span class="chip">${ev.type}</span></div>
      <strong>${ev.title}</strong>
      <div class="muted">${dateStr}${ev.time ? ' @ ' + ev.time : ''}</div>
      <div class="muted">${ev.location}</div>
      <p>${ev.description}</p>
      ${ev.link ? `<div><a href="${ev.link}" target="_blank" rel="noopener">More info</a></div>` : ''}
    `;
    grid.appendChild(card);
  });
}

function initEvents() {
  fetchJSON('assets/mock/events.json')
    .then(renderEvents)
    .catch(console.error);
}

// Router based on body[data-page]
document.addEventListener('DOMContentLoaded', () => {
  initNavActive();
  const page = document.body.getAttribute('data-page');
  if (page === 'home') initHome();
  if (page === 'marketplace') initMarketplace();
  if (page === 'events') initEvents();
});

