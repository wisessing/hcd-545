import * as THREE from 'three';
import { settings } from './settings.js';

// YOUR TURN (W1, Task 4): make this scene yours. Works as-is; change it, then reload on your phone.
//  1. Change the shape, colour, size and position of `mine`. Keep it between 0.5 m and 5 m from the start (0, 0, 0).
//  2. Add a second object that gives a scale cue (something a person knows the size of: a chair 0.45 m seat height, a mug 0.1 m).
//  3. Move or recolour the point light and look at what changes.
export function addMyContent(scene) {
  const mine = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.4, 0.4),
    new THREE.MeshStandardMaterial({ color: 0xffd54f, roughness: 0.4 }));
  mine.position.set(1, 1.0, -1.5);
  scene.add(mine);

  const light = new THREE.PointLight(0xffe0a0, 8, 6);
  light.position.set(1, 2, -1);
  scene.add(light);

  return {
    mine,
    update(t) {
      if (!settings.reducedMotion) mine.rotation.y = t;   // respect reduced motion even in your own animations
    },
  };
}
