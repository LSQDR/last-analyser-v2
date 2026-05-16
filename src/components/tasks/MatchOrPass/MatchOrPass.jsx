import { useState, useEffect, useCallback } from 'react'
import { generateFullSchedule, validateSchedule } from '../../../utils/generate/generateNBackSchedule.js'
import { computeNBackMetrics } from '../../../utils/compute/computeNBackMetrics.js'
import { getWarmupFeedback, classifyResponse } from '../../../utils/classify/classifyNBackResponse.js'
import { saveTaskResult } from '../../../utils/storage.js'
import { useNBackEngine } from '../../../hooks/useNBackEngine.js'
import { NBackSquare, NBackGhost } from './NBackSquare.jsx'
import { NBackButtons } from './NBackButtons.jsx'
import { MiniResult } from '../../shared/MiniResult.jsx'
import { getNBackBand } from '../../../utils/getBandLabels.js'
import { TASK_REGISTRY } from '../../../config/taskRegistry.js'
import { BAND_COLOURS } from '../../../utils/bandColours.js'
import './MatchOrPass.css'

const TASK   = TASK_REGISTRY.find((t) => t.id === 'matchOrPass')
const CONFIG = TASK.config

const PHASES = {
  INSTRUCTIONS: 'instructions',
  WARMUP:       'warmup',
  TRANSITION:   'transition',
  SCORED:       'scored',
  RESULTS:      'results',
}

