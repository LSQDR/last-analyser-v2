import { useRef, useState, useCallback } from 'react'
import { classifyError } from '../utils/classify/classifyStroopResponse.js'

export function useStroopEngine(schedule, onTrialLogged, onBlockComplete) {
  const activeTrial      = useRef(null)
  const eventLog         = useRef([])
  const responseTimer    = useRef(null)
  const trialIndex       = useRef(0)

  const [stimulusWord,   setStimulusWord]   = useState(null)
  const [stimulusColour, setStimulusColour] = useState(null)
  const [buttonsEnabled, setButtonsEnabled] = useState(false)
  const [isRunning,      setIsRunning]      = useState(false)

  function logEvent(event) {
    eventLog.current.push(event)
    onTrialLogged?.(event)
  }

  const advanceToNextTrial = useCallback(() => {
    if (trialIndex.current >= schedule.length) {
      setIsRunning(false)
      setStimulusWord(null)
      onBlockComplete(eventLog.current)
      return
    }

    const trial = schedule[trialIndex.current]
    trialIndex.current++

    const onsetTime = performance.now()
    activeTrial.current = { ...trial, onsetTime, responded: false }

    setStimulusWord(trial.word)
    setStimulusColour(trial.inkColour)
    setButtonsEnabled(true)

    // Auto-close after response window
    responseTimer.current = setTimeout(() => {
      if (!activeTrial.current?.responded) {
        logEvent({
          ...activeTrial.current,
          rtms: null,
          buttonClicked: null,
          correct: false,
          errorType: null,
          classification: 'omission',
        })
      }
      setButtonsEnabled(false)
      setStimulusWord(null)

      // ITI then next trial
      setTimeout(advanceToNextTrial, 500)
    }, 2000)
  }, [schedule, onBlockComplete])

     
  const handleButtonClick = useCallback((buttonColour) => {
    if (!activeTrial.current || activeTrial.current.responded) return

    const rt      = performance.now() - activeTrial.current.onsetTime
    const correct = buttonColour === activeTrial.current.inkColour
    const errorType = correct ? null : classifyError(activeTrial.current.inkColour, activeTrial.current.word, buttonColour)

    clearTimeout(responseTimer.current)
    activeTrial.current.responded = true
    setButtonsEnabled(false)

    logEvent({
      ...activeTrial.current,
      rtms: rt,
      buttonClicked: buttonColour,
      correct,
      errorType,
      classification: correct ? 'hit' : 'error',
    })

    setStimulusWord(null)
    setTimeout(advanceToNextTrial, 500)
  }, [advanceToNextTrial])

   
  const start = useCallback(() => {
    trialIndex.current  = 0
    eventLog.current    = []
    activeTrial.current = null
    setIsRunning(true)
    advanceToNextTrial()
  }, [advanceToNextTrial])

  const reset = useCallback(() => {
    clearTimeout(responseTimer.current)
    trialIndex.current  = 0
    eventLog.current    = []
    activeTrial.current = null
    setIsRunning(false)
    setStimulusWord(null)
    setStimulusColour(null)
    setButtonsEnabled(false)
  }, [])

  return {
    stimulusWord,
    stimulusColour,
    buttonsEnabled,
    isRunning,
    start,
    reset,
    handleButtonClick,
  }
}
