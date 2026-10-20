import { h } from './ui.js';

// Frame counter. Frame time (ms) matters more than fps: 72 Hz = 13.9 ms, 90 Hz = 11.1 ms, 60 Hz = 16.7 ms.
export class FpsCounter {
  constructor(targetHz = 60) {
    this.targetHz = targetHz;
    this.el = h('div', { id: 'fps' }, '-- fps');
    this.frames = 0; this.acc = 0; this.worst = 0; this.fps = 0; this.ms = 0;
  }
  setTarget(hz) { this.targetHz = hz; }
  tick(dt) {
    this.frames++; this.acc += dt; this.worst = Math.max(this.worst, dt);
    if (this.acc >= 0.5) {
      this.fps = this.frames / this.acc;
      this.ms = (this.acc / this.frames) * 1000;
      this.el.textContent = `${this.fps.toFixed(0)} fps | ${this.ms.toFixed(1)} ms | worst ${(this.worst * 1000).toFixed(0)} ms`;
      this.el.classList.toggle('bad', this.fps < this.targetHz * 0.9);
      this.frames = 0; this.acc = 0; this.worst = 0;
    }
  }
}