export function MatchOrPass({ onComplete }) {
  const [phase,            setPhase]            = useState(PHASES.INSTRUCTIONS)
  const [schedule,         setSchedule]         = useState(null)
  const [trialCount,       setTrialCount]       = useState(0)
  const [warmupFeedback,   setWarmupFeedback]   = useState(null)
  const [results,          setResults]          = useState(null)
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
      version:     '1.0',
      status:      'complete',
      completedAt: new Date().toISOString(),
      config:      CONFIG,
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
    const s = generateFullSchedule(CONFIG)
    validateSchedule(s.scored)
    setSchedule(s)
    setPhase(PHASES.WARMUP)
  }

  useEffect(() => {
    if (phase === PHASES.WARMUP && schedule) startWarmup()
  }, [phase, schedule])

  function beginScored() {
    setTrialCount(0)
    saveTaskResult('matchOrPass', { task: 'matchOrPass', version: '1.0', status: 'started', completedAt: null })
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
      <main className="nback-task">
        <span className="nback-instruction-label">Task 4 of 4 · Working Memory</span>
        <h1 className="nback-instruction-title">Match or Pass</h1>

        {/* Sequence diagram */}
        <div className="nback-diagram" aria-hidden="true">
          <div className="nback-diagram-squares">
            <div className="nback-diagram-item">
              <div className="nback-diagram-square" style={{ background: 'var(--blue)' }} />
              <span className="nback-diagram-label">2 ago</span>
            </div>
            <div className="nback-diagram-arrow">→</div>
            <div className="nback-diagram-item">
              <div className="nback-diagram-square" style={{ background: 'var(--red)' }} />
              <span className="nback-diagram-label">1 ago</span>
            </div>
            <div className="nback-diagram-arrow">→</div>
            <div className="nback-diagram-item">
              <div className="nback-diagram-square nback-diagram-square--current" style={{ background: 'var(--blue)' }} />
              <span className="nback-diagram-label">Now</span>
            </div>
          </div>
          <div className="nback-diagram-bracket">
            <span className="nback-diagram-bracket-line" />
            <span className="nback-diagram-bracket-text">Match ✓</span>
          </div>
        </div>

        <p className="nback-instructions-body">
          A coloured square will flash on screen. After each one, decide whether
          its colour matches the one from <strong>2 squares ago</strong> not
          the one you just saw, but the one before that. Press{' '}
          <strong>Same</strong> if it is the same, <strong>Different</strong> if it is not.
        </p>

        <p className="nback-instructions-muted">
          Keys: <strong>M</strong> = Match, <strong>D</strong> = Pass.
          You'll start with a 1-Back warm-up to learn the rhythm first.
        </p>

        <button className="nback-start-btn" onClick={beginWarmup}>
          Start Warm-up
        </button>
      </main>
    )
  }

  if (phase === PHASES.WARMUP) {
    const isInTwoBackWarmup = warmupTrial?.warmupPhase === '2back'
    const warmupTotal       = isInTwoBackWarmup ? 6 : 10

    return (
      <div className="nback-task" style={{ position: 'relative' }}>
        <p className="nback-n-indicator">
          {isInTwoBackWarmup
            ? 'WARM-UP 2-BACK — does this match 2 steps ago?'
            : 'WARM-UP 1-BACK — does this match the one you just saw?'
          }
        </p>
        <p className="nback-progress">
          Trial {Math.min((warmupTrial?.id ?? 0) % warmupTotal + 1, warmupTotal)} of {warmupTotal}
        </p>

        {!isInTwoBackWarmup && <NBackGhost colour={prevWarmupColour} />}

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
        <p style={{ maxWidth: 480, textAlign: 'center', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          Now the real task begins. Instead of matching the square you <em>just</em> saw,
          you need to match the one from <strong>2 squares ago</strong> — skipping one in between.
        </p>

        <div className="nback-diagram" aria-label="Reminder: compare current square to the one 2 steps back, not 1">
          <div className="nback-diagram-squares">
            <div className="nback-diagram-item">
              <div className="nback-diagram-square" style={{ backgroundColor: BAND_COLOURS.green.hex }} />
              <span className="nback-diagram-label">1 ← compare to this</span>
            </div>
            <div className="nback-diagram-arrow" aria-hidden="true">→</div>
            <div className="nback-diagram-item">
              <div className="nback-diagram-square" style={{ backgroundColor: BAND_COLOURS.yellow.hex }} />
              <span className="nback-diagram-label">2 (skip)</span>
            </div>
            <div className="nback-diagram-arrow" aria-hidden="true">→</div>
            <div className="nback-diagram-item">
              <div className="nback-diagram-square nback-diagram-square--current" style={{ backgroundColor: BAND_COLOURS.green.hex }} />
              <span className="nback-diagram-label">3 ← you are here</span>
            </div>
          </div>
          <div className="nback-diagram-bracket" aria-hidden="true">
            <span className="nback-diagram-bracket-line" />
            <span className="nback-diagram-bracket-text">Same!</span>
          </div>
        </div>

        <p style={{ maxWidth: 440, textAlign: 'center', color: '#777', fontSize: '0.85rem', marginTop: '0.5rem' }}>
          If you lose track at any point, make your best guess and keep going —
          a moment of confusion doesn't ruin your result.
        </p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
          40 trials · about 1 min 40 sec · no feedback shown
        </p>
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
        <p className="nback-n-indicator">
          Does this match the colour from <strong>2 squares ago?</strong>
        </p>
        <p className="nback-n-indicator nback-n-indicator--sub">
          Lost track? Just guess and continue.
        </p>
        <p className="nback-progress">Trial {trialCount} / 40</p>

        <div style={{ width: 240, height: 4, background: '#333', borderRadius: 2, marginBottom: '1.5rem' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: '#3a7bd5', borderRadius: 2, transition: 'width 300ms ease' }} />
        </div>

        <div className="nback-memory-slots" aria-hidden="true">
          <div className="nback-memory-slot">
            <span className="nback-memory-slot-number">N-2</span>
            <span className="nback-memory-slot-label">compare to this</span>
          </div>
          <div className="nback-memory-slot nback-memory-slot--recent">
            <span className="nback-memory-slot-number">N-1</span>
            <span className="nback-memory-slot-label">skip</span>
          </div>
        </div>

        <NBackSquare colour={scoredColour} visible={scoredVisible} />
        <NBackButtons onResponse={handleScoredResponse} enabled={scoredEnabled} />
      </div>
    )
  }

  if (phase === PHASES.RESULTS && results) {
    const { overall } = results
    const band = getNBackBand(overall.correctedHitRatepct)
    return (
      <MiniResult
        band={band}
        metrics={[
          { label: 'Corrected Hits', value: `${overall.correctedHitRatepct?.toFixed(1)}%`, flagged: overall.correctedHitRatepct < 60 },
          { label: 'd′',             value: overall.dPrime?.toFixed(2) ?? '—',              flagged: false },
          { label: 'False Alarms',   value: `${overall.falseAlarmRatepct?.toFixed(1)}%`,    flagged: false },
        ]}
        disclaimer="This reflects today's session only. Performance varies with sleep and environment."
        onComplete={() => onComplete?.(results)}
      />
    )
  }

  return null
}