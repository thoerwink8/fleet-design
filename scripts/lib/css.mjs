import postcss from 'postcss';

const squash = (s) =>
  s
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([>+~,(){}:;])\s*/g, '$1')
    .trim();

// Flattens a stylesheet into an ordered list of entries, one per rule or at-rule without children.
// Rules inside @media/@container keep their condition as context. Keyframes stay one entry.
export function entries(css, from = 'input.css') {
  const root = postcss.parse(css, { from });
  const out = [];
  const walk = (container, context) => {
    for (const node of container.nodes || []) {
      if (node.type === 'rule') {
        const decls = node.nodes.filter((n) => n.type === 'decl').map((d) => [d.prop.trim(), squash(d.value), !!d.important]);
        out.push({ kind: 'rule', context, selector: squash(node.selector), decls, line: node.source?.start?.line });
      } else if (node.type === 'atrule') {
        const cond = `@${node.name} ${squash(node.params)}`;
        if (node.name === 'keyframes' || !node.nodes) {
          out.push({ kind: 'at', context, selector: cond, decls: [], body: squash(node.toString()), line: node.source?.start?.line });
        } else walk(node, [...context, cond]);
      }
    }
  };
  walk(root, []);
  for (const e of out) e.key = JSON.stringify([e.context, e.selector, e.decls, e.body || '']);
  return out;
}

// ---- specificity (enough for the selectors in this library: classes, attributes, pseudo-classes, :not(), elements)
function compoundSpecificity(sel) {
  let a = 0;
  let b = 0;
  let c = 0;
  let s = sel;
  s = s.replace(/:(not|is|where|has)\(((?:[^()]|\([^()]*\))*)\)/g, (_, fn, inner) => {
    if (fn === 'where') return '';
    const best = inner
      .split(',')
      .map(selectorSpecificity)
      .reduce((m, x) => (cmp(x, m) > 0 ? x : m), [0, 0, 0]);
    a += best[0];
    b += best[1];
    c += best[2];
    return '';
  });
  s = s.replace(/\[[^\]]*\]/g, () => {
    b++;
    return '';
  });
  s = s.replace(/::[\w-]+(\([^)]*\))?/g, () => {
    c++;
    return '';
  });
  s = s.replace(/:[\w-]+(\([^)]*\))?/g, () => {
    b++;
    return '';
  });
  s = s.replace(/#[\w-]+/g, () => {
    a++;
    return '';
  });
  s = s.replace(/\.[\w-]+/g, () => {
    b++;
    return '';
  });
  for (const part of s.split(/[\s>+~]+/)) if (part && part !== '*') c++;
  return [a, b, c];
}

export function selectorSpecificity(sel) {
  return compoundSpecificity(sel.trim());
}

export const cmp = (x, y) => x[0] - y[0] || x[1] - y[1] || x[2] - y[2];

export const splitList = (selector) => {
  const out = [];
  let depth = 0;
  let cur = '';
  for (const ch of selector) {
    if (ch === '(' || ch === '[') depth++;
    if (ch === ')' || ch === ']') depth--;
    if (ch === ',' && depth === 0) {
      out.push(cur.trim());
      cur = '';
    } else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
};

// The subject compound (right-most) of a complex selector, without pseudo-elements.
export function subject(sel) {
  const parts = sel.split(/\s*[\s>+~]\s*(?![^(]*\))/).filter(Boolean);
  return parts[parts.length - 1] || '';
}

export const classesOf = (compound) => [...compound.replace(/:(not|is|where|has)\([^)]*\)/g, '').matchAll(/\.([\w-]+)/g)].map((m) => m[1]);
const pseudoElement = (compound) => (compound.match(/::([\w-]+)/) || [])[1] || '';

