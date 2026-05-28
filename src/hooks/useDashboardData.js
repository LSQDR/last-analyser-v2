import { useState, useEffect } from 'react'
import { loadTaskResult } from '../utils/storage.js'
import { TASK_REGISTRY } from '../config/taskRegistry.js'

export function useDashboardData() {
  const [data, setData] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    const results = {}
    let completedCount = 0

    TASK_REGISTRY.forEach((task) => {
      const raw = loadTaskResult(task.storageKey)
      if (raw) {
        results[task.id] = raw
        completedCount++
      } else {
        results[task.id] = null
      }
    })

    if (completedCount === 0) {
      setStatus('empty')
    } else if (completedCount === TASK_REGISTRY.length) {
      setStatus('complete')
    } else {
      setStatus('partial')
    }

    setData(results)
  }, [])

  return { data, status }
}
