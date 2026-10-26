import { h } from './ui.js';

// Frame-rate box under the toolbar. It counts frames for half a second, then shows frames per second and the
// average time per frame. Frame time matters more than fps: 60 Hz = 16.7 ms, 72 Hz = 13.9 ms, 90 Hz = 11.1 ms.
// The box turns red when the page runs below 90 % of the target rate (60 on a screen, the headset's rate in VR).
export class FpsCounter {
  constructor(targetHz = 60) {
    this.targetHz = targetHz;
    this.el = h('div', { id: 'fps', title: 'Frame rate' }, '-- fps');
    this.frames = 0; this.acc = 0; this.fps = 0; this.ms = 0;
  }
  setTarget(hz) { this.targetHz = hz; }
  tick(dt) {
    this.frames++; this.acc += dt;
    if (this.acc >= 0.5) {
      this.fps = this.frames / this.acc;
      this.ms = (this.acc / this.frames) * 1000;
      this.el.textContent = `${this.fps.toFixed(0)} fps\n${this.ms.toFixed(1)} ms`;
      this.el.classList.toggle('bad', this.fps < this.targetHz * 0.9);
      this.frames = 0; this.acc = 0;
    }
  }
}
