// Debounce helper
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Language toggle logic
const langToggleDesktop = document.getElementById('lang-toggle-desktop');
const langLabelDesktop = document.getElementById('lang-label-desktop');
let currentLang = 'cs';

function setLanguage(lang) {
  const csElements = document.querySelectorAll('[data-lang="cs"]');
  const enElements = document.querySelectorAll('[data-lang="en"]');

  if (lang === 'en') {
    csElements.forEach(el => el.classList.add('hidden-lang'));
    enElements.forEach(el => el.classList.remove('hidden-lang'));
    langLabelDesktop.textContent = 'CZ';
    currentLang = 'en';
    document.documentElement.lang = 'en';
  } else {
    csElements.forEach(el => el.classList.remove('hidden-lang'));
    enElements.forEach(el => el.classList.add('hidden-lang'));
    langLabelDesktop.textContent = 'EN';
    currentLang = 'cs';
    document.documentElement.lang = 'cs';
  }

  // Ensure TS panel language stays in sync if open
  const tsPanel = document.getElementById('ts-panel');
  if (tsPanel && tsPanel.classList.contains('open')) ensurePanelLang(tsPanel);
}

const savedLang = localStorage.getItem('linea-lang');
if (savedLang === 'en' || savedLang === 'cs') setLanguage(savedLang);
else document.documentElement.lang = currentLang;

// Desktop search
const searchIconBtnDesktop = document.getElementById('search-icon-btn-desktop');
const searchDropdownDesktop = document.getElementById('search-dropdown-desktop');
const searchInputDesktop = document.getElementById('search-input-desktop');
const searchResultsDesktop = document.getElementById('search-results-desktop');

const data = [
  { id: 1, cs: 'Žena, srdce, prso, kost', en: 'Woman, Heart, Breast, Bone', type: 'Výstava' },
  { id: 2, cs: 'Touha po něčem trvalém', en: 'The Desire for Something Permanent', type: 'Výstava' },
  { id: 3, cs: 'Markéta Korečková', en: 'Markéta Korečková', type: 'Umělec' },
  { id: 4, cs: 'Vojtěch Kovářík', en: 'Vojtěch Kovářík', type: 'Umělec' },
];

let focusedResultIndex = -1;

function renderResults(results, lang, container) {
  container.innerHTML = '';
  focusedResultIndex = -1;

  if (results.length === 0) {
    const noResult = document.createElement('li');
    noResult.textContent = lang === 'cs' ? 'Žádné výsledky' : 'No results';
    noResult.setAttribute('role', 'option');
    noResult.tabIndex = -1;
    container.appendChild(noResult);
    return;
  }

  results.forEach((item, index) => {
    const li = document.createElement('li');
    li.textContent = `${item.type}: ${lang === 'cs' ? item.cs : item.en}`;
    li.tabIndex = -1;
    li.setAttribute('role', 'option');
    li.dataset.index = index;

    li.addEventListener('click', () => {
      alert(`${lang === 'cs' ? 'Vybráno' : 'Selected'}: ${lang === 'cs' ? item.cs : item.en}`);
      closeSearchDesktop(true);
    });

    li.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        li.click();
      }
    });

    container.appendChild(li);
  });
}

function clearSearchDesktop() {
  searchResultsDesktop.innerHTML = '';
  searchInputDesktop.value = '';
  searchInputDesktop.removeAttribute('aria-activedescendant');
  focusedResultIndex = -1;
}

function openSearchDesktop() {
  searchDropdownDesktop.classList.add('visible');
  searchIconBtnDesktop.setAttribute('aria-expanded', 'true');
  searchInputDesktop.focus();
}

function closeSearchDesktop(returnFocus = false) {
  searchDropdownDesktop.classList.remove('visible');
  searchIconBtnDesktop.setAttribute('aria-expanded', 'false');
  clearSearchDesktop();
  if (returnFocus) searchIconBtnDesktop.focus();
}

function updateFocusedSearchResult(items) {
  items.forEach((item, idx) => {
    if (idx === focusedResultIndex) {
      item.classList.add('focused');
      item.tabIndex = 0;
      item.focus();
    } else {
      item.classList.remove('focused');
      item.tabIndex = -1;
    }
  });
}

searchIconBtnDesktop.addEventListener('click', () => {
  if (searchDropdownDesktop.classList.contains('visible')) closeSearchDesktop(false);
  else openSearchDesktop();
});

