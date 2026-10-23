import { settings, set, onChange, reset } from './settings.js';
import { h, button, slider, checkbox, select, closablePanel } from './ui.js';

// DOM settings panel with a close button. Sections: 'xp' (Lab 2 perception experiment), 'comfort', 'access' (Lab 3).
// DOM does not appear inside a stereo split screen or a headset, so set values in mono first (Lab 3 adds 3D buttons: menu.js).
// comfortButtons: extra buttons for the bottom-left of the panel (the Comfort preset button from main.js); Reset settings sits bottom right.
export function createSettingsPanel({ sections, open = true, comfortButtons = [] }) {
  const controls = {};
  const rows = [];
  const add = (key, el) => { controls[key] = el; rows.push(el); };

  if (sections.includes('xp')) {
    add('ipd', slider({ label: 'IPD (mm)', min: 40, max: 90, step: 1, value: settings.ipd * 1000, format: (v) => v.toFixed(0),
      onInput: (v) => set('ipd', v / 1000) }));
    add('latencyMs', slider({ label: 'Added latency (ms)', min: 0, max: 400, step: 10, value: settings.latencyMs, format: (v) => v.toFixed(0),
      onInput: (v) => set('latencyMs', v) }));
    add('viewerFit', checkbox({ label: 'Viewer fit (cardboard)', value: settings.viewerFit, onInput: (v) => set('viewerFit', v) }));
    add('lensSpacing', slider({ label: 'Lens spacing (mm)', min: 50, max: 75, step: 1, value: settings.lensSpacing,
      format: (v) => v.toFixed(0), onInput: (v) => set('lensSpacing', v) }));
    add('showFps', checkbox({ label: 'Show FPS (developer)', value: settings.showFps, onInput: (v) => set('showFps', v) }));
  }
  if (sections.includes('comfort')) {
    add('vignette', select({ label: 'Comfort vignette', options: [['off', 'Off'], ['motion', 'During motion'], ['always', 'Always']],
      value: settings.vignette, onInput: (v) => set('vignette', v) }));
    add('turnMode', select({ label: 'Turning', options: [['snap', 'Snap'], ['smooth', 'Smooth']],
      value: settings.turnMode, onInput: (v) => set('turnMode', v) }));
    add('snapAngle', slider({ label: 'Turn angle (deg)', min: 15, max: 90, step: 15, value: settings.snapAngle,
      format: (v) => v.toFixed(0), onInput: (v) => set('snapAngle', v) }));
  }
  if (sections.includes('access')) {
    add('gazeEnabled', checkbox({ label: 'Gaze activation (dwell)', value: settings.gazeEnabled, onInput: (v) => set('gazeEnabled', v) }));
    add('dwell', slider({ label: 'Dwell time (s)', min: 0.5, max: 3, step: 0.1, value: settings.dwell,
      format: (v) => v.toFixed(1), onInput: (v) => set('dwell', v) }));
    add('targetScale', slider({ label: 'Target size', min: 0.8, max: 1.6, step: 0.1, value: settings.targetScale,
      format: (v) => v.toFixed(1) + 'x', onInput: (v) => set('targetScale', v) }));
    add('reducedMotion', checkbox({ label: 'Reduced motion (forces snap turn, no animation)', value: settings.reducedMotion, onInput: (v) => set('reducedMotion', v) }));
    add('contrast', checkbox({ label: 'High contrast', value: settings.contrast, onInput: (v) => set('contrast', v) }));
    add('seated', checkbox({ label: 'Seated mode (headset: holds eye height at 1.6 m)', value: settings.seated, onInput: (v) => set('seated', v) }));
    add('captions', checkbox({ label: 'Audio captions', value: settings.captions, onInput: (v) => set('captions', v) }));
    add('audio', checkbox({ label: 'Sound on', value: settings.audio, onInput: (v) => set('audio', v) }));
    add('volume', slider({ label: 'Volume', min: 0, max: 1, step: 0.1, value: settings.volume,
      format: (v) => v.toFixed(1), onInput: (v) => set('volume', v) }));
  }

  const results = h('ol', { class: 'results' });
  const extra = [];
  const api = {
    addResult(text) { results.append(h('li', {}, text)); },
    onStartTrial: null,
    onResetHeight: null,
  };
  if (sections.includes('access')) {
    extra.push(
      h('div', { class: 'btnrow' },
        button('Start 10-target trial', () => api.onStartTrial?.()),
        button('Reset height', () => api.onResetHeight?.())),
      h('p', { class: 'hint' }, 'The trial times how long each target takes. Change dwell time and target size between runs and compare the mean.'),
      results);
  }
  extra.push(h('div', { class: 'btnrow split' }, h('div', {}, ...comfortButtons), button('Reset settings', () => reset())));

  const title = sections.includes('access') ? 'Settings (comfort and accessibility)' : 'Settings';
  const el = closablePanel(title, () => setOpen(false), ...rows, ...extra);
  el.id = 'settings';
  const showBtn = button('Settings', () => setOpen(true), 'show');   // top right; brings the panel back
  function setOpen(v) { el.hidden = !v; showBtn.hidden = v; }
  setOpen(open);

  // Keep the DOM in sync when a preset, a 3D button or Reset settings changes a value.
  onChange((key, value) => {
    const c = controls[key];
    if (c) c.sync(key === 'ipd' ? value * 1000 : value);
  });

  return Object.assign(api, { el, showBtn, setOpen });
}
