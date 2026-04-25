
import { useState, useEffect } from 'react'
import { loadTaskResult } from '../utils/storage.js'

const TASK_KEYS = {
  task1: 'tapThePulse',
  task2: 'signalStop',
  task3: 'wordColourClash',
  task4: 'matchOrPass',
}

export function useDashboardData() {
  const [data,   setData]   = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    const results = {}
    let completedCount = 0

    Object.entries(TASK_KEYS).forEach(([key, storageKey]) => {
      const raw = loadTaskResult(storageKey)
      if (raw) { results[key] = raw; completedCount++ }
      else        results[key] = null
    })

    if      (completedCount === 0) setStatus('empty')
    else if (completedCount === 4) setStatus('complete')
    else                           setStatus('partial')

    setData(results)
  }, [])

  return { data, status }
}
