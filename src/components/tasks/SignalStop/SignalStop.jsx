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
      trials,
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
      <div className="sst-task">
        <h1>Signal Stop</h1>
        <p style={{ maxWidth: 500, textAlign: 'center', lineHeight: 1.7 }}>
          A <strong style={{ color: '#2ecc71' }}>green circle</strong> will appear.
          Click it as fast as you can — but if a <strong style={{ color: '#e03c31' }}>red ring</strong> appears around it,
          stop yourself and <strong>don't click</strong>.
        </p>
        <p style={{ maxWidth: 500, textAlign: 'center', lineHeight: 1.7, color: '#aaa' }}>
          The stop signal won't appear on every trial — most will be Go trials.
          It's important to respond quickly on Go trials; don't slow down to wait for the ring.
        </p>
        <p style={{ color: '#aaa', fontSize: '0.9rem' }}>You'll start with 10 Go-only practice trials.</p>
        <button className='btn' onClick={begin}>
          Start Practice
        </button>
      </div>
    )
  }

  if (phase === PHASES.PRACTICE) {
    return (
      <div className="sst-task">
        <p style={{ fontWeight: 600, color: '#888', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '1rem' }}>
          Practice — Go Only
        </p>
        <p className="sst-progress">Trial {practiceTrialCount} / 10</p>
        <SSTCircle goVisible={practiceGoVisible} stopVisible={false} onClick={practiceClick} />
      </div>
    )
  }

  if (phase === PHASES.TRANSITION) {
    return (
      <div className="sst-task">
        <h2>Practice complete</h2>
        <p style={{ maxWidth: 480, textAlign: 'center', lineHeight: 1.7, color: '#aaa' }}>
          The scored task is next — 128 trials. Stop signals will now appear on some trials.
          Keep responding as fast as possible on Go trials.
        </p>
        <p style={{ color: '#aaa', fontSize: '0.9rem' }}>About 3 minutes</p>
        <button className='btn'onClick={startScored}>Begin Task</button>
      </div>
    )
  }

  if (phase === PHASES.SCORED) {
    const progress = Math.round((trialCount / 128) * 100)
    return (
      <div className="sst-task">
        <p className="sst-progress">Trial {trialCount} / 128</p>
        <div style={{ width: 260, height: 4, background: '#333', borderRadius: 2, marginBottom: '2rem' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: '#2ecc71', borderRadius: 2, transition: 'width 200ms ease' }} />
        </div>
        <SSTCircle goVisible={goVisible} stopVisible={stopVisible} onClick={handleClick} />
      </div>
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
