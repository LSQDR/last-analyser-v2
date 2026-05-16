import { useState, useEffect, useCallback } from 'react'
import { generateSSTSchedule, generatePracticeSchedule } from '../../../utils/generate/generateSSTSchedule.js'
import { computeSSTMetrics } from '../../../utils/compute/computeSSTMetrics.js'
import { saveTaskResult } from '../../../utils/storage.js'
import { useSSTEngine } from '../../../hooks/useSSTEngine.js'
import { SSTCircle } from './SSTCircle.jsx'
import { MiniResult } from '../../../components/shared/MiniResult.jsx'
import { getSSTBand }  from '../../../utils/getBandLabels.js'
import { TASK_REGISTRY } from '../../../config/taskRegistry.js'
import './SignalStop.css'

const TASK   = TASK_REGISTRY.find((t) => t.id === 'signalStop')
const CONFIG = TASK.config;

const PHASES = {
  INSTRUCTIONS: 'instructions',
  PRACTICE:     'practice',
  TRANSITION:   'transition',
  SCORED:       'scored',
  RESULTS:      'results',
}

export function SignalStop({ onComplete }) {
  const [phase,          setPhase]         = useState(PHASES.INSTRUCTIONS)
  const [schedule,       setSchedule]      = useState(null)
  const [practiceSchedule, setPracticeSchedule] = useState(null)
  const [results,        setResults]       = useState(null)

  // --- Practice engine (Go-only — no stop signals during practice) ---
  const onPracticeComplete = useCallback(() => setPhase(PHASES.TRANSITION), [])

  const {
    goVisible:    practiceGoVisible,
    slowWarning:  practiceSlowWarning,
    trialCount:   practiceTrialCount,
    handleClick:  practiceClick,
    start:        startPracticeEngine,
    cancel:       cancelPractice,
  } = useSSTEngine(practiceSchedule || [], onPracticeComplete)

  // --- Scored engine ---
  const onScoredComplete = useCallback((trials, staircase) => {
    const overall  = computeSSTMetrics(trials, staircase)
    const payload  = {
      task:        'signalStop',
      version:     '1.0',
      status:      'complete',
      completedAt: new Date().toISOString(),
      config: CONFIG,
      overall,
      events: trials,
    }
    saveTaskResult('signalStop', payload)
    setResults(payload)
    setPhase(PHASES.RESULTS)
  }, [])

  const {
    goVisible,
    stopVisible,
    slowWarning,
    trialCount,
    handleClick,
    start:  startScoredEngine,
    cancel: cancelScored,
  } = useSSTEngine(schedule || [], onScoredComplete)

  // Cleanup on unmount
  useEffect(() => () => { cancelPractice(); cancelScored() }, [cancelPractice, cancelScored])

  // --- Phase transitions ---
  function begin() {
    const p = generatePracticeSchedule(CONFIG)
    setPracticeSchedule(p)
    setPhase(PHASES.PRACTICE)
  }

  useEffect(() => {
    if (phase === PHASES.PRACTICE && practiceSchedule) startPracticeEngine()
  }, [phase, practiceSchedule])

  function startScored() {
    const s = generateSSTSchedule(CONFIG)
    setSchedule(s)
    saveTaskResult('signalStop', { task: 'signalStop', version: '1.0', status: 'started', completedAt: null })
    setPhase(PHASES.SCORED)
  }

  useEffect(() => {
    if (phase === PHASES.SCORED && schedule) startScoredEngine()
  }, [phase, schedule])

  // --- Render ---
  if (phase === PHASES.INSTRUCTIONS) {
    return (
      <main className="sst-task">
        <span className="sst-instruction-label">Task 2 of 4 · Inhibition Control</span>
        <h1 className="sst-instruction-title">Signal Stop</h1>

        <div className="sst-instruction-demo" aria-hidden="true">
          <div className="sst-demo-item">
            <div className="sst-go-circle sst-go-circle--visible" />
            <span className="sst-demo-label sst-demo-label--go">Go</span>
          </div>
          <span className="sst-demo-arrow">→</span>
          <div className="sst-demo-item">
            <div className="sst-go-circle sst-go-circle--visible">
              <div className="sst-stop-ring" />
            </div>
            <span className="sst-demo-label sst-demo-label--stop">Stop</span>
          </div>
        </div>

        <p className="sst-instructions-body">
          A <strong style={{ color: 'var(--green)' }}>green circle</strong> will appear
          on screen, click it as fast as you can. Most trials are simple Go trials.
          On some trials, a <strong style={{ color: 'var(--red)' }}>red ring</strong>{' '}
          will appear at the last moment; when that happens, stop yourself and do not
          click. The aim is to respond quickly without slowing down to wait for a stop signal.
        </p>

        <button className="btn" onClick={begin}>
          Start Practice
        </button>
      </main>
    )
  }

  if (phase === PHASES.PRACTICE) {
    return (
      <main className="sst-task">
        <p style={{ fontWeight: 600, color: '#888', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '1rem' }}>
          Practice — Go Only
        </p>
        <p className="sst-progress">Trial {practiceTrialCount} / 10</p>
        <SSTCircle goVisible={practiceGoVisible} stopVisible={false} onClick={practiceClick} />
      </main>
    )
  }

  if (phase === PHASES.TRANSITION) {
    return (
      <main className="sst-task">
        <span className="sst-instruction-label">Practice Complete</span>
        <h2 className="sst-instruction-title">Ready for the real task?</h2>
        <p className="sst-instructions-body">
          The scored task is next with 128 trials. Stop signals will now appear on
          some trials. Keep responding as fast as possible on every Go trial.
        </p>
        <p className="sst-instruction-hint">About 3 minutes</p>
        <button className="btn" onClick={startScored}>Begin Task</button>
      </main>
    )
  }

  if (phase === PHASES.SCORED) {
    const progress = Math.round((trialCount / 128) * 100)
    return (
      <main className="sst-task">
        <p className="sst-progress">Trial {trialCount} / 128</p>
        <div style={{ width: 260, height: 4, background: '#333', borderRadius: 2, marginBottom: '2rem' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: '#2ecc71', borderRadius: 2, transition: 'width 200ms ease' }} />
        </div>
        <SSTCircle goVisible={goVisible} stopVisible={stopVisible} onClick={handleClick} />
      </main>
    )
  }

  if (phase === PHASES.RESULTS && results) {
    const { overall } = results
    const band = getSSTBand(overall.SSRTms, overall.SSRTisValid, overall.stopAccuracypct)

    return (
      <MiniResult
        band={band}
        metrics={[
          {
            label:   'SSRT',
            value:   overall.SSRTisValid ? `${Math.round(overall.SSRTms)}ms` : 'Invalid',
            flagged: overall.SSRTms > 300 && overall.SSRTisValid,
          },
          {
            label:   'Stop Accuracy',
            value:   `${overall.stopAccuracypct?.toFixed(1)}%`,
            flagged: overall.stopAccuracypct < 50,
          },
          {
            label:   'Go RT',
            value:   `${Math.round(overall.goRTms)}ms`,
            flagged: false,
          },
        ]}
        disclaimer="This reflects today's session only. Performance varies with sleep and environment."
        onComplete={() => onComplete?.(results)}
      />
    )
  }

  return null
}
