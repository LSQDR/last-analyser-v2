import { TASK_REGISTRY } from '../config/taskRegistry.js';

const {
  initialSsdMs,
  ssdStepMs,
  ssdClampMinMs,
  ssdClampMaxMs,
} = TASK_REGISTRY.find((t) => t.id === 'signalStop').config;

export class StaircaseSSD {
  constructor() {
    this.current = initialSsdMs;
    this.history = [initialSsdMs];
  }

  update(stopSuccess) {
    const next = stopSuccess
      ? this.current + ssdStepMs   // successful stop → harder (longer delay)
      : this.current - ssdStepMs;  // failed stop    → easier (shorter delay)

    this.current = Math.min(Math.max(next, ssdClampMinMs), ssdClampMaxMs);
    this.history.push(this.current);
    return this.current;
  }

  getMeanSSD() {
    return this.history.reduce((s, v) => s + v, 0) / this.history.length;
  }

  hasConverged() {
    const recent = this.history.slice(-10);
    if (recent.length < 10) return false;
    return Math.max(...recent) - Math.min(...recent) <= 100;
  }
}