export function classifyResponse(responseType, isTarget) {
  if (responseType === 'match'  &&  isTarget) return 'hit'
  if (responseType === 'pass'   &&  isTarget) return 'miss'
  if (responseType === 'match'  && !isTarget) return 'falseAlarm'
  if (responseType === 'pass'   && !isTarget) return 'correctRejection'
  return null
}

// No response means implicit pass
export function classifyNoResponse(isTarget) {
  return isTarget ? 'omissionTarget' : 'omissionNonTarget'
}

// Warmup-only feedback
export function getWarmupFeedback(classification) {
  const map = {
    hit:              { icon: '✓', text: 'Correct, it matched the one before!',    colour: 'green' },
    miss:             { icon: '✗', text: 'That was a match, try to spot them.',      colour: 'red'   },
    falseAlarm:       { icon: '✗', text: "That wasn't a match, check more carefully.", colour: 'red'   },
    correctRejection: { icon: '✓', text: 'Correct, no match.',                       colour: 'green' },
  }
  return map[classification] || null
}
