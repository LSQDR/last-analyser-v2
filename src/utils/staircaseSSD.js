import { SST_CONFIG } from './generate/generateSSTSchedule.js'

export class StaircaseSSD {
  constructor() {
    this.current = SST_CONFIG.INITIAL_SSD_MS
    this.history = [SST_CONFIG.INITIAL_SSD_MS]
  }

  // Call after every stop trial result
  update(stopSuccess) {
    const delta = SST_CONFIG.SSD_STEP_MS
    const next  = stopSuccess
      ? this.current + delta  // successful stop → harder (longer delay)
      : this.current - delta  // failed stop    → easier (shorter delay)

    this.current = Math.min(
      Math.max(next, SST_CONFIG.SSD_CLAMP_MIN_MS),
      SST_CONFIG.SSD_CLAMP_MAX_MS
    )
    this.history.push(this.current)
    return this.current
  }

  getMeanSSD() {
    return this.history.reduce((s, v) => s + v, 0) / this.history.length
  }

  // Convergence check: last 10 stop trials oscillate within 100ms
  hasConverged() {
    const recent = this.history.slice(-10)
    if (recent.length < 10) return false
    return Math.max(...recent) - Math.min(...recent) <= 100
  }
}
