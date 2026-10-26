// Your playground for the primer. Each section of the primer has a block below, commented out.
// To try a section: select its lines (not the ---- heading), press Ctrl+/ (Mac: Cmd+/) to uncomment, and save (Ctrl+S).
// The page reloads. Lines with show() appear in the "try.js" box at the bottom left; for onKey(),
// click the scene once and press the key. To undo, comment the lines out again and save.
// Try one section at a time: two sections that use the same key both run when you press it.
// A line that starts with // // is a note: it stays a comment when you uncomment its block.
//
//   show(label, value)         one line in the box; with () => value it is re-read four times a second
//   onKey(key, action, label)  pressing the key runs action(); the label is listed in the box
import * as THREE from 'three';

export function tryIt({ renderer, scene, camera, rig, look, settings, caps, show, onKey }) {
  show('try.js', 'running. Uncomment a section below and save.');

  // ---- 1. Units and axes ----
  // show('camera position', camera.position);
  // show('rig position', () => rig.position);
  // onKey('1', () => rig.position.z = -2, 'move 2 m forward');
  // onKey('2', () => rig.position.x = 1, 'move 1 m to the right');
  // onKey('0', () => rig.position.set(0, 0, 0), 'back to the start');

  // ---- 2. The scene graph and the rig ----
  // show('scene children', () => scene.children.map((o) => o.type));
  // show('camera parent is the rig', camera.parent === rig);
  // onKey('1', () => rig.rotation.y = Math.PI, 'turn your body around (180 degrees)');
  // onKey('2', () => rig.rotation.y = 0, 'turn back');
  // onKey('3', () => scene.children[1].visible = !scene.children[1].visible, 'hide or show the environment group');

  // ---- 3. The camera ----
  // show('fov', () => camera.fov);
  // show('far', () => camera.far);
  // onKey('1', () => camera.fov = 30, 'fov 30 (nothing changes yet)');
  // onKey('2', () => camera.updateProjectionMatrix(), 'updateProjectionMatrix()');
  // onKey('3', () => { camera.fov = 70; camera.far = 5; camera.updateProjectionMatrix(); }, 'fov 70, far 5');
  // onKey('0', () => { camera.far = 200; camera.updateProjectionMatrix(); }, 'far 200 again');

  // ---- 4. The renderer ----
  // show('canvas', () => `${renderer.domElement.width} x ${renderer.domElement.height} pixels`);
  // show('pixel ratio', renderer.getPixelRatio());
  // show('draw calls', () => renderer.info.render.calls);
  // show('triangles', () => renderer.info.render.triangles);

  // ---- 5. Mesh = geometry + material ----
  // const cube = scene.children.find((o) => o.isMesh);   // your gold cube
  // show('cube geometry', cube.geometry.parameters);
  // show('cube color', () => cube.material.color);
  // onKey('1', () => cube.material.color.set('hotpink'), 'pink');
  // onKey('2', () => cube.scale.set(2, 2, 2), 'twice as big: 0.8 m');
  // onKey('3', () => cube.material.wireframe = !cube.material.wireframe, 'wireframe on or off');

  // ---- 6. Lights and shadows ----
  // const sun = scene.children.find((o) => o.isDirectionalLight);
  // const hemi = scene.children.find((o) => o.isHemisphereLight);
  // show('sun casts shadows', () => sun.castShadow);
  // show('hemisphere intensity', () => hemi.intensity);
  // onKey('1', () => sun.castShadow = true, 'shadows on (the same as pressing Shadows)');
  // onKey('2', () => sun.position.set(-6, 3, 3), 'a low sun on the left');
  // onKey('3', () => hemi.intensity = 0, 'hemisphere light off');

  // ---- 7. Loading a glTF model ----
  // show('models loaded', () => scene.children[1].children[5].children.length);   // the 'models' group inside root

  // ---- 8. The render loop ----
  // show('frame', () => renderer.info.render.frame);
  // show('added latency (ms)', () => settings.latencyMs);
  // onKey('1', () => settings.latencyMs = 300, 'add 300 ms of latency');
  // onKey('2', () => settings.latencyMs = 0, 'no added latency');
  // onKey('3', () => renderer.setAnimationLoop(null), 'stop the loop (save the file to start again)');

  // ---- 9. WebXR: from page to session ----
  // show('xr enabled', renderer.xr.enabled);
  // show('presenting', () => renderer.xr.isPresenting);
  // show('immersive-vr supported', navigator.xr ? 'asking...' : 'undefined (no navigator.xr)');
  // navigator.xr?.isSessionSupported('immersive-vr').then((ok) => show('immersive-vr supported', ok));
  // // still 'asking...' after 4 s: the browser has not answered (Lab 1's capabilities.js waits 4 s for the same reason)

  // ---- 10. Reference spaces and the camera in a session (Immersive Web Emulator) ----
  // show('session features', () => renderer.xr.getSession()?.enabledFeatures ?? 'no session');
  // show('rig height', () => rig.position.y);
  // show('camera position', () => camera.position);
  // show('camera fov', () => camera.fov);
  // show('eye cameras', () => (renderer.xr.isPresenting ? renderer.xr.getCamera().cameras.length : 'no session'));
  // onKey('1', () => camera.position.z = -3, 'set the camera z to -3');
  // onKey('2', () => rig.position.z = -3, 'move the rig 3 m forward');

  // ---- 11. Controllers and select (Immersive Web Emulator) ----
  // const ctrl = renderer.xr.getController(0);
  // rig.add(ctrl);
  // show('controller 0', 'not connected');
  // ctrl.addEventListener('connected', (e) => show('controller 0', `${e.data.handedness} ${e.data.targetRayMode}`));
  // ctrl.addEventListener('select', () => scene.children.find((o) => o.isMesh).material.color.set('red'));

  return {
    update(t) {
      // Runs every frame, like update(t) in my-scene.js. t is the time in seconds.
    },
  };
}
