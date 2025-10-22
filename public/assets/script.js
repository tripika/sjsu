// Shared helpers
function qs(sel, el = document) { return el.querySelector(sel); }
function qsa(sel, el = document) { return Array.from(el.querySelectorAll(sel)); }

// Offline-friendly JSON fetch with fallback
function getFallback(path) {
  if (path.endsWith('listings.json')) return (window.FALLBACK_LISTINGS || []);
  if (path.endsWith('events.json')) return (window.FALLBACK_EVENTS || []);
  return [];
}

function fetchJSON(path) {
  return fetch(path)
    .then((r) => {
      if (!r.ok) throw new Error(`Failed to fetch ${path}`);
      return r.json();
    })
    .catch((err) => {
      console.warn('Fetch failed; using fallback for', path, err);
      return Promise.resolve(getFallback(path));
    });
}

function formatPrice(n) {
  try { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n); }
  catch { return `$${n}`; }
}

function initNavActive() {
  const here = location.pathname.split('/').pop() || 'index.html';
  qsa('header nav a').forEach(a => {
    if (a.getAttribute('href').endsWith(here)) {
      a.setAttribute('aria-current', 'page');
      a.classList.add('text-brand', 'font-semibold');
    }
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
    card.className = 'rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:shadow';
    card.innerHTML = `
      <div class="relative">
        <img class="h-44 w-full rounded-lg object-cover" src="${item.image}" alt="${item.title}" loading="lazy" decoding="async">
        <div class="absolute right-2 top-2 rounded-md bg-white/90 px-2 py-1 text-xs font-medium text-brand shadow">${formatPrice(item.price)}</div>
      </div>
      <div class="mt-3">
        <div class="font-medium">${item.title}</div>
        <div class="mt-1 text-sm text-slate-600">${item.category} • ${item.condition}</div>
        <div class="mt-1 text-sm text-slate-500">${item.location}</div>
      </div>
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
  openModal && openModal.addEventListener('click', () => { if (backdrop) { backdrop.classList.remove('hidden'); /* Tailwind */ backdrop.style.display = 'flex'; } });
  cancel && cancel.addEventListener('click', () => { if (backdrop) { backdrop.classList.add('hidden'); backdrop.style.display = 'none'; } });
}

function renderEvents(events) {
  const list = qs('.events');
  if (!list) return;
  list.innerHTML = '';
  events.forEach(ev => {
    const row = document.createElement('article');
    row.className = 'grid grid-cols-1 items-start gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow md:grid-cols-12';

    const d = new Date(ev.date);
    const valid = !isNaN(d);
    const month = valid ? d.toLocaleString('en-US', { month: 'short' }) : '';
    const day = valid ? d.getDate() : '';
    const weekdayYear = valid ? d.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric' }) : ev.date;

    const left = document.createElement('div');
    left.className = 'md:col-span-3 flex flex-col items-start justify-center gap-1';
    left.innerHTML = `
      <div class="inline-flex items-center gap-3">
        <div class="flex flex-col items-start">
          <div class="text-3xl font-bold leading-none text-brand">${day || ''}</div>
          <div class="text-sm uppercase tracking-wide text-slate-600">${month || ''}</div>
        </div>
      </div>
      <div class="text-xs text-slate-500">${weekdayYear}</div>
      ${ev.time ? `<div class="inline-flex items-center gap-1 text-sm text-slate-700">
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 7v5l3 3"/><circle cx="12" cy="12" r="9"/></svg>
        ${ev.time}
      </div>` : ''}
    `;

    const right = document.createElement('div');
    right.className = 'md:col-span-9';
    right.innerHTML = `
      <div class="mb-2 flex flex-wrap items-center gap-2">
        <span class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
          <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 6H4"/><path d="M16 2v4M8 2v4"/><rect x="3" y="4" width="18" height="18" rx="2"/></svg>
          ${ev.type}
        </span>
        <span class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs ${isOffCampus(ev) ? 'text-amber-700' : 'text-emerald-700'}">
          <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 21s-6-4.35-6-10a6 6 0 1 1 12 0c0 5.65-6 10-6 10z"/></svg>
          ${isOffCampus(ev) ? 'Off campus' : 'On campus'}
        </span>
      </div>
      <div class="font-medium">${ev.title}</div>
      <div class="mt-1 inline-flex items-center gap-1 text-sm text-slate-600">
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 21s-6-4.35-6-10a6 6 0 1 1 12 0c0 5.65-6 10-6 10z"/></svg>
        ${ev.location}
      </div>
      <p class="mt-2 text-sm text-slate-700">${ev.description}</p>
      ${ev.link ? `<div class="mt-2"><a class="text-brand hover:underline" href="${ev.link}" target="_blank" rel="noopener">More info</a></div>` : ''}
    `;

    row.appendChild(left);
    row.appendChild(right);
    list.appendChild(row);
  });
}

function initEvents() {
  const search = qs('#evSearch');
  const typeSel = qs('#evType');
  const campusSel = qs('#evCampus');
  const openBtn = qs('#openAddEvent');
  const modal = qs('#evModalBackdrop');
  const cancel = qs('#evCancelModal');
  const submit = qs('#evSubmit');

  let all = [];

  function applyFilters() {
    const term = (search?.value || '').toLowerCase();
    const t = typeSel?.value || '';
    const campus = campusSel?.value || '';
    const filtered = all.filter(ev => {
      const hay = `${ev.title} ${ev.description || ''} ${ev.location || ''} ${ev.type || ''}`.toLowerCase();
      const okTerm = !term || hay.includes(term);
      const okType = !t || (ev.type === t);
      const off = isOffCampus(ev);
      const okCampus = !campus || (campus === 'off' ? off : !off);
      return okTerm && okType && okCampus;
    });
    renderEvents(filtered);
  }

  fetchJSON('assets/mock/events.json')
    .then((data) => { all = data; applyFilters(); })
    .catch((e) => { console.error(e); });

  [search, typeSel, campusSel].forEach(el => el && el.addEventListener('input', applyFilters));

  // Modal handlers (mock add)
  openBtn && openBtn.addEventListener('click', () => { if (modal) { modal.classList.remove('hidden'); modal.style.display = 'flex'; } });
  cancel && cancel.addEventListener('click', () => { if (modal) { modal.classList.add('hidden'); modal.style.display = 'none'; } });
  submit && submit.addEventListener('click', () => {
    const title = qs('#evTitle')?.value?.trim();
    const date = qs('#evDate')?.value;
    const time = qs('#evTime')?.value;
    const location = qs('#evLocation')?.value?.trim();
    const type = qs('#evTypeInput')?.value || 'Community';
    const description = qs('#evDesc')?.value?.trim() || '';
    const link = qs('#evLink')?.value?.trim() || '';
    if (!title || !date || !location) return;
    all.unshift({ id: Date.now(), title, type, date, time, location, description, link });
    // Default campus filter to off-campus view after adding
    if (campusSel) campusSel.value = 'off';
    applyFilters();
    // close
    if (modal) { modal.classList.add('hidden'); modal.style.display = 'none'; }
  });
}

// Heuristic to determine off-campus based on location keywords
function isOffCampus(ev) {
  const loc = (ev.location || '').toLowerCase();
  const onKeywords = ['student union', 'cefcu', 'mlk library', 'provident credit union event center', 'on campus', 'sjsu', 'campus'];
  const offKeywords = ['san pedro', 'sofa', 'downtown', 'river park', 'innovation center', 'square', 'district', 'park'];
  if (onKeywords.some(k => loc.includes(k))) return false;
  if (offKeywords.some(k => loc.includes(k))) return true;
  return false; // default assume on-campus unless clearly off
}

// Router based on body[data-page]
document.addEventListener('DOMContentLoaded', () => {
  initNavActive();
  // Mobile nav toggle
  const toggle = qs('.js-menu-toggle');
  const panel = qs('.js-mobile-menu');
  toggle && panel && toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    panel.classList.toggle('hidden');
  });
  const page = document.body.getAttribute('data-page');
  if (page === 'home') initHome();
  if (page === 'marketplace') initMarketplace();
  if (page === 'events') initEvents();
});

// Fallback mock data so the site works when opened as file://
// Listings (20 items)
window.FALLBACK_LISTINGS = [
  {"id":1,"title":"Physics 2A Textbook","category":"Books","condition":"Good","price":35,"location":"Near MLK Library","image":"https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop"},
  {"id":2,"title":"IKEA Desk (Linnmon)","category":"Furniture","condition":"Used","price":45,"location":"Downtown SJ","image":"https://images.unsplash.com/photo-1540574163026-643ea20ade25?q=80&w=1200&auto=format&fit=crop"},
  {"id":3,"title":"Graphing Calculator TI-84","category":"Electronics","condition":"Like New","price":60,"location":"Spartan Village","image":"https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop"},
  {"id":4,"title":"SJSU Hoodie (M)","category":"Clothing","condition":"Good","price":20,"location":"On Campus","image":"https://images.unsplash.com/photo-1516826957135-700dedea698c?q=80&w=1200&auto=format&fit=crop"},
  {"id":5,"title":"Mini Fridge","category":"Appliances","condition":"Used","price":75,"location":"Japantown","image":"https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=1200&auto=format&fit=crop"},
  {"id":6,"title":"Road Bike (M)","category":"Electronics","condition":"Used","price":180,"location":"East San José","image":"https://images.unsplash.com/photo-1518655048521-f130df041f66?q=80&w=1600&auto=format&fit=crop"},
  {"id":7,"title":"27\" Monitor (1080p)","category":"Electronics","condition":"Good","price":85,"location":"Near SJSU Student Union","image":"https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1600&auto=format&fit=crop"},
  {"id":8,"title":"Laptop Stand + Keyboard Combo","category":"Electronics","condition":"Like New","price":30,"location":"Downtown SJ","image":"https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1600&auto=format&fit=crop"},
  {"id":9,"title":"Small Couch (2-Seater)","category":"Furniture","condition":"Used","price":120,"location":"Willow Glen","image":"https://images.unsplash.com/photo-1484101403633-562f891dc89a?q=80&w=1600&auto=format&fit=crop"},
  {"id":10,"title":"Microwave (0.9 cu ft)","category":"Appliances","condition":"Good","price":35,"location":"Spartan Village","image":"https://images.unsplash.com/photo-1556912988-c3d12ff49a2f?q=80&w=1600&auto=format&fit=crop"},
  {"id":11,"title":"Desk Lamp w/ USB","category":"Electronics","condition":"Like New","price":18,"location":"Japantown","image":"https://images.unsplash.com/photo-1493707553966-283afac8c602?q=80&w=1600&auto=format&fit=crop"},
  {"id":12,"title":"Area Rug (5x7)","category":"Furniture","condition":"Good","price":40,"location":"Rose Garden","image":"https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1600&auto=format&fit=crop"},
  {"id":13,"title":"Backpack (Water-resistant)","category":"Clothing","condition":"Like New","price":25,"location":"On Campus","image":"https://images.unsplash.com/photo-1520975922220-6cdd3aa1b6ec?q=80&w=1600&auto=format&fit=crop"},
  {"id":14,"title":"Printer (Canon Pixma)","category":"Electronics","condition":"Used","price":50,"location":"Downtown SJ","image":"https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=1600&auto=format&fit=crop"},
  {"id":15,"title":"Dining Table (4 Chairs)","category":"Furniture","condition":"Good","price":150,"location":"North San José","image":"https://images.unsplash.com/photo-1524758631624-0e3fd6b0b6da?q=80&w=1600&auto=format&fit=crop"},
  {"id":16,"title":"Textbook Bundle (Calc + CS)","category":"Books","condition":"Good","price":50,"location":"Campus Bookstore Area","image":"https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=1600&auto=format&fit=crop"},
  {"id":17,"title":"Standing Desk (Adjustable)","category":"Furniture","condition":"Like New","price":120,"location":"Downtown SJ","image":"https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=1600&auto=format&fit=crop"},
  {"id":18,"title":"Air Fryer (3.7qt)","category":"Appliances","condition":"Like New","price":45,"location":"Spartan Keys","image":"https://images.unsplash.com/photo-1611255550542-c2f0bfe0f4a0?q=80&w=1600&auto=format&fit=crop"},
  {"id":19,"title":"SJSU Hoodie (L)","category":"Clothing","condition":"Good","price":18,"location":"On Campus","image":"https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1600&auto=format&fit=crop"},
  {"id":20,"title":"Noise-Canceling Headphones","category":"Electronics","condition":"Good","price":90,"location":"Near MLK Library","image":"https://images.unsplash.com/photo-1518444080546-07f2b0f5df00?q=80&w=1600&auto=format&fit=crop"}
];

// Events (14 entries)
window.FALLBACK_EVENTS = [
  {"id":101,"title":"SJSU Career Fair (Tech)","type":"Career","date":"2025-11-05","time":"10:00 AM","location":"Student Union Ballroom","description":"Meet local employers and recruiters hiring interns and new grads.","link":"https://www.sjsu.edu/careercenter/"},
  {"id":102,"title":"Spartan Football vs. Fresno State","type":"Sports","date":"2025-11-12","time":"7:00 PM","location":"CEFCU Stadium","description":"Cheer on the Spartans under the lights!","link":"https://sjsuspartans.com/"},
  {"id":103,"title":"Downtown SJ Night Market","type":"Community","date":"2025-11-20","time":"6:00 PM","location":"San Pedro Square","description":"Local vendors, food trucks, and live music in the heart of downtown.","link":"https://www.sjdowntown.com/"},
  {"id":104,"title":"International Students Meetup","type":"Student Life","date":"2025-11-08","time":"3:00 PM","location":"MLK Library Room 225","description":"Connect with fellow international students and share resources.","link":"https://www.sjsu.edu/isss/"},
  {"id":105,"title":"Hackathon: Build for Good","type":"Tech","date":"2025-11-22","time":"9:00 AM","location":"Student Union Ballroom","description":"24-hour hackathon focused on community impact projects.","link":"https://devpost.com/"},
  {"id":106,"title":"Downtown Art Walk","type":"Community","date":"2025-12-05","time":"5:00 PM","location":"SoFA District","description":"Local artists, galleries, and live performances across the SoFA district.","link":"https://sjdowntown.com/"},
  {"id":107,"title":"Resume + LinkedIn Workshop","type":"Career","date":"2025-11-18","time":"1:00 PM","location":"Career Center","description":"Hands-on session to refine your resume and online presence.","link":"https://www.sjsu.edu/careercenter/"},
  {"id":108,"title":"SJSU Men’s Basketball vs. Nevada","type":"Sports","date":"2025-12-12","time":"7:30 PM","location":"Provident Credit Union Event Center","description":"Catch the Spartans at home in a conference matchup.","link":"https://sjsuspartans.com/"},
  {"id":109,"title":"Holiday Night Market","type":"Community","date":"2025-12-15","time":"6:00 PM","location":"San Pedro Square","description":"Food trucks, local makers, and festive live music downtown.","link":"https://www.sjdowntown.com/"},
  {"id":110,"title":"Volunteer Day: Guadalupe River Park","type":"Service","date":"2025-11-30","time":"9:00 AM","location":"Guadalupe River Park","description":"Join other students to help clean and restore the park.","link":"https://www.grpg.org/"},
  {"id":111,"title":"Library Late Night Study","type":"Academics","date":"2025-12-08","time":"8:00 PM","location":"MLK Library","description":"Extended hours, quiet floors, and free snacks during finals week.","link":"https://www.sjpl.org/locations/king"},
  {"id":112,"title":"Startup Pitch Night","type":"Entrepreneurship","date":"2025-12-02","time":"6:00 PM","location":"SJSU Innovation Center","description":"Student founders pitch ideas to mentors and local investors.","link":"https://www.eventbrite.com/"},
  {"id":113,"title":"Winter Concert: Symphony","type":"Arts","date":"2025-12-10","time":"7:00 PM","location":"Music Concert Hall","description":"An evening of orchestral performances by SJSU students.","link":"https://www.sjsu.edu/music/"},
  {"id":114,"title":"Club Fair Spring Preview","type":"Student Life","date":"2026-01-20","time":"12:00 PM","location":"7th Street Plaza","description":"Discover student organizations and find your community next term.","link":"https://sjsu.campuslabs.com/engage/"}
];
