const $ = (s) => document.querySelector(s);
const frame = $('#frame');
const query = new URLSearchParams(location.search);

const [cards, meta] = await Promise.all([
  fetch('/previews/cards.json').then((r) => r.json()),
  fetch('/tokens/themes.json').then((r) => r.json()),
]);
const kind = Object.fromEntries(meta.themes.map((t) => [t.id, t.kind]));
const dark = matchMedia('(prefers-color-scheme: dark)');

const state = {
  card: cards.some((c) => c.name === query.get('card')) ? query.get('card') : cards[0].name,
  theme: kind[query.get('theme')] ? query.get('theme') : 'light',
  mode: ['light', 'dark', 'system'].includes(query.get('mode')) ? query.get('mode') : null,
  project: ['fleet', 'ashare', 'jiqun'].includes(query.get('project')) ? query.get('project') : 'fleet',
  width: ['full', '720', '360'].includes(query.get('width')) ? query.get('width') : 'full',
};
state.mode ||= kind[state.theme];
const last = { light: kind[state.theme] === 'light' ? state.theme : 'light', dark: kind[state.theme] === 'dark' ? state.theme : 'dark' };

const themeSelect = $('#theme');
for (const k of ['light', 'dark']) {
  const group = document.createElement('optgroup');
  group.label = k === 'light' ? '浅色' : '深色';
  for (const t of meta.themes.filter((x) => x.kind === k)) group.append(new Option(t.name, t.id));
  themeSelect.append(group);
}

const nav = $('#nav');
const pick = $('#pick');
let group = '';
for (const c of cards) {
  if (c.group !== group) {
    group = c.group;
    const label = document.createElement('div');
    label.className = 'fa-glabel';
    label.textContent = group;
    nav.append(label);
  }
  const item = document.createElement('button');
  item.className = 'fa-item';
  item.dataset.card = c.name;
  item.textContent = c.name;
  item.addEventListener('click', () => {
    state.card = c.name;
    load();
  });
  nav.append(item);
  pick.append(new Option(c.name, c.name));
}
pick.addEventListener('change', () => {
  state.card = pick.value;
  load();
});

function resolvedTheme() {
  if (state.mode === 'system') return dark.matches ? last.dark : last.light;
  return state.theme;
}

function paint(doc) {
  if (!doc?.documentElement) return;
  doc.documentElement.dataset.theme = resolvedTheme();
  if (state.project === 'fleet') doc.documentElement.removeAttribute('data-project');
  else doc.documentElement.dataset.project = state.project;
}

function cardUrl() {
  const q = new URLSearchParams({ theme: resolvedTheme(), project: state.project });
  return `/cards/${state.card}.html?${q}`;
}

function sync() {
  state.theme = resolvedTheme();
  last[kind[state.theme]] = state.theme;
  paint(document);
  try {
    paint(frame.contentDocument);
  } catch {}
  themeSelect.value = state.theme;
  for (const [id, value] of [
    ['#mode', state.mode],
    ['#project', state.project],
    ['#width', state.width],
  ]) {
    for (const b of document.querySelectorAll(`${id} button`)) b.setAttribute('aria-checked', String(b.dataset.v === value));
  }
  for (const b of nav.querySelectorAll('.fa-item')) b.setAttribute('aria-selected', String(b.dataset.card === state.card));
  pick.value = state.card;
  $('.shell__frame').dataset.width = state.width;
  const card = cards.find((c) => c.name === state.card);
  $('#title').textContent = card.name;
  $('#subtitle').textContent = card.subtitle;
  $('#open').href = cardUrl();
  history.replaceState(
    null,
    '',
    `?${new URLSearchParams({ card: state.card, theme: state.theme, mode: state.mode, project: state.project, width: state.width })}`,
  );
}

function load() {
  sync();
  frame.src = cardUrl();
}

frame.addEventListener('load', () => paint(frame.contentDocument));
themeSelect.addEventListener('change', () => {
  state.theme = themeSelect.value;
  state.mode = kind[state.theme];
  sync();
});
for (const id of ['#mode', '#project', '#width']) {
  for (const b of document.querySelectorAll(`${id} button`)) {
    b.addEventListener('click', () => {
      const key = id.slice(1);
      state[key] = b.dataset.v;
      if (key === 'mode' && b.dataset.v !== 'system') state.theme = last[b.dataset.v];
      sync();
    });
  }
}
dark.addEventListener('change', () => state.mode === 'system' && sync());
load();
