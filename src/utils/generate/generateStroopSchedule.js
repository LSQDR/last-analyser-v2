const CONFIG = {
  CONGRUENT_COUNT: 40,
  INCONGRUENT_COUNT: 40,
  NEUTRAL_COUNT: 10,
  RESPONSE_WINDOW_MS: 2000,
  ITI_MS: 500,
  COLOURS: ['red', 'blue', 'green', 'yellow'],
  WORDS: ['RED', 'BLUE', 'GREEN', 'YELLOW'],
  NEUTRAL_WORD: 'XXXX',
  MAX_CONSECUTIVE_SAME_TYPE: 3,
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

function buildCongruent(n) {
  return Array(n).fill(null).map(() => {
    const colour = randomFrom(CONFIG.COLOURS)
    return { type: 'congruent', word: colour.toUpperCase(), inkColour: colour }
  })
}

function buildIncongruent(n) {
  return Array(n).fill(null).map(() => {
    const word = randomFrom(CONFIG.WORDS)
    const inkOptions = CONFIG.COLOURS.filter(c => c !== word.toLowerCase())
    return { type: 'incongruent', word, inkColour: randomFrom(inkOptions) }
  })
}

function buildNeutral(n) {
  return Array(n).fill(null).map(() => ({
    type: 'neutral',
    word: CONFIG.NEUTRAL_WORD,
    inkColour: randomFrom(CONFIG.COLOURS),
  }))
}

function shuffleWithConstraint(trials, maxConsecutive) {
  const shuffled = [...trials]
  // Fisher-Yates then re-check constraint with up to 50 attempts
  for (let attempt = 0; attempt < 50; attempt++) {
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    if (isValidSequence(shuffled, maxConsecutive)) return shuffled
  }
  return shuffled // return best effort if constraint never satisfied
}

function isValidSequence(arr, maxConsecutive) {
  let count = 1
  for (let i = 1; i < arr.length; i++) {
    if (arr[i].type === arr[i - 1].type) {
      count++
      if (count > maxConsecutive) return false
    } else {
      count = 1
    }
  }
  return true
}

export function generateStroopSchedule() {
  const raw = [
    ...buildCongruent(CONFIG.CONGRUENT_COUNT),
    ...buildIncongruent(CONFIG.INCONGRUENT_COUNT),
    ...buildNeutral(CONFIG.NEUTRAL_COUNT),
  ]
  const shuffled = shuffleWithConstraint(raw, CONFIG.MAX_CONSECUTIVE_SAME_TYPE)

  let cursor = 0
  return shuffled.map((trial, i) => {
    const t = { ...trial, id: i, scheduledAtMs: cursor }
    cursor += CONFIG.RESPONSE_WINDOW_MS + CONFIG.ITI_MS
    return t
  })
}

// Fixed practice set
export const PRACTICE_TRIALS = [
  { type: 'congruent',   word: 'BLUE',   inkColour: 'blue'   },
  { type: 'incongruent', word: 'GREEN',  inkColour: 'red'    },
  { type: 'neutral',     word: 'XXXX',   inkColour: 'yellow' },
  { type: 'congruent',   word: 'YELLOW', inkColour: 'yellow' },
  { type: 'incongruent', word: 'RED',    inkColour: 'green'  },
  { type: 'neutral',     word: 'XXXX',   inkColour: 'blue'   },
].map((t, i) => ({ ...t, id: i, scheduledAtMs: i * (CONFIG.RESPONSE_WINDOW_MS + CONFIG.ITI_MS) }))

export { CONFIG as STROOP_CONFIG }
