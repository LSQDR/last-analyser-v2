import { useState, useEffect, useCallback, useRef } from 'react'
import { generateStroopSchedule, PRACTICE_TRIALS } from '../../../utils/generate/generateStroopSchedule.js'
import { computeStroopMetrics} from '../../../utils/compute/computeStroopMetrics.js'
import { getPracticeFeedback } from '../../../utils/classify/classifyStroopResponse.js'
import { saveTaskResult } from '../../../utils/storage.js'
import { useStroopEngine } from '../../../hooks/useStroopEngine.js'
import { StroopStimulus } from './StroopStimulus.jsx'
import { StroopButtons } from './StroopButtons.jsx'
import { MiniResult } from '../../../components/shared/MiniResult.jsx'
import { getStroopBand } from '../../../utils/getBandLabels.js'
import { TASK_REGISTRY } from '../../../config/taskRegistry.js'
import './WordColourClash.css'

const TASK   = TASK_REGISTRY.find((t) => t.id === 'wordColourClash')
const CONFIG = TASK.config
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
      version:     '1.0',
      status:      'complete',
      completedAt: new Date().toISOString(),
      config: CONFIG,
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
    const schedule = generateStroopSchedule(CONFIG)
    setScoredSchedule(schedule)
    setTrialCount(0)
    setPhase(PHASES.SCORED)
    // start() called via useEffect once schedule is set
  }

  useEffect(() => {
    if (phase === PHASES.SCORED && scoredSchedule) {
      // Write started status for crash recovery
      saveTaskResult('wordColourClash', { task: 'wordColourClash', version: '1.0', status: 'started', completedAt: null })
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
      <main className="stroop-task">
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
      </main>
    )
  }

  if (phase === PHASES.PRACTICE) {
    return (
      <main className="stroop-task">
        <p className="stroop-progress">Practice — trial {Math.min(practiceIndex + 1, PRACTICE_TRIALS.length)} of {PRACTICE_TRIALS.length}</p>
        <StroopStimulus word={practiceStimWord} inkColour={practiceStimColour} visible={!!practiceStimWord} />
        <StroopButtons onSelect={handlePracticeClick} enabled={practiceEnabled} />
        {practiceFeedback && (
          <p className={`stroop-practice-feedback stroop-practice-feedback--${practiceFeedback.colour === '#2ecc71' || practiceFeedback.colour === 'green' ? 'correct' : 'error'}`}>
            {practiceFeedback.icon} {practiceFeedback.message}
          </p>
        )}
      </main>
    )
  }

  if (phase === PHASES.TRANSITION) {
    return (
      <main className="stroop-task">
        <h2>Practice complete</h2>
        <p style={{ color: '#aaa', textAlign: 'center' }}>
          The scored block is next — 90 words. No feedback will be shown during this block.
          Keep responding to the <strong>ink colour</strong>.
        </p>
        <button className="stroop-btn" style={{ backgroundColor: '#3a7bd5', marginTop: '1.5rem', padding: '0.75rem 2rem' }} onClick={startScored}>
          Begin Task
        </button>
      </main>
    )
  }

  if (phase === PHASES.SCORED) {
    const total = 90
    const progress = Math.round((trialCount / total) * 100)
    return (
      <main className="stroop-task">
        <p className="stroop-progress">Trial {trialCount} / {total}</p>
        <div style={{ width: 280, height: 4, background: '#333', borderRadius: 2, marginBottom: '2rem' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: '#3a7bd5', borderRadius: 2, transition: 'width 300ms ease' }} />
        </div>
        <StroopStimulus word={stimulusWord} inkColour={stimulusColour} visible={!!stimulusWord} />
        <StroopButtons onSelect={handleScoredClick} enabled={buttonsEnabled} />
      </main>
    )
  }

  if (phase === PHASES.RESULTS && results) {
    const { overall } = results
   const band = getStroopBand(results.trueInterferencems)
    return (
      <MiniResult 
      band={band}
        metrics={[
          { 
            label: 'Interference',  
            value: `${Math.round(results.trueInterferencems)}ms`, 
            flagged: results.trueInterferencems > 150 
          },
          { 
            label: 'Incong. Acc.',  
            value: `${results.incongruentAccuracypct?.toFixed(1)}%`, 
            flagged: results.incongruentAccuracypct < 75 
          },
          { 
            label: 'Facilitation',  
            value: `${Math.round(results.facilitationms)}ms`, 
            flagged: false 
          },
        ]}
        disclaimer="This reflects today's session only. Performance varies with sleep and environment."
        onComplete={() => onComplete?.(results)}
      />
    )
  }

  return null
}
