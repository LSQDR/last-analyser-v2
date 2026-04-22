export function classifyResponse(clickTimestamp, activeTrial) {
  if (!activeTrial) return null
  const rt = clickTimestamp - activeTrial.goOnset

  // Perseveration sub-100ms anticipatory click
  if (rt < 100) return { classification: 'perseveration', rt, include: false }

  if (activeTrial.type === 'go') {
    return { classification: 'goHit', rt, include: true }
  }

  if (activeTrial.type === 'stop') {
    if (!activeTrial.stopSignalShown) {
      // Clicked before stop signal appeared — counts as Go response
      return { classification: 'goBeforeStop', rt, include: true }
    }
    // Clicked after stop signal — failed stop
    return { classification: 'failedStop', rt, include: true }
  }

  return null
}

// Called at end of response window (1000ms) with no click recorded
export function classifyNoResponse(activeTrial) {
  if (!activeTrial) return null
  if (activeTrial.type === 'go')   return { classification: 'goOmission',      rt: null }
  if (activeTrial.type === 'stop') return { classification: 'successfulStop',  rt: null }
  return null
}
