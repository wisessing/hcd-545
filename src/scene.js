import * as THREE from 'three';
import { settings } from './settings.js';

// 1 three.js unit = 1 metre. Scale cues (a 2 m door, a 1.7 m figure) tell the brain how big the room is.
function canvasTexture(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

const skyTextures = {
  gradient: () => canvasTexture(512, 256, (g, w, h) => {
    const grad = g.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#1b2a55'); grad.addColorStop(0.5, '#8fb4e8'); grad.addColorStop(0.55, '#e8dcc0'); grad.addColorStop(1, '#4a4a4a');
    g.fillStyle = grad; g.fillRect(0, 0, w, h);
  }),
  checker: () => canvasTexture(1024, 512, (g, w, h) => {
    const n = 32, sw = w / n, sh = h / (n / 2);
    for (let y = 0; y < n / 2; y++) for (let x = 0; x < n; x++) {
      g.fillStyle = (x + y) % 2 ? '#f2f2f2' : '#202020';
      g.fillRect(x * sw, y * sh, sw, sh);
    }
  }),
  dark: () => canvasTexture(8, 8, (g, w, h) => { g.fillStyle = '#05060a'; g.fillRect(0, 0, w, h); }),
};

export function createEnvironment(scene) {
  const root = new THREE.Group();
  scene.add(root);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x445566, 1.6));
  const sun = new THREE.DirectionalLight(0xffffff, 2.0);
  sun.position.set(4, 8, 3);
  scene.add(sun);

  // Floor and a 1 m grid (a ruler for free).
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(40, 64).rotateX(-Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x5a6b5a, roughness: 1 }));
  root.add(floor);
  const grid = new THREE.GridHelper(60, 60, 0xffffff, 0x99aa99);
  grid.position.y = 0.005;
  grid.material.transparent = true; grid.material.opacity = 0.35;
  root.add(grid);

  // Sky sphere.
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(90, 32, 16),
    new THREE.MeshBasicMaterial({ side: THREE.BackSide, depthWrite: false, fog: false }));
  sky.renderOrder = -1;
  root.add(sky);
  let skyMap = null;
  function setSky(kind) {
    skyMap?.dispose();
    skyMap = (skyTextures[kind] || skyTextures.gradient)();
    sky.material.map = skyMap;
    sky.material.needsUpdate = true;
  }

  // Objects of different sizes at different distances (parallax and size cues).
  const props = new THREE.Group();
  root.add(props);
  const palette = [0xe4572e, 0x29b6f6, 0xf6c445, 0x8e6bbf, 0x4caf7d];
  const specs = [
    [-2, 0.25, -3, 0.5], [2.2, 0.5, -4, 1.0], [0, 0.15, -2, 0.3], [5, 0.75, -8, 1.5],
    [-6, 1.0, -10, 2.0], [-4, 0.3, 2, 0.6], [4, 0.4, 3, 0.8], [0, 0.5, 6, 1.0],
  ];
  specs.forEach(([x, y, z, s], i) => {
    const m = new THREE.Mesh(
      i % 2 ? new THREE.BoxGeometry(s, s, s) : new THREE.SphereGeometry(s / 2, 24, 16),
      new THREE.MeshStandardMaterial({ color: palette[i % palette.length], roughness: 0.6 }));
    m.position.set(x, y, z);
    props.add(m);
  });
  const orbiter = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.25, 0.08, 96, 12),
    new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.3, roughness: 0.3 }));
  orbiter.position.set(0, 1.4, -5);
  props.add(orbiter);

  // Human-scale cues: a 0.9 x 2.0 m door frame and a 1.7 m figure.
  const cues = new THREE.Group();
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x8a5a2b });
  const door = new THREE.Group();
  [[-0.5, 1, 0, 0.1, 2, 0.1], [0.5, 1, 0, 0.1, 2, 0.1], [0, 2.05, 0, 1.1, 0.1, 0.1]].forEach(([x, y, z, w, hh, d]) => {
    const p = new THREE.Mesh(new THREE.BoxGeometry(w, hh, d), frameMat);
    p.position.set(x, y, z);
    door.add(p);
  });
  door.position.set(-3.5, 0, -6);
  door.rotation.y = 0.5;
  cues.add(door);
  const figure = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.18, 1.1, 4, 12), new THREE.MeshStandardMaterial({ color: 0x3355aa }));
  body.position.y = 0.75;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 12), new THREE.MeshStandardMaterial({ color: 0xd9a37a }));
  head.position.y = 1.6;
  figure.add(body, head);
  figure.position.set(0.8, 0, -5.5);
  cues.add(figure);
  root.add(cues);

  function setCues(on) { cues.visible = on; }

  setSky(settings.sky);
  setCues(settings.cues);

  return {
    root, floor, setSky, setCues,
    update(t) {
      if (!settings.reducedMotion) { orbiter.rotation.y = t * 0.6; orbiter.rotation.x = t * 0.3; }
    },
  };
}
