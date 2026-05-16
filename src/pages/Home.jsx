import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadTaskResult, loadSession, saveSession, clearAllResults } from '../utils/storage.js'
import { TASK_REGISTRY, TASK_ORDER } from '../config/taskRegistry.js'
import clsx from 'clsx'
import './Home.css'

const TASK_DESCRIPTIONS = {
  tapThePulse:     'A circle flashes on screen — click when it turns red. Measures how well you sustain focus over three timed blocks.',
  signalStop:      'React to a green circle, but freeze when a red ring appears. Tests your ability to cancel a response mid-flight.',
  wordColourClash: 'Identify the ink colour of a word, not what the word says. Measures how well you suppress automatic reading.',
  matchOrPass:     'Does this colour match the one from two steps ago? Tracks how accurately you update and hold information in mind.',
}

export function Home() {
  const navigate = useNavigate()
  const [completedTasks, setCompletedTasks] = useState([])
  const [session, setSession] = useState(null)

  useEffect(() => {
    const completed = TASK_ORDER.filter(k => loadTaskResult(k) !== null)
    setCompletedTasks(completed)
    setSession(loadSession())
  }, [])

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
            <button className="home__btn home__btn--ghost" onClick={handleRetakeAll}>
              Start New Run
            </button>
          )}
        </div>

        
      </div>

      {/* ── Right column — task timeline ── */}
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
        <p className="home__disclaimer">
          <strong>Educational use only.</strong> This tool is for self-reflection and does
          not constitute a clinical or diagnostic assessment. Results should not be used
          to self-diagnose or replace professional evaluation.
        </p>
      </footer>
  </div>
  )
}