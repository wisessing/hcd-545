import { set } from './settings.js';

// YOUR TURN (Lab 2): set the three presets from what you found in the comfort experiments, not from these defaults.
// Each preset is a bundle of comfort settings. The Comfort preset button applies them in this order, one per press.
//   vignette:  'off' | 'motion' | 'always'
//   turnMode:  'snap' | 'smooth'
//   snapAngle: degrees per turn (the Turn angle slider goes from 15 to 90 in steps of 15)
//   latencyMs: leave at 0; added latency only ever makes comfort worse
export const presets = {
  sensitive:   { vignette: 'always', turnMode: 'snap',   snapAngle: 45, latencyMs: 0 },
  comfortable: { vignette: 'motion', turnMode: 'snap',   snapAngle: 30, latencyMs: 0 },
  intense:     { vignette: 'off',    turnMode: 'smooth', snapAngle: 30, latencyMs: 0 },
};
export const presetNames = Object.keys(presets);

export function applyPreset(name) {
  for (const [key, value] of Object.entries(presets[name])) set(key, value);
}
