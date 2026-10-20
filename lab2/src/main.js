// Lab 2 snapshot: Lab 1 + binocular mode (StereoEffect or WebXR), IPD and latency experiment, FPS counter,
// comfort vignette, snap/smooth turn, blink teleport test, comfort presets, URL switches for platform adaptations.
import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import './style.css';
import { settings, set, onChange } from './settings.js';
import { h, button, startOverlay } from './ui.js';
import { createEnvironment } from './scene.js';
import { LookControls } from './look.js';
import { StereoMode } from './stereo.js';
import { Comfort } from './comfort.js';
import { FpsCounter } from './fps.js';
import { createCapsPanel } from './capabilities.js';
import { createSettingsPanel } from './settings-panel.js';
import { applyPreset, presetNames } from './my-comfort.js';
import { addMyContent } from './my-scene.js';
import { applyAdaptations } from './adapt.js';
import { addFooter } from './footer.js';

// ---- Core: renderer, scene, camera inside a rig ---------------------------------------------------------------
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
const adapt = applyAdaptations({ renderer });     // URL switches ?pr= ?fb= ?fov= (adapt.js): compare numbers before and after
renderer.xr.enabled = true;                       // lets the same renderer present to a headset
renderer.shadowMap.enabled = true;                // shadows themselves are switched on and off with the Shadows button
document.body.append(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.05, 200);
const rig = new THREE.Group();                    // turning and teleport move the rig; the camera pose belongs to look.js / the headset
rig.add(camera);
camera.position.set(0, 1.6, 0);                   // standing eye height (the headset overrides this in XR)
scene.add(rig);

const env = createEnvironment(scene);
const mine = addMyContent(scene);
mine.mine.castShadow = mine.mine.receiveShadow = true;
const look = new LookControls(camera, renderer.domElement, settings);
const stereo = new StereoMode(renderer, settings.ipd);   // side-by-side stereo for a phone viewer (stereo.js)
stereo.setFit(settings.viewerFit, settings.lensSpacing);   // Viewer fit: each eye under its lens (Settings panel)
const comfort = new Comfort({ rig, camera, renderer }); // vignette, snap/smooth turn, blink teleport (comfort.js)
const fps = new FpsCounter(60);

// ---- DOM UI -----------------------------------------------------------------------------------------------------
function renderMode() {
  if (renderer.xr.isPresenting) return 'immersive-vr (WebXR)';
  if (!stereo.enabled) return 'monocular';
  return stereo.fit ? 'binocular (viewer fit)' : 'binocular (StereoEffect)';
}
// Cues cycles through three views of the scene: everything, only the geometric solids, only the sofa and the car.
const CUE_MODES = ['all', 'solids', 'models'];
const cueIndex = () => { const i = CUE_MODES.indexOf(settings.cues); return i < 0 ? 1 : i; };   // older saved values (true/false) become 'solids'
function applyCues() {
  const mode = CUE_MODES[cueIndex()];
  env.setCues(mode);
  mine.mine.visible = mode !== 'models';   // your own cube is a solid too
}
applyCues();
env.setShadows(settings.shadows);

const caps = createCapsPanel({ lab: 'lab2', look, getRenderMode: renderMode, getInputMode: () => (renderer.xr.isPresenting ? 'headset (XR)' : look.mode) });
const panel = createSettingsPanel({ sections: ['xp', 'comfort'] });   // IPD, latency, FPS, vignette, turning (settings-panel.js)

let presetIndex = 0;
// Blink test: Lab 3 adds teleport pads; until then this button runs the same blink teleport (vignette tunnel, fade, move, fade back)
// between two spots so you can check that the vignette closes during a teleport. Set Comfort vignette to Off and compare.
let blinkSpot = 0;
const blinkSpots = [new THREE.Vector3(0, 0, -3), new THREE.Vector3(0, 0, 0)];
function setStereo(on) {
  if (on) stereo.enable(); else stereo.disable();   // enable() must run inside the click (fullscreen needs a gesture)
  document.body.classList.toggle('stereo', on);
  resize();                                          // resets the viewport that StereoEffect leaves on the right half
}

document.body.append(
  h('div', { class: 'stack' },
    h('div', { class: 'shows' }, caps.showBtn, panel.showBtn),
    caps.el, panel.el),
  h('div', { id: 'bar' },
    button('Stereo', () => setStereo(!stereo.enabled)),
    button('Turn left', () => comfort.turn(-1)),
    button('Turn right', () => comfort.turn(1)),
    button('Blink test', () => { comfort.teleportTo(blinkSpots[blinkSpot]); blinkSpot = 1 - blinkSpot; }),
    button('Comfort preset', (e) => {   // applies the next preset from my-comfort.js and shows its name on the button
      const name = presetNames[presetIndex];
      presetIndex = (presetIndex + 1) % presetNames.length;
      applyPreset(name);
      e.currentTarget.textContent = `Comfort: ${name}`;
    }),
    button('Recenter', () => { look.recenter(); rig.rotation.y = 0; comfort.pendingYaw = 0; }),   // face the start direction: also undoes turns
    button('Sky', () => { const k = ['gradient', 'checker', 'dark']; set('sky', k[(k.indexOf(settings.sky) + 1) % k.length]); }),
    button('Cues', () => set('cues', CUE_MODES[(cueIndex() + 1) % CUE_MODES.length])),
    button('Shadows', () => set('shadows', !settings.shadows)),
    button('Exit stereo', () => setStereo(false), 'keep')),   // the only toolbar button shown in stereo
  fps.el);
