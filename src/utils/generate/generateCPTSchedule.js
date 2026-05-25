import { TASK_REGISTRY } from '../../config/taskRegistry.js'

const cfg = TASK_REGISTRY.find((t) => t.id === 'tapThePulse').config

export const DEFAULT_CPT_CONFIG = cfg
export { DEFAULT_CPT_CONFIG as CPTCONFIG }

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function enforceTargetRatio(events, targetRatio, maxConsecutiveTargets) {
  const floor = targetRatio - 0.03
  const actual = events.filter((e) => e.type === 'target').length / events.length
  if (actual >= floor) return events

  const needed = Math.round(targetRatio * events.length)
    - events.filter((e) => e.type === 'target').length

  let flipped = 0
  for (let i = 0; i < events.length && flipped < needed; i++) {
    if (events[i].type !== 'non-target') continue

    // Count how many consecutive targets precede this index
    let runBefore = 0
    for (let j = i - 1; j >= 0 && events[j].type === 'target'; j--) runBefore++

    // Count how many consecutive targets follow this index
    let runAfter = 0
    for (let j = i + 1; j < events.length && events[j].type === 'target'; j++) runAfter++

    // Flipping would create a run of (runBefore + 1 + runAfter)
    if (runBefore + 1 + runAfter <= maxConsecutiveTargets) {
      events[i].type = 'target'
      flipped++
    }
  }

  return events
}

function buildBlock(durationMs, blockIndex, isPractice, config) {
  const events = []
  let cursor = 0
  let consecutiveTargets = 0
  while (cursor < durationMs) {
    const isi = randomBetween(config.isiMinMs, config.isiMaxMs)
    const cycleTime = config.responseWindowMs + isi
    if (cursor + cycleTime > durationMs) break
    const forceNonTarget = consecutiveTargets >= config.maxConsecutiveTargets
    const currentTargets = events.filter((e) => e.type === 'target').length
    const isTarget = !forceNonTarget && currentTargets < Math.round(events.length * config.targetRatio)
      ? Math.random() < 0.35
      : false
    events.push({
      id: isPractice ? `p${events.length}` : `b${blockIndex}e${events.length}`,
      block: isPractice ? 0 : blockIndex,
      type: isTarget ? 'target' : 'non-target',
      scheduledAtMs: cursor,
      isiMs: isi,
      isPractice,
    })
    consecutiveTargets = isTarget ? consecutiveTargets + 1 : 0
    cursor += cycleTime
  }
  return enforceTargetRatio(events, config.targetRatio, config.maxConsecutiveTargets)
}

export function generateCPTSchedule(cfg = {}) {
  const config = { ...DEFAULT_CPT_CONFIG, ...cfg }
  const practice = buildBlock(config.practiceDurationMs, 0, true, config)
  const blocks = Array.from({ length: config.blockCount }, (_, i) => buildBlock(config.blockDurationMs, i + 1, false, config))
  blocks.forEach((block, i) => {
    const ratio = block.filter((e) => e.type === 'target').length / block.length
    if (ratio < 0.22 || ratio > 0.28) console.warn(`CPT Block ${i + 1} ratio out of bounds`, ratio.toFixed(3))
  })
  return { practice, blocks }
}
