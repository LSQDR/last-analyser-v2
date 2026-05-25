import { TASK_REGISTRY } from '../../config/taskRegistry.js'

const taskCfg = TASK_REGISTRY.find((t) => t.id === 'wordColourClash').config

export const DEFAULT_STROOP_CONFIG = {
  congruentCount: taskCfg.congruentCount,
  incongruentCount: taskCfg.incongruentCount,
  neutralCount: taskCfg.neutralCount,
  responseWindowMs: taskCfg.responseWindowMs,
  itiMs: taskCfg.itiMs,
  maxConsecutiveSameType: 3,
}
export { DEFAULT_STROOP_CONFIG as STROOPCONFIG }

export const COLOUR_HEX = {
  red: '#e03c31',
  blue: '#3a7bd5',
  green: '#2ecc71',
  yellow: '#f1c40f',
}
const WORDS = {
  red: 'RED',
  blue: 'BLUE',
  green: 'GREEN',
  yellow: 'YELLOW',
}
const COLOURS = ['red', 'blue', 'green', 'yellow']

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
function hasRun(types, max) {
  let c = 1
  for (let i = 1; i < types.length; i++) {
    c = types[i] === types[i - 1] ? c + 1 : 1
    if (c > max) return true
  }
  return false
}
function shuffleWithConstraint(arr, max) {
  let r
  let n = 0
  do {
    r = shuffle(arr)
  } while (hasRun(r.map((t) => t.type), max) && ++n < 200)
  return r
}

function buildCongruent(n) {
  return Array(n).fill(null).map(() => {
    const c = COLOURS[Math.floor(Math.random() * COLOURS.length)]
    return { type: 'congruent', word: WORDS[c], inkColour: c }
  })
}
function buildIncongruent(n) {
  return Array(n).fill(null).map(() => {
    const ink = COLOURS[Math.floor(Math.random() * COLOURS.length)]
    let w
    do {
      w = COLOURS[Math.floor(Math.random() * COLOURS.length)]
    } while (w === ink)
    return { type: 'incongruent', word: WORDS[w], inkColour: ink }
  })
}
function buildNeutral(n) {
  return Array(n).fill(null).map(() => ({
    type: 'neutral',
    word: 'XXXX',
    inkColour: COLOURS[Math.floor(Math.random() * COLOURS.length)],
  }))
}

export function generateStroopSchedule(cfg = {}) {
  const config = { ...DEFAULT_STROOP_CONFIG, ...cfg }
  const raw = [
    ...buildCongruent(config.congruentCount),
    ...buildIncongruent(config.incongruentCount),
    ...buildNeutral(config.neutralCount),
  ]
  const shuffled = shuffleWithConstraint(raw, config.maxConsecutiveSameType)
  let cursor = 0
  return shuffled.map((trial, i) => {
    const t = { ...trial, id: i, scheduledAtMs: cursor }
    cursor += config.responseWindowMs + config.itiMs
    return t
  })
}

export const PRACTICE_TRIALS = [
  { type: 'congruent', word: 'BLUE', inkColour: 'blue' },
  { type: 'incongruent', word: 'GREEN', inkColour: 'red' },
  { type: 'neutral', word: 'XXXX', inkColour: 'yellow' },
  { type: 'congruent', word: 'YELLOW', inkColour: 'yellow' },
  { type: 'incongruent', word: 'RED', inkColour: 'green' },
  { type: 'neutral', word: 'XXXX', inkColour: 'blue' },
].map((t, i) => ({
  ...t,
  id: i,
  scheduledAtMs: i * (DEFAULT_STROOP_CONFIG.responseWindowMs + DEFAULT_STROOP_CONFIG.itiMs),
}))