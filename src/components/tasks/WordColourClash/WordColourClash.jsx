import { useState, useEffect, useCallback, useRef } from 'react'
import { generateStroopSchedule, PRACTICE_TRIALS } from '../../../utils/generate/generateStroopSchedule.js'
import { computeStroopMetrics, getInterferenceBand } from '../../../utils/compute/computeStroopMetrics.js'
import { getPracticeFeedback } from '../../../utils/classify/classifyStroopResponse.js'
import { saveTaskResult } from '../../../utils/storage.js'
import { useStroopEngine } from '../../../hooks/useStroopEngine.js'
import { StroopStimulus } from './StroopStimulus.jsx'
import { StroopButtons } from './StroopButtons.jsx'
import './WordColourClash.css'

const PHASES = {
  INSTRUCTIONS: 'instructions',
  PRACTICE:     'practice',
  TRANSITION:   'transition',
  SCORED:       'scored',
  RESULTS:      'results',
}

export function WordColourClash({ onComplete }) {
  const [phase,            setPhase]            = useState(PHASES.INSTRUCTIONS)
  const [scoredSchedule,   setScoredSchedule]   = useState(null)
  const [practiceIndex,    setPracticeIndex]     = useState(0)
  const [practiceFeedback, setPracticeFeedback] = useState(null)
  const [trialCount,       setTrialCount]        = useState(0)
  const [results,          setResults]           = useState(null)
  const practiceActive     = useRef(false)

  // --- Practice engine---
  const [practiceStimWord,   setPracticeStimWord]   = useState(null)
  const [practiceStimColour, setPracticeStimColour] = useState(null)
  const [practiceEnabled,    setPracticeEnabled]    = useState(false)
  const practiceTimer = useRef(null)
  const practiceOnset = useRef(null)

  const runPracticeTrial = useCallback((index) => {
    if (index >= PRACTICE_TRIALS.length) {
      setPhase(PHASES.TRANSITION)
      return
    }
    const trial = PRACTICE_TRIALS[index]
    practiceActive.current = true
    practiceOnset.current  = performance.now()
    setPracticeStimWord(trial.word)
    setPracticeStimColour(trial.inkColour)
    setPracticeEnabled(true)
    setPracticeFeedback(null)

    practiceTimer.current = setTimeout(() => {
      if (practiceActive.current) {
        practiceActive.current = false
        setPracticeEnabled(false)
        setPracticeStimWord(null)
        setPracticeFeedback({ icon: '–', message: 'Too slow — try to respond within 2 seconds.', colour: 'yellow' })
        setTimeout(() => runPracticeTrial(index + 1), 1200)
      }
    }, 2000)
  }, [])

  const handlePracticeClick = useCallback((buttonColour) => {
    if (!practiceActive.current) return
    practiceActive.current = false
    clearTimeout(practiceTimer.current)
    setPracticeEnabled(false)
    setPracticeStimWord(null)

    const trial   = PRACTICE_TRIALS[practiceIndex]
    const correct = buttonColour === trial.inkColour
    const errorType = correct ? null : (buttonColour === trial.word.toLowerCase() ? 'wordInterference' : 'randomError')
    const feedback  = getPracticeFeedback(correct, errorType)
    setPracticeFeedback(feedback)

    const nextIndex = practiceIndex + 1
    setPracticeIndex(nextIndex)
    setTimeout(() => runPracticeTrial(nextIndex), 1200)
  }, [practiceIndex, runPracticeTrial])

  // --- Scored engine ---
  const handleScoredComplete = useCallback((events) => {
    const overall  = computeStroopMetrics(events)
    const payload  = {
      task:        'wordColourClash',
      version:     '2.0',
      status:      'complete',
      completedAt: new Date().toISOString(),
      config: {
        congruentTrials:  40,
        incongruentTrials: 40,
        neutralTrials:    10,
        responseWindowms: 2000,
        itims:            500,
      },
      overall,
      events,
    }
    saveTaskResult('wordColourClash', payload)
    setResults(payload)
    setPhase(PHASES.RESULTS)
  }, [])

  const { stimulusWord, stimulusColour, buttonsEnabled, start, handleButtonClick } =
    useStroopEngine(scoredSchedule || [], undefined, handleScoredComplete)

  // Track trial count for progress display
  const handleScoredClick = useCallback((colour) => {
    setTrialCount(c => c + 1)
    handleButtonClick(colour)
  }, [handleButtonClick])

  // --- Phase transitions ---
  function startPractice() {
    setPracticeIndex(0)
    setPhase(PHASES.PRACTICE)
    runPracticeTrial(0)
  }

  function startScored() {
    const schedule = generateStroopSchedule()
    setScoredSchedule(schedule)
    setTrialCount(0)
    setPhase(PHASES.SCORED)
    // start() called via useEffect once schedule is set
  }

  useEffect(() => {
    if (phase === PHASES.SCORED && scoredSchedule) {
      // Write started status for crash recovery
      saveTaskResult('wordColourClash', { task: 'wordColourClash', version: '2.0', status: 'started', completedAt: null })
      start()
    }
  }, [phase, scoredSchedule])

  // Keyboard shortcuts for scored block
  useEffect(() => {
    if (phase !== PHASES.SCORED) return
    const keyMap = { '1': 'red', '2': 'blue', '3': 'green', '4': 'yellow' }
    function onKey(e) {
      const colour = keyMap[e.key]
      if (colour && buttonsEnabled) handleScoredClick(colour)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, buttonsEnabled, handleScoredClick])

  // --- Render phases ---
  if (phase === PHASES.INSTRUCTIONS) {
    return (
      <div className="stroop-task">
        <h1>Word Colour Clash</h1>
        <p style={{ maxWidth: 520, textAlign: 'center', lineHeight: 1.6 }}>
          A word will appear on screen printed in a colour. Your job is to click the button
          matching the <strong>ink colour</strong> — not the word's meaning.
        </p>
        <p style={{ maxWidth: 520, textAlign: 'center', lineHeight: 1.6, color: '#aaa' }}>
          For example, if the word <span style={{ color: '#3a7bd5', fontWeight: 'bold' }}>RED</span> appears in blue,
          click <strong>Blue</strong>.
        </p>
        <p style={{ maxWidth: 520, textAlign: 'center', lineHeight: 1.6, color: '#aaa' }}>
          Respond as quickly and accurately as possible. You have 2 seconds per word.
          Keys 1–4 can also be used (Red, Blue, Green, Yellow).
        </p>
        <p style={{ color: '#aaa', fontSize: '0.9rem' }}>You'll start with 6 practice trials.</p>
        <button className="stroop-btn" style={{ backgroundColor: '#3a7bd5', marginTop: '1.5rem', padding: '0.75rem 2rem' }} onClick={startPractice}>
          Start Practice
        </button>
      </div>
    )
  }

  if (phase === PHASES.PRACTICE) {
    return (
      <div className="stroop-task">
        <p className="stroop-progress">Practice — trial {Math.min(practiceIndex + 1, PRACTICE_TRIALS.length)} of {PRACTICE_TRIALS.length}</p>
        <StroopStimulus word={practiceStimWord} inkColour={practiceStimColour} visible={!!practiceStimWord} />
        <StroopButtons onSelect={handlePracticeClick} enabled={practiceEnabled} />
        {practiceFeedback && (
          <p className={`stroop-practice-feedback stroop-practice-feedback--${practiceFeedback.colour === '#2ecc71' || practiceFeedback.colour === 'green' ? 'correct' : 'error'}`}>
            {practiceFeedback.icon} {practiceFeedback.message}
          </p>
        )}
      </div>
    )
  }

  if (phase === PHASES.TRANSITION) {
    return (
      <div className="stroop-task">
        <h2>Practice complete</h2>
        <p style={{ color: '#aaa', textAlign: 'center' }}>
          The scored block is next — 90 words. No feedback will be shown during this block.
          Keep responding to the <strong>ink colour</strong>.
        </p>
        <button className="stroop-btn" style={{ backgroundColor: '#3a7bd5', marginTop: '1.5rem', padding: '0.75rem 2rem' }} onClick={startScored}>
          Begin Task
        </button>
      </div>
    )
  }

  if (phase === PHASES.SCORED) {
    const total = 90
    const progress = Math.round((trialCount / total) * 100)
    return (
      <div className="stroop-task">
        <p className="stroop-progress">Trial {trialCount} / {total}</p>
        <div style={{ width: 280, height: 4, background: '#333', borderRadius: 2, marginBottom: '2rem' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: '#3a7bd5', borderRadius: 2, transition: 'width 300ms ease' }} />
        </div>
        <StroopStimulus word={stimulusWord} inkColour={stimulusColour} visible={!!stimulusWord} />
        <StroopButtons onSelect={handleScoredClick} enabled={buttonsEnabled} />
      </div>
    )
  }

  if (phase === PHASES.RESULTS && results) {
    const { overall } = results
    const band = getInterferenceBand(overall.trueInterferencems)
    return (
      <div className="stroop-task">
        <h2>Word Colour Clash — Done</h2>
        <div style={{ background: '#16213e', borderRadius: 12, padding: '1.5rem 2rem', marginTop: '1rem', minWidth: 300 }}>
          <p><strong>True Interference:</strong> {Math.round(overall.trueInterferencems)}ms <em style={{ color: '#aaa' }}>({band.label})</em></p>
          <p><strong>Incongruent Accuracy:</strong> {overall.incongruentAccuracypct?.toFixed(1)}%</p>
          <p><strong>Congruent RT:</strong> {Math.round(overall.congruentRTms)}ms</p>
          <p><strong>Incongruent RT:</strong> {Math.round(overall.incongruentRTms)}ms</p>
          {overall.flags.length > 0 && (
            <p style={{ color: '#e03c31', marginTop: '1rem' }}>⚠ {overall.flags.join(', ')}</p>
          )}
        </div>
        <button
          className="stroop-btn"
          style={{ backgroundColor: '#2ecc71', marginTop: '2rem', padding: '0.75rem 2rem', color: '#111' }}
          onClick={() => onComplete?.(results)}
        >
          View Full Results
        </button>
      </div>
    )
  }

  return null
}
