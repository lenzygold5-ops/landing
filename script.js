const grid = document.getElementById('extension-grid');
const emptyState = document.getElementById('empty-state');
const cardTemplate = document.getElementById('card-template');
const themeToggle = document.getElementById('theme-toggle');
const filterButtons = [...document.querySelectorAll('.filter')];

const THEME_KEY = 'extension-manager-theme';

let extensions = [];
let currentFilter = 'all';

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeToggle.querySelector('.visually-hidden').textContent =
    theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
}

function initTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  setTheme(stored ?? (prefersDark ? 'dark' : 'light'));

  themeToggle.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem(THEME_KEY, next);
  });
}

function matchesFilter(extension) {
  if (currentFilter === 'active') return extension.isActive;
  if (currentFilter === 'inactive') return !extension.isActive;
  return true;
}

function createCard(extension, index) {
  const card = cardTemplate.content.cloneNode(true).querySelector('.card');
  card.dataset.index = index;

  card.querySelector('.card__logo').src = extension.logo;
  card.querySelector('.card__name').textContent = extension.name;
  card.querySelector('.card__description').textContent = extension.description;

  const removeBtn = card.querySelector('.btn--remove');
  removeBtn.querySelector('.visually-hidden').textContent = ` ${extension.name}`;

  const toggle = card.querySelector('.switch');
  toggle.setAttribute('aria-checked', String(extension.isActive));
  toggle.querySelector('.visually-hidden').textContent = `Toggle ${extension.name}`;

  return card;
}

function render() {
  const visible = extensions
    .map((extension, index) => ({ extension, index }))
    .filter(({ extension }) => matchesFilter(extension));

  grid.replaceChildren(...visible.map(({ extension, index }) => createCard(extension, index)));
  emptyState.hidden = visible.length > 0;
}

function toggleExtension(index) {
  extensions[index].isActive = !extensions[index].isActive;
  render();
}

function removeExtension(index) {
  extensions.splice(index, 1);
  render();
}

grid.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;

  const { index } = button.closest('.card').dataset;

  if (button.classList.contains('btn--remove')) removeExtension(Number(index));
  if (button.classList.contains('switch')) toggleExtension(Number(index));
});

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    currentFilter = button.dataset.filter;
    filterButtons.forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
    render();
  });
});

async function init() {
  initTheme();

  try {
    const response = await fetch('./data.json');
    extensions = await response.json();
    render();
  } catch (error) {
    console.error('Failed to load extensions:', error);
    emptyState.textContent = 'Could not load extensions.';
    emptyState.hidden = false;
  }
}

init();