import { h } from './ui.js';

// The primer playground. It loads src/try.js, gives it show() and onKey(), and draws the "try.js" box at the bottom left.
// You do not need to change this file: write your lines in src/try.js.
//   show(label, value)        one line in the box. Pass a function, () => value, to re-read it four times a second.
//   onKey(key, action, label) press that key on the page to run action(); the label is listed in the box.
const rows = new Map();     // label -> { el, value }
const keys = new Map();     // key -> [{ action, label }]
let box = null, list = null, help = null;
let tryUpdate = null;

function ensureBox() {
  if (box) return;
  list = h('div', { class: 'tryrows' });
  help = h('div', { class: 'trykeys' });
  box = h('div', { id: 'trybox', role: 'status', 'aria-live': 'polite' }, h('div', { class: 'tryhead' }, 'try.js'), list, help);
  document.body.append(box);
}

function fmtNum(n) {
  return Number.isInteger(n) ? String(n) : String(Math.round(n * 100) / 100);
}

// Readable text for the values the primer shows: numbers, vectors, plain objects, arrays.
export function fmt(v) {
  if (v === undefined) return 'undefined';
  if (v === null) return 'null';
  if (typeof v === 'number') return fmtNum(v);
  if (typeof v === 'string') return v;
  if (typeof v === 'boolean') return String(v);
  if (v.isVector3 || v.isEuler) return `x ${fmtNum(v.x)}, y ${fmtNum(v.y)}, z ${fmtNum(v.z)}`;
  if (v.isVector2) return `x ${fmtNum(v.x)}, y ${fmtNum(v.y)}`;
  if (v.isColor) return '#' + v.getHexString();
  if (v.isObject3D) return `${v.type}${v.name ? ` "${v.name}"` : ''}`;
  if (Array.isArray(v)) return v.map(fmt).join(', ');
  if (typeof v === 'object') return Object.entries(v).filter(([, x]) => typeof x !== 'object' || x === null).map(([k, x]) => `${k} ${fmt(x)}`).join(', ');
  return String(v);
}

export function show(label, value) {
  ensureBox();
  let row = rows.get(label);
  if (!row) {
    row = { el: h('div', { class: 'tryrow' }) };
    rows.set(label, row);
    list.append(row.el);
  }
  row.value = value;
  paint(label, row);
}

function paint(label, row) {
  let text;
  try { text = fmt(typeof row.value === 'function' ? row.value() : row.value); } catch (e) { text = `error: ${e.message}`; }
  const line = `${label}: ${text}`;
  if (row.el.textContent !== line) row.el.textContent = line;
}

export function onKey(key, action, label = '') {
  ensureBox();
  const k = String(key).toLowerCase();
  if (!keys.has(k)) keys.set(k, []);
  keys.get(k).push({ action, label });
  help.textContent = [...keys].map(([kk, as]) => as.map((a) => `${kk.toUpperCase()}: ${a.label || '(action)'}`).join('\n')).join('\n');
}

function showError(where, e) {
  console.error(e);
  show(`error in ${where}`, `${e.message} (the console has the line number)`);
  box.classList.add('bad');
}

window.addEventListener('keydown', (e) => {
  if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
  const as = keys.get(e.key.toLowerCase());
  if (!as) return;
  for (const a of as) {
    try { a.action(); } catch (err) { showError(`the action for key ${e.key}`, err); }
  }
});

setInterval(() => rows.forEach((row, label) => { if (typeof row.value === 'function') paint(label, row); }), 250);

export const playground = {
  async run(ctx) {
    let mod;
    try {
      mod = await import('./try.js');
    } catch (e) {
      // a typing mistake in try.js is caught here; the scene keeps running
      ensureBox();
      showError('try.js', e);
      return;
    }
    try {
      const r = mod.tryIt({ ...ctx, show, onKey });
      if (r && typeof r.update === 'function') tryUpdate = r.update;
    } catch (e) {
      showError('try.js', e);
    }
  },
  update(t) {
    if (!tryUpdate) return;
    try { tryUpdate(t); } catch (e) { tryUpdate = null; showError('update(t) in try.js', e); }
  },
};
