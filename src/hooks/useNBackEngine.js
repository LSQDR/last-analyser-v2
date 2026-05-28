import { useRef, useState, useCallback } from 'react'
import { classifyResponse, classifyNoResponse } from '../utils/classify/classifyNBackResponse.js'

export function useNBackEngine(schedule, onBlockComplete) {
  const trialIndex = useRef(0)
  const eventLog = useRef([])
  const activeTrial = useRef(null)
  const responseTimer = useRef(null)

  const [squareColour, setSquareColour]= useState(null)
  const [squareVisible, setSquareVisible] = useState(false)
  const [buttonsEnabled, setButtonsEnabled] = useState(false)
  const [currentTrial, setCurrentTrial] = useState(null)

  function logEvent(event) {
    eventLog.current.push(event)
  }

  const runNextTrial = useCallback(() => {
    if (trialIndex.current >= schedule.length) {
      setSquareVisible(false)
      setButtonsEnabled(false)
      onBlockComplete(eventLog.current)
      return
    }

    const trial = schedule[trialIndex.current]
    trialIndex.current++

    activeTrial.current = { ...trial, onset: performance.now(), responded: false }
    setCurrentTrial(activeTrial.current)

    setSquareColour(trial.colour)
    setSquareVisible(true)
    setButtonsEnabled(true)

    // Hide stimulus after 500ms
    setTimeout(() => {
      setSquareVisible(false)
    }, 500)

    // Close response window after full 2500ms cycle
    responseTimer.current = setTimeout(() => {
      if (!activeTrial.current?.responded) {
        logEvent({
          ...activeTrial.current,
          response:       null,
          classification: classifyNoResponse(trial.isTarget),
          rtms:           null,
        })
      }
      setButtonsEnabled(false)
      runNextTrial()
    }, 2500)
  }, [schedule, onBlockComplete])

  const handleResponse = useCallback((responseType) => {
    if (!activeTrial.current || activeTrial.current.responded) return

    const rt = performance.now() - activeTrial.current.onset
    clearTimeout(responseTimer.current)
    activeTrial.current.responded = true
    setButtonsEnabled(false)

    logEvent({
      ...activeTrial.current,
      response:       responseType,
      classification: classifyResponse(responseType, activeTrial.current.isTarget),
      rtms:           rt,
    })

    // Advance after remaining ISI with a minimum 200ms gap
    const remaining = 2500 - rt
    responseTimer.current = setTimeout(() => {
      runNextTrial()
    }, Math.max(remaining, 200))
  }, [runNextTrial])

  const start = useCallback(() => {
    trialIndex.current = 0
    eventLog.current = []
    activeTrial.current = null
    runNextTrial()
  }, [runNextTrial])

  const reset = useCallback(() => {
    clearTimeout(responseTimer.current)
    trialIndex.current  = 0
    eventLog.current = []
    activeTrial.current = null
    setSquareColour(null)
    setSquareVisible(false)
    setButtonsEnabled(false)
    setCurrentTrial(null)
  }, [])

  return {
    squareColour,
    squareVisible,
    buttonsEnabled,
    currentTrial,
    start,
    reset,
    handleResponse,
  }
}