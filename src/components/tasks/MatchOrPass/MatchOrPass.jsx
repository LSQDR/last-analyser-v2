import { useState, useEffect, useRef, useCallback } from 'react'
import { generateFullSchedule, validateSchedule } from '../../../utils/generate/generateNBackSchedule.js'
import { computeNBackMetrics } from '../../../utils/compute/computeNBackMetrics.js'
import { getWarmupFeedback, classifyResponse } from '../../../utils/classify/classifyNBackResponse.js'
import { saveTaskResult } from '../../../utils/storage.js'
import { useNBackEngine } from '../../../hooks/useNBackEngine.js'
import { NBackSquare, NBackGhost } from './NBackSquare.jsx'
import { NBackButtons } from './NBackButtons.jsx'
import './MatchOrPass.css'

const PHASES = {
  INSTRUCTIONS: 'instructions',
  WARMUP:       'warmup',
  TRANSITION:   'transition',
  SCORED:       'scored',
  RESULTS:      'results',
}

export function MatchOrPass({ onComplete }) {
  const [phase,            setPhase]          = useState(PHASES.INSTRUCTIONS)
  const [schedule,         setSchedule]       = useState(null)
  const [trialCount,       setTrialCount]     = useState(0)
  const [warmupFeedback,   setWarmupFeedback] = useState(null)
  const [results,          setResults]        = useState(null)
  const [prevWarmupColour, setPrevWarmupColour] = useState(null)

  // --- Warmup engine ---
  const warmupRef = schedule?.warmup || []
  const handleWarmupFeedback = useCallback((event) => {
    if (!event.classification) return
    const fb = getWarmupFeedback(event.classification)
    setWarmupFeedback(fb)
    setTimeout(() => setWarmupFeedback(null), 900)
  }, [])

  const onWarmupComplete = useCallback(() => {
    setPhase(PHASES.TRANSITION)
  }, [])

  const {
    squareColour:   warmupColour,
    squareVisible:  warmupVisible,
    buttonsEnabled: warmupEnabled,
    currentTrial:   warmupTrial,
    start:          startWarmup,
    handleResponse: warmupResponse,
  } = useNBackEngine(warmupRef, onWarmupComplete)

  // Track previous colour for ghost display
  useEffect(() => {
    if (warmupTrial) setPrevWarmupColour(warmupTrial.nBackColour)
  }, [warmupTrial])

  const handleWarmupResponse = useCallback((responseType) => {
    if (!warmupTrial) return
    const classification = classifyResponse(responseType, warmupTrial.isTarget)
    handleWarmupFeedback({ classification })
    warmupResponse(responseType)
  }, [warmupTrial, warmupResponse, handleWarmupFeedback])

  // --- Scored engine ---
  const onScoredComplete = useCallback((events) => {
    const overall = computeNBackMetrics(events)
    const payload = {
      task:        'matchOrPass',
      version:     '2.0',
      status:      'complete',
      completedAt: new Date().toISOString(),
      config: {
        nBackLevel:        2,
        scoredTrials:      40,
        targetRatio:       0.33,
        stimulusDurationms: 500,
        isims:             2000,
        responseWindowms:  2000,
        colourSet:         ['red', 'blue', 'green', 'yellow'],
      },
      overall,
      events,
      warmupLog: schedule?.warmup || [],
    }
    saveTaskResult('matchOrPass', payload)
    setResults(payload)
    setPhase(PHASES.RESULTS)
  }, [schedule])

  const scoredRef = schedule?.scored || []
  const {
    squareColour:   scoredColour,
    squareVisible:  scoredVisible,
    buttonsEnabled: scoredEnabled,
    start:          startScored,
    handleResponse: scoredResponse,
  } = useNBackEngine(scoredRef, onScoredComplete)

  const handleScoredResponse = useCallback((responseType) => {
    setTrialCount(c => c + 1)
    scoredResponse(responseType)
  }, [scoredResponse])

  // --- Phase transitions ---
  function beginWarmup() {
    const s = generateFullSchedule()
    validateSchedule(s.scored)
    setSchedule(s)
    setPhase(PHASES.WARMUP)
  }

  useEffect(() => {
    if (phase === PHASES.WARMUP && schedule) startWarmup()
  }, [phase, schedule])

  function beginScored() {
    setTrialCount(0)
    saveTaskResult('matchOrPass', { task: 'matchOrPass', version: '2.0', status: 'started', completedAt: null })
    setPhase(PHASES.SCORED)
  }

  useEffect(() => {
    if (phase === PHASES.SCORED && schedule) startScored()
  }, [phase, schedule])

  // Keyboard shortcuts
  useEffect(() => {
    const activePhase = phase === PHASES.WARMUP || phase === PHASES.SCORED
    if (!activePhase) return

    function onKey(e) {
      const response = phase === PHASES.WARMUP ? handleWarmupResponse : handleScoredResponse
      const enabled  = phase === PHASES.WARMUP ? warmupEnabled : scoredEnabled
      if (!enabled) return
      if (e.key === 'm' || e.key === 'M') response('match')
      if (e.key === 'd' || e.key === 'D' || e.key === 'p' || e.key === 'P') response('pass')
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, warmupEnabled, scoredEnabled, handleWarmupResponse, handleScoredResponse])

  // --- Render ---
  if (phase === PHASES.INSTRUCTIONS) {
    return (
      <div className="nback-task">
        <h1>Match or Pass</h1>
        <p style={{ maxWidth: 500, textAlign: 'center', lineHeight: 1.7 }}>
          A coloured square will appear briefly. Your job is to decide whether it matches
          the square from <strong>2 steps back</strong>.
        </p>
        <p style={{ maxWidth: 500, textAlign: 'center', lineHeight: 1.7, color: '#aaa' }}>
          Press <strong>Same</strong> if the colour matches the one 2 trials ago.
          Press <strong>Different</strong> if it doesn't.
          You can also use <strong>M</strong> for Same and <strong>D</strong> for Different.
        </p>
        <p style={{ maxWidth: 500, textAlign: 'center', lineHeight: 1.7, color: '#aaa' }}>
          You'll start with a 1-Back warm-up (match the <em>previous</em> square) to learn the idea,
          then move to the real 2-Back task.
        </p>
        <button
          className="nback-btn nback-btn--match"
          style={{ marginTop: '1.5rem', padding: '0.75rem 2rem' }}
          onClick={beginWarmup}
        >
          Start Warm-Up
        </button>
      </div>
    )
  }

  if (phase === PHASES.WARMUP) {
    const warmupIndex = schedule?.warmup.findIndex(t => t.colour === warmupColour && !t.responded) ?? 0
    return (
      <div className="nback-task" style={{ position: 'relative' }}>
        <p className="nback-n-indicator">WARM-UP — match the square from 1 step back</p>
        <p className="nback-progress">Trial {Math.min(trialCount + 1, 10)} of 10</p>

        {/* Ghost comparator — shows previous colour faded */}
        <NBackGhost colour={prevWarmupColour} />

        <NBackSquare colour={warmupColour} visible={warmupVisible} />
        <NBackButtons onResponse={handleWarmupResponse} enabled={warmupEnabled} />

        {warmupFeedback && (
          <p className={`nback-warmup-feedback nback-warmup-feedback--${warmupFeedback.colour === 'green' ? 'correct' : 'error'}`}>
            {warmupFeedback.icon} {warmupFeedback.text}
          </p>
        )}
      </div>
    )
  }

  if (phase === PHASES.TRANSITION) {
    return (
      <div className="nback-task">
        <h2>Warm-up complete</h2>
        <p style={{ maxWidth: 480, textAlign: 'center', lineHeight: 1.7, color: '#aaa' }}>
          Now the real task begins. Match the square from <strong>2 steps back</strong> — not 1.
          No feedback will be shown during this block.
        </p>
        <p style={{ color: '#aaa', fontSize: '0.9rem' }}>40 trials · about 1 min 40 sec</p>
        <button
          className="nback-btn nback-btn--match"
          style={{ marginTop: '1.5rem', padding: '0.75rem 2rem' }}
          onClick={beginScored}
        >
          Begin 2-Back Task
        </button>
      </div>
    )
  }

  if (phase === PHASES.SCORED) {
    const progress = Math.round((trialCount / 40) * 100)
    return (
      <div className="nback-task">
        <p className="nback-n-indicator">2-BACK — match the square from 2 steps back</p>
        <p className="nback-progress">Trial {trialCount} / 40</p>
        <div style={{ width: 240, height: 4, background: '#333', borderRadius: 2, marginBottom: '1.5rem' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: '#3a7bd5', borderRadius: 2, transition: 'width 300ms ease' }} />
        </div>
        <NBackSquare colour={scoredColour} visible={scoredVisible} />
        <NBackButtons onResponse={handleScoredResponse} enabled={scoredEnabled} />
      </div>
    )
  }

  if (phase === PHASES.RESULTS && results) {
    const { overall } = results
    return (
      <div className="nback-task">
        <h2>Match or Pass — Done</h2>
        <div style={{ background: '#16213e', borderRadius: 12, padding: '1.5rem 2rem', marginTop: '1rem', minWidth: 300 }}>
          <p><strong>Corrected Hit Rate:</strong> {overall.correctedHitRatepct?.toFixed(1)}% <em style={{ color: '#aaa' }}>(threshold: 60%)</em></p>
          <p><strong>Hits:</strong> {overall.hits} / {overall.targets}</p>
          <p><strong>False Alarms:</strong> {overall.falseAlarms} / {overall.nonTargets}</p>
          <p><strong>d′:</strong> {overall.dPrime}</p>
          {overall.flags.length > 0 && (
            <p style={{ color: '#e03c31', marginTop: '1rem' }}>⚠ {overall.flags.join(', ')}</p>
          )}
        </div>
        <button
          className="nback-btn nback-btn--match"
          style={{ marginTop: '2rem', padding: '0.75rem 2rem' }}
          onClick={() => onComplete?.(results)}
        >
          View Full Results
        </button>
      </div>
    )
  }

  return null
}
