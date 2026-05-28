const TASK_KEYS = {
  tapThePulse: 'tapThePulse',
  signalStop: 'signalStop',
  wordColourClash: 'wordColourClash',
  matchOrPass: 'matchOrPass',
}

const TASK_VERSIONS = {
  tapThePulse: '1.0',
  signalStop: '1.0',
  wordColourClash: '1.0',
  matchOrPass: '1.0',
}

const SESSION_KEY = 'lastAnalyser.session'

// Writes any payload to a task key.
// Call with status:'started' at task start, status:'complete' at task end.
export function saveTaskResult(taskKey, payload) {
  const key = TASK_KEYS[taskKey]
  if (!key) throw new Error(`Unknown taskKey: ${taskKey}`)
  localStorage.setItem(key, JSON.stringify(payload))
}

// Reads and parses a task result.
// Returns null if missing, malformed, status !== 'complete', or version mismatch.
// Returns the parsed object if valid.
export function loadTaskResult(taskKey) {
  const key = TASK_KEYS[taskKey]
  if (!key) return null

  const raw = localStorage.getItem(key)
  if (!raw) return null

  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }

  if (parsed.status !== 'complete') return null

  if (parsed.version !== TASK_VERSIONS[taskKey]) return null

  return parsed
}

// Returns the raw parsed object regardless of status. 
// Returns null if missing or malformed.
export function loadTaskDraft(taskKey) {
  const key = TASK_KEYS[taskKey]
  if (!key) return null

  const raw = localStorage.getItem(key)
  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

// Removes all task results and session meta.
export function clearAllResults() {
  Object.values(TASK_KEYS).forEach(key => localStorage.removeItem(key))
  localStorage.removeItem(SESSION_KEY)
}

// Saves app-level flow state.
export function saveSession(sessionPayload) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionPayload))
}

// Returns parsed session meta or null.
export function loadSession() {
  const raw = localStorage.getItem(SESSION_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export { TASK_KEYS, TASK_VERSIONS }