fps.el.hidden = !settings.showFps;   // 'Show FPS (developer)' checkbox in the Settings panel
addFooter();   // "build <commit hash>": shows which commit a deployed page was built from

// In the stereo split screen the DOM buttons are hidden. Tap the far left or right edge of the screen to turn (Q / E on a keyboard).
let downX = 0;
renderer.domElement.addEventListener('pointerdown', (e) => { downX = e.clientX; });
renderer.domElement.addEventListener('pointerup', (e) => {
  if (!stereo.enabled || Math.abs(e.clientX - downX) > 8) return;
  const f = e.clientX / window.innerWidth;
  if (f < 0.12) comfort.turn(-1); else if (f > 0.88) comfort.turn(1);
});

onChange((key) => {
  if (key === 'ipd') stereo.setIpd(settings.ipd);      // eye separation in metres
  if (key === 'viewerFit' || key === 'lensSpacing') stereo.setFit(settings.viewerFit, settings.lensSpacing);
  if (key === 'sky') env.setSky(settings.sky);
  if (key === 'cues') applyCues();
  if (key === 'shadows') env.setShadows(settings.shadows);
  if (key === 'showFps') fps.el.hidden = !settings.showFps;
});

// "Enter VR" only appears if the browser says immersive-vr is supported. In a headset the browser draws both eyes itself,
// so StereoEffect and look.js are not used during the session.
if (navigator.xr) {
  navigator.xr.isSessionSupported('immersive-vr').then((ok) => {
    if (ok) { const b = VRButton.createButton(renderer); b.classList.add('vrbtn'); document.body.append(b); }
  }).catch(() => {});
}

// ---- XR session hooks -------------------------------------------------------------------------------------------
function refreshSources() {
  const s = renderer.xr.getSession();
  const list = s ? [...s.inputSources].map((i) => `${i.handedness || '-'}:${i.targetRayMode}`).join(', ') : '';
  caps.setInputSources(s ? (list || 'none') : 'no session');
}
renderer.xr.addEventListener('sessionstart', () => {
  const s = renderer.xr.getSession();
  if (stereo.enabled) setStereo(false);              // the headset does its own stereo
  caps.setSessionState('YES (session started)');
  rig.position.y = (s.enabledFeatures && !s.enabledFeatures.includes('local-floor')) ? 1.6 : 0;
  fps.setTarget(s.frameRate || 72);
  s.addEventListener('inputsourceschange', refreshSources);
  refreshSources();
});
renderer.xr.addEventListener('sessionend', () => {
  camera.position.set(0, 1.6, 0); camera.quaternion.identity(); rig.position.y = 0;
  fps.setTarget(60); caps.setSessionState('ended'); refreshSources(); resize();
});

// ---- Resize + loop ----------------------------------------------------------------------------------------------
function resize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);   // also resets the viewport StereoEffect leaves on the right half
}
window.addEventListener('resize', resize);
resize();

let last = performance.now() / 1000;   // (THREE.Clock is deprecated in r186; the loop callback already gets a timestamp)
renderer.setAnimationLoop((now) => {              // not requestAnimationFrame: XR needs the session's own loop
  const t = now / 1000, dt = Math.min(Math.max(t - last, 0), 0.1);   // dt: seconds since the last frame, capped at 0.1 s
  last = t;
  fps.tick(dt);
  if (!renderer.xr.isPresenting) look.update();    // applies the Added latency from the Settings panel
  comfort.update(dt);
  env.update(t); mine.update(t);
  if (stereo.enabled && !renderer.xr.isPresenting) stereo.render(scene, camera);   // two renders per frame, one per eye
  else renderer.render(scene, camera);
});

// ---- Start card: the click we need for iOS motion permission --------------------------------------------------
startOverlay({
  title: 'HCD-545 WebXR starter (Lab 2)',
  lines: [
    'Move your phone to look around, or drag with finger or mouse. Q / E (or the Turn buttons) turn the view.',
    'Press Stereo to split the screen for a phone viewer. Landscape works best.',
    'On iPhone and iPad the browser asks for motion access when you press Start. Please allow it.',
  ],
  onStart: () => { look.requestPermission(); },    // synchronous inside the click: iOS needs the user gesture
});

window.hcd = { renderer, scene, camera, rig, look, stereo, comfort, fps, settings, caps, panel, env, adapt };   // handy in the console
