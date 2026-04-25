import { TASK_KEYS } from './storage.js'

export function retakeSingleTask(taskKey) {
  const storageKey = TASK_KEYS[taskKey]
  if (storageKey) localStorage.removeItem(storageKey)
}

export function retakeAllTasks() {
  Object.values(TASK_KEYS).forEach(key => localStorage.removeItem(key))
}
