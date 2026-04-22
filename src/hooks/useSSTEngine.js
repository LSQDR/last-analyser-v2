import { useRef, useState, useCallback } from 'react'
import { runSchedule } from '../utils/precisionTimer.js'
import { classifyResponse, classifyNoResponse } from '../utils/classify/classifySSTResponse.js'
import { StaircaseSSD } from '../utils/staircaseSSD.js'

const RESPONSE_WINDOW_MS = 1000   // 800ms display + 200ms grace

export function useSSTEngine(schedule, onComplete) {
  const staircase     = useRef(new StaircaseSSD())
  const activeTrial   = useRef(null)
  const trialLog      = useRef([])
  const cancelRAF     = useRef(null)
  const closeTimer    = useRef(null)
  const stopTimer     = useRef(null)

  const [goVisible,      setGoVisible]      = useState(false)
  const [stopVisible,    setStopVisible]    = useState(false)
  const [slowWarning,    setSlowWarning]    = useState(false)
  const [isRunning,      setIsRunning]      = useState(false)
  const [trialCount,     setTrialCount]     = useState(0)

  function logTrial(trial) {
    trialLog.current.push(trial)
  }

  const handleTrialFire = useCallback((trial, fireTimestamp) => {
    const ssd = staircase.current.current

    activeTrial.current = {
      ...trial,
      ssdms:           trial.type === 'stop' ? ssd : null,
      goOnset:         fireTimestamp,
      responded:       false,
      stopSignalShown: false,
    }

    setGoVisible(true)
    setTrialCount(c => c + 1)

    // Fire stop signal exactly SSD ms after Go onset (stop trials only)
    if (trial.type === 'stop') {
      stopTimer.current = setTimeout(() => {
        const actualDelay = performance.now() - activeTrial.current.goOnset
        activeTrial.current.stopSignalShown       = true
        activeTrial.current.stopSignalActualDelayms = actualDelay
        activeTrial.current.stopSignalDriftms     = actualDelay - ssd
        setStopVisible(true)
      }, ssd)
    }

    // Auto-close response window at 1000ms
    closeTimer.current = setTimeout(() => {
      const result = classifyNoResponse(activeTrial.current)
      if (result) {
        const completed = { ...activeTrial.current, ...result }
        logTrial(completed)

        // Update staircase on stop trials
        if (activeTrial.current.type === 'stop') {
          staircase.current.update(result.classification === 'successfulStop')
        }
      }
      setGoVisible(false)
      setStopVisible(false)
      activeTrial.current = null
    }, RESPONSE_WINDOW_MS)
  }, [])

  const handleClick = useCallback(() => {
    if (!activeTrial.current || activeTrial.current.responded) return

    const now    = performance.now()
    const result = classifyResponse(now, activeTrial.current)
    if (!result) return

    clearTimeout(closeTimer.current)
    clearTimeout(stopTimer.current)
    activeTrial.current.responded = true

    setGoVisible(false)
    setStopVisible(false)

    // Strategic slowing deterrent — Verbruggen 2019
    if (result.classification === 'goHit' && result.rt > 750) {
      setSlowWarning(true)
      setTimeout(() => setSlowWarning(false), 1500)
    }

    if (!result.include) {
      activeTrial.current = null
      return  // perseveration — don't log
    }

    const completed = { ...activeTrial.current, ...result }
    logTrial(completed)

    // Update staircase after every stop trial click
    if (activeTrial.current.type === 'stop') {
      staircase.current.update(false)  // clicked = failed stop → easier
    }

    activeTrial.current = null
  }, [])

  const start = useCallback(() => {
    staircase.current   = new StaircaseSSD()
    trialLog.current    = []
    setIsRunning(true)
    setTrialCount(0)

    const cancel = runSchedule(
      schedule,
      handleTrialFire,
      () => {
        cancelRAF.current = null
        setIsRunning(false)
        setGoVisible(false)
        setStopVisible(false)
        onComplete(trialLog.current, staircase.current)
      }
    )
    cancelRAF.current = cancel
  }, [schedule, handleTrialFire, onComplete])

  const cancel = useCallback(() => {
    cancelRAF.current?.()
    clearTimeout(closeTimer.current)
    clearTimeout(stopTimer.current)
    setIsRunning(false)
    setGoVisible(false)
    setStopVisible(false)
  }, [])

  return {
    goVisible,
    stopVisible,
    slowWarning,
    isRunning,
    trialCount,
    staircase: staircase.current,
    handleClick,
    start,
    cancel,
  }
}
