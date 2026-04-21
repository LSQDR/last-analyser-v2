const CONFIG = {
  TARGET_RATIO:          0.25,
  ISI_MIN_MS:            1000,
  ISI_MAX_MS:            2500,
  RESPONSE_WINDOW_MS:    1000,
  BLOCK_DURATION_MS:     90000,
  BLOCK_COUNT:           3,
  PRACTICE_DURATION_MS:  45000,
  MAX_CONSECUTIVE_TARGETS: 2,
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function buildBlock(durationMs, blockIndex, isPractice = false) {
  const events = []
  let cursor = 0
  let consecutiveTargets = 0

  while (cursor < durationMs) {
    const isi       = randomBetween(CONFIG.ISI_MIN_MS, CONFIG.ISI_MAX_MS)
    const cycleTime = CONFIG.RESPONSE_WINDOW_MS + isi
    if (cursor + cycleTime > durationMs) break

    const targetBudget      = Math.round(events.length * CONFIG.TARGET_RATIO)
    const currentTargets    = events.filter(e => e.type === 'target').length
    const forceNonTarget    = consecutiveTargets >= CONFIG.MAX_CONSECUTIVE_TARGETS
    const isTarget = !forceNonTarget && (
      currentTargets < targetBudget
        ? Math.random() < 0.35   // slight upweight to hit 25% ratio
        : false
    )

    events.push({
      id:           isPractice ? `p${events.length}` : `b${blockIndex}${events.length}`,
      block:        isPractice ? 0 : blockIndex,
      type:         isTarget ? 'target' : 'non-target',
      scheduledAtMs: cursor,
      isims:        isi,
      isPractice,
    })

    consecutiveTargets = isTarget ? consecutiveTargets + 1 : 0
    cursor += cycleTime
  }

  return enforceTargetRatio(events, CONFIG.TARGET_RATIO)
}

// Post-generation correction to swap non-targets to targets if ratio is below floor
function enforceTargetRatio(events, targetRatio) {
  const floor  = targetRatio - 0.03
  const actual = events.filter(e => e.type === 'target').length / events.length
  if (actual >= floor) return events

  const nonTargetIndices = events
    .map((e, i) => ({ e, i }))
    .filter(({ e }) => e.type === 'non-target')
    .map(({ i }) => i)

  const needed = Math.round(targetRatio * events.length) - events.filter(e => e.type === 'target').length
  for (let k = 0; k < Math.min(needed, nonTargetIndices.length); k++) {
    events[nonTargetIndices[k]].type = 'target'
  }
  return events
}

export function generateCPTSchedule() {
  const practice = buildBlock(CONFIG.PRACTICE_DURATION_MS, 0, true)
  const blocks   = Array.from({ length: CONFIG.BLOCK_COUNT }, (_, i) =>
    buildBlock(CONFIG.BLOCK_DURATION_MS, i + 1, false)
  )

  // Validate
  blocks.forEach((block, i) => {
    const targets = block.filter(e => e.type === 'target').length
    const ratio   = targets / block.length
    if (ratio < 0.22 || ratio > 0.28)
      console.warn(`CPT Block ${i + 1} target ratio out of bounds: ${ratio.toFixed(3)}`)
    if (targets < 8)
      console.warn(`CPT Block ${i + 1} has fewer than 8 targets: ${targets}`)
  })

  return { practice, blocks }
}

export { CONFIG as CPT_CONFIG }