searchInputDesktop.addEventListener('input', debounce(() => {
  const lang = currentLang;
  const query = searchInputDesktop.value.trim().toLowerCase();
  if (!query) { clearSearchDesktop(); return; }

  const filtered = data.filter(item =>
    (lang === 'cs' ? item.cs : item.en).toLowerCase().includes(query)
  );
  renderResults(filtered, lang, searchResultsDesktop);
}, 250));

// Keyboard navigation for search results (up/down arrows)
searchInputDesktop.addEventListener('keydown', (e) => {
  const items = searchResultsDesktop.querySelectorAll('li[role="option"]');
  if (!items.length) return;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    focusedResultIndex = (focusedResultIndex + 1) % items.length;
    updateFocusedSearchResult(items);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    focusedResultIndex = (focusedResultIndex - 1 + items.length) % items.length;
    updateFocusedSearchResult(items);
  }
});

document.addEventListener('click', (e) => {
  if (!searchDropdownDesktop.contains(e.target) && !searchIconBtnDesktop.contains(e.target)) {
    if (searchDropdownDesktop.classList.contains('visible')) closeSearchDesktop(false);
  }
});

// Language toggle
langToggleDesktop.addEventListener('click', () => {
  setLanguage(currentLang === 'cs' ? 'en' : 'cs');
  localStorage.setItem('linea-lang', currentLang);
  clearSearchDesktop();
});

// Mobile hamburger menu toggle
const hamburgerBtn = document.getElementById('hamburger-btn');
const navMenu = document.querySelector('nav.nav-menu');

hamburgerBtn.addEventListener('click', () => {
  const expanded = hamburgerBtn.getAttribute('aria-expanded') === 'true';
  hamburgerBtn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  navMenu.classList.toggle('open');
});

// Close nav menu on link click (mobile)
navMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    if (window.matchMedia('(max-width: 900px)').matches && navMenu.classList.contains('open')) {
      navMenu.classList.remove('open');
      hamburgerBtn.setAttribute('aria-expanded', 'false');
    }
  });
});

document.addEventListener('click', (e) => {
  if (!window.matchMedia('(max-width: 900px)').matches) return;
  if (!navMenu.classList.contains('open')) return;

  if (!navMenu.contains(e.target) && !hamburgerBtn.contains(e.target)) {
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    navMenu.classList.remove('open');
  }
});

document.addEventListener('keydown', (e) => {
  if (!window.matchMedia('(max-width: 900px)').matches) return;
  if (e.key === 'Escape' && navMenu.classList.contains('open')) {
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    navMenu.classList.remove('open');
    hamburgerBtn.focus();
  }
});

// Background image swapping
document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const backgrounds = [
    'url(img/mk001.jpg)',
    'url(img/mk002.jpg)',
    'url(img/mk003.jpg)',
    'url(img/mk004.jpg)'
  ];
  let current = 0;
  body.style.backgroundImage = backgrounds[0];

  setInterval(() => {
    current = (current + 1) % backgrounds.length;
    body.style.backgroundImage = backgrounds[current];
  }, 5000);
});

// Panels open/close logic + focus trap
const infoPanel = document.getElementById('info-panel');
const infoPanelOverlay = document.getElementById('info-panel-overlay');
const infoPanelCloseBtn = document.getElementById('info-panel-close');

const contactsPanel = document.getElementById('contacts-panel');
const contactsPanelOverlay = document.getElementById('contacts-panel-overlay');
const contactsPanelCloseBtn = document.getElementById('contacts-panel-close');

const tsPanel = document.getElementById('ts-panel');
const tsPanelOverlay = document.getElementById('ts-panel-overlay');
const tsPanelCloseBtn = document.getElementById('ts-panel-close');

const infoNavLinkCs = [...document.querySelectorAll('nav#primary-navigation a[data-lang="cs"]')]
  .find(a => a.textContent.trim() === 'Informace pro návštěvníky');
const infoNavLinkEn = [...document.querySelectorAll('nav#primary-navigation a[data-lang="en"]')]
  .find(a => a.textContent.trim() === 'Information for Visitors');

const contactsNavLinkCs = [...document.querySelectorAll('nav#primary-navigation a[data-lang="cs"]')]
  .find(a => a.textContent.trim() === 'Kontakty');
const contactsNavLinkEn = [...document.querySelectorAll('nav#primary-navigation a[data-lang="en"]')]
  .find(a => a.textContent.trim() === 'Contacts');

const tsNavLinkCs = [...document.querySelectorAll('nav#primary-navigation a[data-lang="cs"][data-open="ts"]')][0];
const tsNavLinkEn = [...document.querySelectorAll('nav#primary-navigation a[data-lang="en"][data-open="ts"]')][0];

