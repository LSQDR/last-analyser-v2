import { useState, useEffect, useRef } from 'react'
import { MetricTable } from './MetricTable.jsx'
import { FlagSection } from './FlagSection.jsx'

export function TaskCard({ task, taskData }) {
  const [isOpen, setIsOpen] = useState(false)
  const [showRetake, setShowRetake] = useState(false)
  const ChartComponent = task.ChartComponent
  const dialogRef = useRef(null)

  // Focus trap
  useEffect(() => {
    if (!showRetake || !dialogRef.current) return
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
    function onEscape(e) { if (e.key === 'Escape') setShowRetake(false) }
    dialog.addEventListener('keydown', onKeyDown)
    dialog.addEventListener('keydown', onEscape)
    return () => {
      dialog.removeEventListener('keydown', onKeyDown)
      dialog.removeEventListener('keydown', onEscape)
    }
  }, [showRetake])

  function handleRetakeConfirm() {
    localStorage.removeItem(task.storageKey)
    window.location.reload()
  }

  const flagCount = taskData.overall.flags.length
  const stepIndex = ['tapThePulse','signalStop','wordColourClash','matchOrPass'].indexOf(task.id) + 1

  return (
    <section id={task.id} className="task-card" aria-labelledby={`${task.id}-heading`}>

      {/* Accordion toggle */}
      <button
        className="task-card__toggle"
        onClick={() => setIsOpen(o => !o)}
        aria-expanded={isOpen}
        aria-controls={`${task.id}-body`}
      >
        <div className="task-card__toggle-left">
          <span className="task-card__step">0{stepIndex}</span>
          <h3 id={`${task.id}-heading`} className="task-card__name">{task.name}</h3>
        </div>
        <div className="task-card__toggle-right">
          <span className="task-card-domain-chip">{task.domain}</span>
          {flagCount > 0 && (
            <span className="task-card__flag-badge">
              ⚑ {flagCount} {flagCount !== 1 ? 'flags' : 'flag'}
            </span>
          )}
          <span className={`task-card__chevron${isOpen ? ' task-card__chevron--open' : ''}`} aria-hidden="true">▼</span>
        </div>
      </button>

      {/* Accordion body */}
      {isOpen && (
        <div id={`${task.id}-body`} className="task-card__body">
          {flagCount > 0 && (
            <div className="task-flag-banner" role="alert">
              <span className="task-flag-banner__icon" aria-hidden="true">⚑</span>
              <span className="task-flag-banner__count">{flagCount}</span>
              <span className="task-flag-banner__label">
                {flagCount !== 1 ? 'flags raised' : 'flag raised'}
              </span>
            </div>
          )}

          <MetricTable metrics={task.getMetrics(taskData.overall)} />

          <figure className="task-chart-figure">
            <figcaption className="task-chart-caption">{task.name} results</figcaption>
            <ChartComponent data={taskData} />
          </figure>

          <FlagSection flags={taskData.overall.flags} flagFeedback={task.flagFeedback} />

          <div className="task-card-footer">
            <button className="retake-btn" onClick={() => setShowRetake(true)}>
              Retake this task
            </button>
          </div>
        </div>
      )}

      {/* Retake dialog  */}
      {showRetake && (
        <div className="retake-backdrop" role="dialog" aria-modal="true" aria-labelledby="retake-dialog-heading" ref={dialogRef}>
          <div className="retake-dialog">
            <h3 id="retake-dialog-heading">Retake {task.name}?</h3>
            <p>Your current result will be cleared and you'll start fresh.</p>
            <div className="dialog-actions">
              <button className="btn-confirm" onClick={handleRetakeConfirm}>Yes, retake</button>
              <button className="btn-cancel" onClick={() => setShowRetake(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export function TaskCardPlaceholder({ task }) {
  const stepIndex = ['tapThePulse','signalStop','wordColourClash','matchOrPass'].indexOf(task.id) + 1
  return (
    <section className="task-card task-card--placeholder">
      <div className="task-card__toggle" style={{ pointerEvents: 'none' }}>
        <div className="task-card__toggle-left">
          <span className="task-card__step">0{stepIndex}</span>
          <span className="placeholder-name">{task.name}</span>
        </div>
        <span className="task-card-domain-chip task-card-domain-chip--pending">{task.domain}</span>
      </div>
    </section>
  )
}