// ---- longhand atoms, so a shorthand and its longhands count as touching the same property
const SIDES = ['top', 'right', 'bottom', 'left'];
const BOX = (p) => SIDES.map((s) => `${p}-${s}`);
const BORDER_SIDE = (s) => [`border-${s}-width`, `border-${s}-style`, `border-${s}-color`];
const ATOMS = {
  margin: BOX('margin'),
  'margin-block': ['margin-top', 'margin-bottom'],
  'margin-inline': ['margin-left', 'margin-right'],
  padding: BOX('padding'),
  'padding-block': ['padding-top', 'padding-bottom'],
  'padding-inline': ['padding-left', 'padding-right'],
  border: [...SIDES.flatMap(BORDER_SIDE), 'border-image'],
  'border-block': [...BORDER_SIDE('top'), ...BORDER_SIDE('bottom')],
  'border-inline': [...BORDER_SIDE('left'), ...BORDER_SIDE('right')],
  'border-color': SIDES.map((s) => `border-${s}-color`),
  'border-width': SIDES.map((s) => `border-${s}-width`),
  'border-style': SIDES.map((s) => `border-${s}-style`),
  ...Object.fromEntries(SIDES.map((s) => [`border-${s}`, BORDER_SIDE(s)])),
  'border-radius': ['border-top-left-radius', 'border-top-right-radius', 'border-bottom-right-radius', 'border-bottom-left-radius'],
  background: [
    'background-color',
    'background-image',
    'background-clip',
    'background-origin',
    'background-position',
    'background-size',
    'background-repeat',
    'background-attachment',
  ],
  font: [
    'font-style',
    'font-variant-caps',
    'font-variant-numeric',
    'font-variant-ligatures',
    'font-variant-east-asian',
    'font-weight',
    'font-stretch',
    'font-size',
    'line-height',
    'font-family',
  ],
  'font-variant': ['font-variant-caps', 'font-variant-numeric', 'font-variant-ligatures', 'font-variant-east-asian'],
  outline: ['outline-color', 'outline-style', 'outline-width'],
  gap: ['row-gap', 'column-gap'],
  flex: ['flex-grow', 'flex-shrink', 'flex-basis'],
  inset: SIDES,
  overflow: ['overflow-x', 'overflow-y'],
  transition: ['transition-property', 'transition-duration', 'transition-timing-function', 'transition-delay'],
  animation: [
    'animation-name',
    'animation-duration',
    'animation-timing-function',
    'animation-delay',
    'animation-iteration-count',
    'animation-direction',
    'animation-fill-mode',
    'animation-play-state',
  ],
  'text-decoration': ['text-decoration-line', 'text-decoration-color', 'text-decoration-style', 'text-decoration-thickness'],
  'grid-column': ['grid-column-start', 'grid-column-end'],
  'list-style': ['list-style-type', 'list-style-position', 'list-style-image'],
  container: ['container-name', 'container-type'],
};
export const atoms = (prop) => (prop === 'all' ? ['*'] : ATOMS[prop] || [prop]);

export function touches(a, b) {
  const A = new Set(a.decls.flatMap(([p]) => atoms(p)));
  if (A.has('*')) return b.decls.map(([p]) => p);
  const shared = [];
  for (const [p] of b.decls) {
    const at = atoms(p);
    if (at.includes('*') || at.some((x) => A.has(x))) shared.push(p);
  }
  return shared;
}

const compounds = (sel) => sel.split(/\s*[\s>+~]\s*(?![^(]*\))/).filter(Boolean);
const tagOf = (compound) => (compound.match(/^[a-z][\w-]*/i) || [])[0] || '';
const block = (c) => c.replace(/--.*$/, '');
export const subjectClasses = (sel) =>
  classesOf(subject(sel))
    .filter((c) => !/^(is|has)-/.test(c))
    .map(block);
const scopeOf = (sel) => {
  const parts = compounds(sel);
  if (parts.length < 2) return '';
  return block(classesOf(parts[0]).find((c) => /^(fa|pr)-/.test(c)) || '');
};

// Two rules can only fight over an element if their subjects could be the same element.
// 'disjoint': different tags or pseudo-elements, never the same box.
// 'cross': the subjects name different classes (modifiers and is-/has- state classes aside), or sit in different component roots.
// 'same': everything else; a swap there must be justified.
export function relation(selA, selB, together = () => false) {
  const sa = subject(selA);
  const sb = subject(selB);
  if (pseudoElement(sa) !== pseudoElement(sb)) return 'disjoint';
  const ta = tagOf(sa);
  const tb = tagOf(sb);
  if (ta && tb && ta !== tb) return 'disjoint';
  const pa = scopeOf(selA);
  const pb = scopeOf(selB);
  if (pa && pb && pa !== pb && !together(pa, pb)) return 'cross';
  const ra = classesOf(sa).filter((c) => !/^(is|has)-/.test(c));
  const rb = classesOf(sb).filter((c) => !/^(is|has)-/.test(c));
  if (ra.length && rb.length) return ra.every((x) => rb.every((y) => x === y || together(x, y))) ? 'same' : 'cross';
  const oa = ra.find((c) => /^(fa|pr)-/.test(c)) || pa;
  const ob = rb.find((c) => /^(fa|pr)-/.test(c)) || pb;
  if (oa && ob && block(oa) !== block(ob)) return 'cross';
  return 'same';
}
