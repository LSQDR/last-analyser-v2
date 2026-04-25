import { useState, useEffect, useCallback, useRef } from 'react'
import { generateCPTSchedule } from '../../../utils/generate/generateCPTSchedule.js'
import { computeSessionMetrics } from '../../../utils/compute/computeCPTSessionMetrics.js'
import { saveTaskResult } from '../../../utils/storage.js'
import { useCPTEngine } from '../../../hooks/useCPTEngine.js'
import { CPTCircle } from './CPTCircle.jsx'
import { MiniResult } from '../../../components/shared/MiniResult.jsx'
import { getCPTBand } from '../../../utils/getBandLabels.js'
import './TapThePulse.css'

const PHASES = {
  INSTRUCTIONS: 'instructions',
  PRACTICE:     'practice',
  TRANSITION:   'transition',
  BLOCK:        'block',
  INTER_BLOCK:  'interBlock',
  RESULTS:      'results',
}

export function TapThePulse({ onComplete }) {
  const [phase,        setPhase]        = useState(PHASES.INSTRUCTIONS)
  const [schedule,     setSchedule]     = useState(null)
  const [blockResults, setBlockResults] = useState([])
  const [results,      setResults]      = useState(null)
  const [countdown,    setCountdown]    = useState(null)

  const blockResultsRef  = useRef([])
  const countdownTimer   = useRef(null)
  const blocksStartedRef = useRef(false)   // guard: prevents double-start

  const handleBlockComplete = useCallback((metrics, events, blockIdx) => {
    blockResultsRef.current = [...blockResultsRef.current, { ...metrics, block: blockIdx }]
    setBlockResults([...blockResultsRef.current])

    if (blockIdx < 3) {
      setPhase(PHASES.INTER_BLOCK)
      let secs = 4
      setCountdown(secs)
      countdownTimer.current = setInterval(() => {
        secs--
        if (secs <= 0) {
          clearInterval(countdownTimer.current)
          setCountdown(null)
          setPhase(PHASES.BLOCK)
        } else {
          setCountdown(secs)
        }
      }, 1000)
    }
  }, [])

  const handleAllBlocksComplete = useCallback((allEvents) => {
    const scoredBlocks = blockResultsRef.current
    const overall      = computeSessionMetrics(scoredBlocks, allEvents)
    const payload = {
      task:        'tapThePulse',
      version:     '1.0',
      status:      'complete',
      completedAt: new Date().toISOString(),
      config: { blockDurations: 90, blockCount: 3, targetRatio: 0.25, responseWindowms: 1000, isiRangems: [1000, 2500] },
      overall,
      blocks: scoredBlocks,
      events: allEvents,
    }
    saveTaskResult('tapThePulse', payload)
    setResults(payload)
    setPhase(PHASES.RESULTS)
  }, [])

  const {
    circleState, isRunning, blockIndex, isPaused, slowWarning,
    handleClick, startPractice, startBlocks, cancel,
  } = useCPTEngine(
    schedule || { practice: [], blocks: [[], [], []] },
    handleBlockComplete,
    handleAllBlocksComplete
  )

  useEffect(() => () => { cancel(); clearInterval(countdownTimer.current) }, [cancel])

  // Start practice once schedule is ready
  useEffect(() => {
    if (phase === PHASES.PRACTICE && schedule) {
      startPractice(() => setPhase(PHASES.TRANSITION))
    }
  }, [phase, schedule, startPractice])


  useEffect(() => {
    if (phase === PHASES.BLOCK && schedule && !blocksStartedRef.current) {
      blocksStartedRef.current = true
      saveTaskResult('tapThePulse', { task: 'tapThePulse', version: '1.0', status: 'started', completedAt: null })
      startBlocks()
    }
  }, [phase, schedule, startBlocks])

  function begin() {
    const s = generateCPTSchedule()
    setSchedule(s)
    setPhase(PHASES.PRACTICE)
  }

  function beginBlocks() {
    blockResultsRef.current  = []
    blocksStartedRef.current = false   // reset guard for this session
    setBlockResults([])
    setPhase(PHASES.BLOCK)
  }


  if (phase === PHASES.INSTRUCTIONS) {
    return (
      <div className="cpt-task">
        <h1>Tap the Pulse</h1>
        <p style={{ maxWidth: 480, textAlign: 'center', lineHeight: 1.7, marginBottom: '0.5rem'}}>
          A circle will appear on screen. It will usually be <strong style={{ color: '#3a7bd5' }}>blue</strong>.
          When it turns <strong style={{ color: '#e03c31' }}>red</strong>, click it as fast as you can.
        </p>
        <p style={{ maxWidth: 480, textAlign: 'center', lineHeight: 1.7, color: '#aaa' }}>
          Don't click the blue circle. Try to stay focused. This task measures how well you can sustain your attention over time.
        </p>
        <p style={{ color: '#aaa', fontSize: '0.9rem', marginTop:'1.5rem'}}>You'll start with a practice round.</p>
        <button
          style={{ marginTop: '1.5rem', padding: '0.75rem 2.5rem', background: '#3a7bd5', color: '#fff', border: 'none', borderRadius: 8, fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}
          onClick={begin}
        >
          Start Practice
        </button>
      </div>
    )
  }

  if (phase === PHASES.PRACTICE) {
    return (
      <div className="cpt-task">
        <p className="cpt-block-label">Practice</p>
        <p className="cpt-progress">Click when the circle turns red</p>
        <CPTCircle state={circleState} onClick={handleClick} />
        {slowWarning && <p className={`cpt-slow-warning ${slowWarning ? 'cpt-slow-warning--visible' : ''}`}>
          Try to respond a little faster on red circles</p>}
      </div>
    )
  }

  if (phase === PHASES.TRANSITION) {
    return (
      <div className="cpt-task">
        <h2>Practice complete</h2>
        <p style={{ color: '#aaa', textAlign: 'center', maxWidth: 400, lineHeight: 1.7 }}>
          The scored task is next, 3 rounds of 90 seconds each.
          Click the circle only when it turns <strong style={{ color: '#e03c31' }}>red</strong>.
        </p>
        <button
          style={{ marginTop: '1.5rem', padding: '0.75rem 2.5rem', background: '#3a7bd5', color: '#fff', border: 'none', borderRadius: 8, fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}
          onClick={beginBlocks}
        >
          Begin Task
        </button>
      </div>
    )
  }

  if (phase === PHASES.BLOCK || phase === PHASES.INTER_BLOCK) {
    const latestBlock = blockResultsRef.current[blockResultsRef.current.length - 1]
    return (
      <div className="cpt-task">
        {phase === PHASES.INTER_BLOCK ? (
          <div className="cpt-pause-banner">
            <p className="cpt-block-label">Round {blockIndex} complete</p>
            <p>Next round in {countdown}…</p>
          </div>
        ) : (
          <>
            <p className="cpt-block-label">Round {blockIndex} / 3</p>
            <CPTCircle state={circleState} onClick={handleClick} />
            {slowWarning && <p className={`cpt-slow-warning ${slowWarning ? 'cpt-slow-warning--visible' : ''}`}>Try to respond a little faster</p>}
          </>
        )}
      </div>
    )
  }

if (phase === PHASES.RESULTS && results) {
  const { overall } = results
  const band = getCPTBand(
    overall.omissionRatepct,
    overall.cvpct,
    overall.attentionDecaySlope
  )

  return (
    <MiniResult
      band={band}
      metrics={[
        {
          label:   'Omission Rate',
          value:   `${overall.omissionRatepct?.toFixed(1)}%`,
          flagged: overall.omissionRatepct > 25,
        },
        {
          label:   'Mean RT',
          value:   overall.cleanMeanRTms ? `${Math.round(overall.cleanMeanRTms)}ms` : '—',
          flagged: false,
        },
        {
          label:   'RT Variability',
          value:   `${overall.cvpct?.toFixed(1)}%`,
          flagged: overall.cvpct > 35,
        },
      ]}
      disclaimer="This reflects today's session only. Performance varies with sleep and environment."
      onComplete={() => onComplete?.(results)}
    />
  )
}

  return null
}
