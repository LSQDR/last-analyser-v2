const CONFIG = {
  COLOURS:                   ['red', 'blue', 'green', 'yellow'],
  WARMUP_TRIALS:             10,
  WARMUP_N:                  1,
  SCORED_TRIALS:             40,
  SCORED_N:                  2,
  TARGET_RATIO:              0.33,
  STIMULUS_MS:               500,
  ISI_MS:                    2000,
  MAX_CONSECUTIVE_TARGETS:   2,
  MAX_CONSECUTIVE_NON_TARGETS: 4,
}

export const COLOUR_HEX = {
  red:    '#e03c31',
  blue:   '#3a7bd5',
  green:  '#2ecc71',
  yellow: '#f1c40f',
}

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

// Generates a colour sequence and returns trial objects.
// The first `n` items are filler.
function generateNBackSequence(n, totalTrials, targetRatio) {
  const targetCount = Math.round(totalTrials * targetRatio)
  const sequence    = []

  // First n items: random, cannot be targets
  for (let i = 0; i < n; i++) {
    sequence.push(randomFrom(CONFIG.COLOURS))
  }

  let targetsPlaced          = 0
  let consecutiveTargets     = 0
  let consecutiveNonTargets  = 0

  for (let i = n; i < totalTrials + n; i++) {
    const remainingSlots   = (totalTrials + n) - i
    const remainingTargets = targetCount - targetsPlaced

    const mustBeTarget    = remainingTargets >= remainingSlots
    const mustBeNonTarget = consecutiveTargets >= CONFIG.MAX_CONSECUTIVE_TARGETS || remainingTargets <= 0

    let isTarget
    if (mustBeTarget)         isTarget = true
    else if (mustBeNonTarget) isTarget = false
    else                      isTarget = Math.random() < targetRatio

    let colour
    if (isTarget) {
      colour = sequence[i - n]  // exact n-back match
      targetsPlaced++
      consecutiveTargets++
      consecutiveNonTargets = 0
    } else {
      // differs from n-back item
      let forbidden = sequence[i - n]
      do { colour = randomFrom(CONFIG.COLOURS) } while (colour === forbidden)
      consecutiveTargets = 0
      consecutiveNonTargets++
    }
    sequence.push(colour)
  }

  // Slice off filler, returns only the scoreable trials
  return sequence.slice(n).map((colour, i) => ({
    id:            i,
    colour,
    nBackColour:   sequence[i],   // what was shown n steps back
    isTarget:      colour === sequence[i],
    scored:        true,
    scheduledAtMs: i * (CONFIG.STIMULUS_MS + CONFIG.ISI_MS),
  }))
}

function generateWarmupSequence() {
  const n           = CONFIG.WARMUP_N
  const totalTrials = CONFIG.WARMUP_TRIALS
  // Slightly higher target ratio for warmup to give more practice matches
  const targetRatio = 0.40
  const targetCount = Math.round(totalTrials * targetRatio)
  const sequence    = [randomFrom(CONFIG.COLOURS)]

  let targetsPlaced = 0

  for (let i = 1; i < totalTrials + 1; i++) {
    const remaining        = totalTrials + 1 - i
    const remainingTargets = targetCount - targetsPlaced
    const mustBeTarget     = remainingTargets >= remaining
    const mustBeNonTarget  = remainingTargets <= 0

    let isTarget
    if (mustBeTarget)         isTarget = true
    else if (mustBeNonTarget) isTarget = false
    else                      isTarget = Math.random() < targetRatio

    let colour
    if (isTarget) {
      colour = sequence[i - n]
      targetsPlaced++
    } else {
      let forbidden = sequence[i - n]
      do { colour = randomFrom(CONFIG.COLOURS) } while (colour === forbidden)
    }
    sequence.push(colour)
  }

  return sequence.slice(1).map((colour, i) => ({
    id:            i,
    colour,
    nBackColour:   sequence[i],
    isTarget:      colour === sequence[i],
    scored:        false,
    block:         'warmup',
    nLevel:        1,
    scheduledAtMs: i * (CONFIG.STIMULUS_MS + CONFIG.ISI_MS),
  }))
}

export function generateFullSchedule() {
  return {
    warmup: generateWarmupSequence(),
    scored: generateNBackSequence(CONFIG.SCORED_N, CONFIG.SCORED_TRIALS, CONFIG.TARGET_RATIO),
  }
}

export function validateSchedule(scored) {
  const targets = scored.filter(t => t.isTarget).length
  const ratio   = targets / scored.length
  if (ratio < 0.28 || ratio > 0.38) console.warn(`N-Back target ratio out of bounds: ${ratio}`)
  if (targets < 10) console.warn(`Too few targets for reliable hit rate: ${targets}`)
  scored.forEach(trial => {
    if (trial.isTarget && trial.colour !== trial.nBackColour)
      console.error(`Target trial ${trial.id} colour mismatch`)
  })
}

export { CONFIG as NBACK_CONFIG }
