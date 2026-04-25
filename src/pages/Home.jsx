import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadTaskResult, loadSession, saveSession, clearAllResults, TASK_KEYS } from '../utils/storage.js'
import clsx from 'clsx'
import './Home.css'

const TASK_META = [
  { key: 'tapThePulse',    label: 'Tap the Pulse',     domain: 'Sustained Attention'  },
  { key: 'signalStop',     label: 'Signal Stop',        domain: 'Inhibition Control'   },
  { key: 'wordColourClash',label: 'Word Colour Clash',  domain: 'Interference Control' },
  { key: 'matchOrPass',    label: 'Match or Pass',      domain: 'Working Memory'       },
]

const TASK_ORDER = TASK_META.map(t => t.key)

export function Home() {
  const navigate  = useNavigate()
  const [completedTasks, setCompletedTasks] = useState([])
  const [session,        setSession]        = useState(null)

  useEffect(() => {
    const completed = TASK_ORDER.filter(k => loadTaskResult(k) !== null)
    setCompletedTasks(completed)
    setSession(loadSession())
  }, [])

  const allDone      = completedTasks.length === 4
  const inProgress   = session?.appState === 'inTask'
  const hasAnyResult = completedTasks.length > 0

  function handleStart() {
    // Resume existing session or create a new one
    if (inProgress && session) {
      navigate('/tasks')
      return
    }
    const newSession = {
      createdAt:      new Date().toISOString(),
      taskOrder:      TASK_ORDER,
      currentTask:    TASK_ORDER[0],
      completedTasks: [],
      appState:       'inTask',
    }
    saveSession(newSession)
    navigate('/tasks')
  }

  function handleRetakeAll() {
    clearAllResults()
    const newSession = {
      createdAt:      new Date().toISOString(),
      taskOrder:      TASK_ORDER,
      currentTask:    TASK_ORDER[0],
      completedTasks: [],
      appState:       'inTask',
    }
    saveSession(newSession)
    navigate('/tasks')
  }

  const taskElements = TASK_META.map((task, i) => {
    const done = completedTasks.includes(task.key)
    const isCurrent = session?.currentTask === task.key && inProgress

    const TaskItemClass = clsx('task-item', 
      {
          'task-item-current': isCurrent,
          'task-item-done': done,
        })

    return (
      <div key={task.key} className={TaskItemClass}>
        <span> {done ? '✓' : isCurrent ? '▶' : '○'} </span>
        <div>
          <p className={clsx('task-item-label', { 'task-item-label--done': done,'task-item-label-current': isCurrent,})}>
            {task.label}
          </p>
          <p className="task-item-domain">{task.domain}</p>
        </div>
      </div>
    )
  })

  return (
    <main>

      <h1>LAST-Analyser</h1>
      <p>
        ADHD Task Performance Analyzer is an interactive web application that lets you explore your 
        cognitive patterns through four short, evidence-based mini-games. Covering sustained attention, 
        interference control, response inhibition, and working memory. Each task captures real behavioural data such as reaction times, 
        error rates, and accuracy, which are then compared against published neuropsychological 
        research benchmarks to give you meaningful, personalised insights. This tool is designed for educational self-reflection only 
        and is not a diagnostic or clinical assessment.
      </p>

      <div role="alert" aria-live="polite"  className='disclaimer-cont'>
        <strong>Important:</strong> 
        This tool is for educational self-reflection only and does not constitute a clinical or diagnostic assessment. 
        Results should not be used to self-diagnose or replace professional evaluation.
      </div>

      <div className='task-list'>
        {taskElements}
      </div>

      {/* Action buttons */}
      <div className='button-section'>
        {!allDone && (
          <button className='start-btn' onClick={handleStart}>
            {inProgress ? '▶ Continue Task' : completedTasks.length > 0 ? 'Continue' : 'Start'}
          </button>
        )}

        {hasAnyResult && (
          <button className='results-btn'onClick={() => navigate('/dashboard')}>
            View Results Dashboard
          </button>
        )}

        {hasAnyResult && (
          <button className='retake-btn'onClick={handleRetakeAll}>
            Start New Run
          </button>
        )}
      </div>
    </main>
  )
}