let lastFocusEl = null;

function lockBodyScroll() { document.body.classList.add('panel-open'); }
function unlockBodyScroll() { document.body.classList.remove('panel-open'); }

function ensurePanelLang(panelEl) {
  const csContent = panelEl.querySelector('[data-lang="cs"]');
  const enContent = panelEl.querySelector('[data-lang="en"]');
  if (!csContent || !enContent) return;

  if (currentLang === 'en') {
    csContent.classList.add('hidden-lang');
    enContent.classList.remove('hidden-lang');
  } else {
    enContent.classList.add('hidden-lang');
    csContent.classList.remove('hidden-lang');
  }
}

function closeNavIfMobileOpen() {
  if (navMenu.classList.contains('open')) {
    navMenu.classList.remove('open');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
  }
}

// Focus trap helper for panel
function trapFocus(element) {
  const focusableElements = element.querySelectorAll(
    'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
  );
  if (focusableElements.length === 0) return null;

  const firstEl = focusableElements[0];
  const lastEl = focusableElements[focusableElements.length - 1];

  function handleTrap(e) {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      }
    } else {
      if (document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }
  }

  element.addEventListener('keydown', handleTrap);
  return () => element.removeEventListener('keydown', handleTrap);
}

let removeFocusTrap = null;

function openPanel(panelEl, overlayEl) {
  lastFocusEl = document.activeElement;

  closeNavIfMobileOpen();
  closeSearchDesktop(false);

  ensurePanelLang(panelEl);

  panelEl.classList.add('open');
  panelEl.setAttribute('aria-hidden', 'false');

  overlayEl.classList.add('visible');
  overlayEl.setAttribute('aria-hidden', 'false');

  lockBodyScroll();

  const closeBtn = panelEl.querySelector('button');
  if (closeBtn) closeBtn.focus();
  else panelEl.focus();

  if (removeFocusTrap) removeFocusTrap();
  removeFocusTrap = trapFocus(panelEl);
}

function closePanel(panelEl, overlayEl) {
  panelEl.classList.remove('open');
  panelEl.setAttribute('aria-hidden', 'true');

  overlayEl.classList.remove('visible');
  overlayEl.setAttribute('aria-hidden', 'true');

  unlockBodyScroll();

  if (removeFocusTrap) {
    removeFocusTrap();
    removeFocusTrap = null;
  }

  if (lastFocusEl && typeof lastFocusEl.focus === 'function') lastFocusEl.focus();
}

if (infoNavLinkCs) infoNavLinkCs.addEventListener('click', (e) => { e.preventDefault(); openPanel(infoPanel, infoPanelOverlay); });
if (infoNavLinkEn) infoNavLinkEn.addEventListener('click', (e) => { e.preventDefault(); openPanel(infoPanel, infoPanelOverlay); });

if (contactsNavLinkCs) contactsNavLinkCs.addEventListener('click', (e) => { e.preventDefault(); openPanel(contactsPanel, contactsPanelOverlay); });
if (contactsNavLinkEn) contactsNavLinkEn.addEventListener('click', (e) => { e.preventDefault(); openPanel(contactsPanel, contactsPanelOverlay); });

if (tsNavLinkCs) tsNavLinkCs.addEventListener('click', (e) => { e.preventDefault(); openPanel(tsPanel, tsPanelOverlay); });
if (tsNavLinkEn) tsNavLinkEn.addEventListener('click', (e) => { e.preventDefault(); openPanel(tsPanel, tsPanelOverlay); });

infoPanelCloseBtn.addEventListener('click', () => closePanel(infoPanel, infoPanelOverlay));
contactsPanelCloseBtn.addEventListener('click', () => closePanel(contactsPanel, contactsPanelOverlay));
tsPanelCloseBtn.addEventListener('click', () => closePanel(tsPanel, tsPanelOverlay));

infoPanelOverlay.addEventListener('click', () => closePanel(infoPanel, infoPanelOverlay));
contactsPanelOverlay.addEventListener('click', () => closePanel(contactsPanel, contactsPanelOverlay));
tsPanelOverlay.addEventListener('click', () => closePanel(tsPanel, tsPanelOverlay));

// Close panels on Escape
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;

  if (infoPanel.classList.contains('open')) { closePanel(infoPanel, infoPanelOverlay); e.preventDefault(); }
  if (contactsPanel.classList.contains('open')) { closePanel(contactsPanel, contactsPanelOverlay); e.preventDefault(); }
  if (tsPanel.classList.contains('open')) { closePanel(tsPanel, tsPanelOverlay); e.preventDefault(); }
});
