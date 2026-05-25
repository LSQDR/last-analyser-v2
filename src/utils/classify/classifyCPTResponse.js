// Called on every click. activeEvent is the currently live stimulus (or null during ISI).
// blockStats is { meanRT, sdRT } from the *previous* block's clean hits (null for Block 1).
export function classifyClick(clickTimestamp, activeEvent, blockStats) {
  if (!activeEvent) return null  // click during ISI

  const rt = clickTimestamp - activeEvent.firesAt

  // Perseveration physiologically impossible, anticipatory
  if (rt < 100) return { classification: 'perseveration', rt, include: false }

  // Commission click on non-target
  if (activeEvent.type === 'non-target') return { classification: 'commission', rt, include: true }

  // Lapse detection  RT > Mean + 2SD of prior block's clean hits
  if (blockStats && blockStats.meanRT && blockStats.sdRT) {
    const lapseThreshold = blockStats.meanRT + 2 * blockStats.sdRT
    if (rt > lapseThreshold) return { classification: 'lapse', rt, include: false }
  }

  return { classification: 'hit', rt, include: true }
}

// Called at end of response window when no click was recorded
export function classifyNoResponse(activeEvent) {
  if (!activeEvent) return null
  if (activeEvent.type === 'target') return { classification: 'omission', rt: null, include: false }
  return null  // non-target with no response is correct
}
