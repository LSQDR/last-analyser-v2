const CONFIG = {
  TOTAL_TRIALS:     128,
  STOP_RATIO:       0.25,   // 32 stop trials
  GO_DISPLAY_MS:    800,
  ITI_MIN_MS:       400,
  ITI_MAX_MS:       700,
  INITIAL_SSD_MS:   250,
  SSD_STEP_MS:      50,
  SSD_CLAMP_MIN_MS: 50,
  SSD_CLAMP_MAX_MS: 650,
  PRACTICE_TRIALS:  10,
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Distributes stop trials with constraints:
//   - No more than 2 consecutive stop trials
//   - No stop in first 4 or last 4 positions
//   - Roughly even across quarters
function distributeStopTrials(totalTrials, stopCount) {
  const types = Array(totalTrials).fill('go')
  const eligible = []

  for (let i = 4; i < totalTrials - 4; i++) eligible.push(i)

  // Divide eligible into 4 quarters and pick ~stopCount/4 from each
  const perQuarter = Math.floor(stopCount / 4)
  const quarters   = [[], [], [], []]
  eligible.forEach(i => quarters[Math.floor(4 * i / totalTrials)].push(i))

  const chosen = new Set()
  quarters.forEach((q, qi) => {
    const shuffled = shuffle(q)
    const take     = qi < stopCount % 4 ? perQuarter + 1 : perQuarter
    shuffled.slice(0, take).forEach(i => chosen.add(i))
  })

  chosen.forEach(i => { types[i] = 'stop' })

  // Enforce no more than 2 consecutive stops — fix violations
  for (let i = 0; i < types.length - 2; i++) {
    if (types[i] === 'stop' && types[i + 1] === 'stop' && types[i + 2] === 'stop') {
      types[i + 2] = 'go'
    }
  }

  return types
}

export function generateSSTSchedule() {
  const stopCount = Math.round(CONFIG.TOTAL_TRIALS * CONFIG.STOP_RATIO) // 32
  const types     = distributeStopTrials(CONFIG.TOTAL_TRIALS, stopCount)

  let cursor = 0
  return types.map((type, i) => {
    const iti  = randomBetween(CONFIG.ITI_MIN_MS, CONFIG.ITI_MAX_MS)
    const trial = {
      id:            i,
      type,
      scheduledAtMs: cursor,
      itims:         iti,
      ssdms:         null,  // filled at runtime by staircase
    }
    cursor += CONFIG.GO_DISPLAY_MS + 200 + iti  // 800ms display + 200ms grace + ITI
    return trial
  })
}

export function generatePracticeSchedule() {
  let cursor = 0
  return Array(CONFIG.PRACTICE_TRIALS).fill(null).map((_, i) => {
    const iti = randomBetween(CONFIG.ITI_MIN_MS, CONFIG.ITI_MAX_MS)
    const trial = { id: i, type: 'go', scheduledAtMs: cursor, itims: iti, ssdms: null, isPractice: true }
    cursor += CONFIG.GO_DISPLAY_MS + 200 + iti
    return trial
  })
}

export { CONFIG as SST_CONFIG }
