import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadTaskResult, loadSession, saveSession, clearAllResults } from '../utils/storage.js'
import { TASK_REGISTRY, TASK_ORDER } from '../config/taskRegistry.js'
import { DisclaimerBanner } from '../components/shared/DisclaimerBanner.jsx'
import clsx from 'clsx'
import './Home.css'

const TASK_DESCRIPTIONS = {
  tapThePulse:     'A circle flashes on screen, click when it turns red. Measures how well you sustain focus over three timed blocks.',
  signalStop:      'React to a green circle, but freeze when a red ring appears. Tests your ability to cancel a response mid-flight.',
  wordColourClash: 'Identify the ink colour of a word, not what the word says. Measures how well you suppress automatic reading.',
  matchOrPass:     'Does this colour match the one from two steps ago? Tracks how accurately you update and hold information in mind.',
}

export function Home() {
  const navigate = useNavigate()
  const [completedTasks, setCompletedTasks] = useState([])
  const [session, setSession] = useState(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const dialogRef = useRef(null)

  useEffect(() => {
    const completed = TASK_ORDER.filter(k => loadTaskResult(k) !== null)
    setCompletedTasks(completed)
    setSession(loadSession())
  }, [])

  // Focus trap for confirm dialog
  useEffect(() => {
    if (!showConfirm || !dialogRef.current) return
    const dialog = dialogRef.current
    const focusable = dialog.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    first?.focus()
    function onKeyDown(e) {
      if (e.key !== 'Tab') return
      if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last?.focus() } }
      else { if (document.activeElement === last) { e.preventDefault(); first?.focus() } }
    }
    function onEscape(e) { if (e.key === 'Escape') setShowConfirm(false) }
    dialog.addEventListener('keydown', onKeyDown)
    dialog.addEventListener('keydown', onEscape)
    return () => {
      dialog.removeEventListener('keydown', onKeyDown)
      dialog.removeEventListener('keydown', onEscape)
    }
  }, [showConfirm])

  const allDone      = completedTasks.length === 4
  const inProgress   = session?.appState === 'inTask'
  const hasAnyResult = completedTasks.length > 0

  function handleStart() {
    if (inProgress && session) { navigate('/tasks'); return }
    const newSession = {
      createdAt: new Date().toISOString(),
      taskOrder: TASK_ORDER,
      currentTask: TASK_ORDER[0],
      completedTasks: [],
      appState: 'inTask',
    }
    saveSession(newSession)
    navigate('/tasks')
  }

  function handleRetakeAll() {
    clearAllResults()
    const newSession = {
      createdAt: new Date().toISOString(),
      taskOrder: TASK_ORDER,
      currentTask: TASK_ORDER[0],
      completedTasks: [],
      appState: 'inTask',
    }
    saveSession(newSession)
    setShowConfirm(false)
    navigate('/tasks')
  }

  const ctaLabel = inProgress ? 'Continue Assessment' : allDone ? 'Retake Assessment' : 'Begin Assessment'

  return (
    <div className="home-wrapper">
    <main className="home">

      {/* ── Left column ── */}
      <div className="home__left">
        <div className="home__identity">
          <img src="/LAST-Analyser.svg" alt="LAST-Analyser" className="home__wordmark" />
          <p className="home__tagline">
            Four short, evidence-based tasks exploring sustained attention,
            response inhibition, interference control, and working memory.
          </p>
        </div>
        
        <div className="home__actions">
          <button className="home__btn home__btn--primary" onClick={handleStart}>
            {ctaLabel}
          </button>
          {hasAnyResult && (
            <button className="home__btn home__btn--secondary" onClick={() => navigate('/dashboard')}>
              View Results Dashboard
            </button>
          )}
          {hasAnyResult && (
            <button className="home__btn home__btn--ghost" onClick={() => setShowConfirm(true)}>
              Start New Run
            </button>
          )}
        </div>

        
      </div>

      {/* ── Right column task timeline ── */}
      <div className="home__right" aria-label="Assessment overview">
        <ul className="task-timeline">
          {TASK_REGISTRY.map((task, index) => {
            const done      = completedTasks.includes(task.storageKey)
            const isCurrent = session?.currentTask === task.storageKey && inProgress
            const isLocked  = !done && !isCurrent && index > 0 &&
                              !completedTasks.includes(TASK_REGISTRY[index - 1]?.storageKey)

            return (
              <li
                key={task.id}
                className={clsx('timeline-item', {
                  'timeline-item--done':    done,
                  'timeline-item--current': isCurrent,
                  'timeline-item--locked':  isLocked && !done && !isCurrent,
                })}
              >
                {/* Connector line */}
                {index < TASK_REGISTRY.length - 1 && (
                  <span className={clsx('timeline-connector', { 'timeline-connector--done': done })} aria-hidden="true" />
                )}

                {/* Node */}
                <span className="timeline-node" aria-hidden="true">
                  {done ? '✓' : String(index + 1).padStart(2, '0')}
                </span>

                {/* Content */}
                <div className="timeline-content">
                  <div className="timeline-header">
                    <span className="timeline-name">{task.name}</span>
                    <span className="timeline-domain">{task.domain}</span>
                  </div>
                  <p className="timeline-desc">{TASK_DESCRIPTIONS[task.id]}</p>
                </div>
              </li>
            )
          })}
        </ul>
      </div>

    </main>
      <footer className="home__footer">
        <DisclaimerBanner/>
      </footer>

      {/* Start new run confirm dialog */}
      {showConfirm && (
        <div className="confirm-backdrop" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-heading" ref={dialogRef}>
          <div className="confirm-dialog">
            <h3 id="confirm-dialog-heading">Start New Run?</h3>
            <p>Your current results will be cleared and you'll start fresh.</p>
            <div className="dialog-actions">
              <button className="btn-confirm" onClick={handleRetakeAll}>Yes, start new run</button>
              <button className="btn-cancel" onClick={() => setShowConfirm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
  </div>
  )
}