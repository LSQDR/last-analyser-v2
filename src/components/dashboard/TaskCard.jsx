import { useState } from 'react'
import { MetricTable } from './MetricTable.jsx'
import { FlagSection } from './FlagSection.jsx'

export function TaskCard({ task, taskData }) {
  const [isOpen, setIsOpen] = useState(false)
  const ChartComponent = task.ChartComponent
  const SecondaryChart = task.SecondaryChart

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

          {SecondaryChart && (
            <SecondaryChart data={taskData} />
          )}

          <FlagSection flags={taskData.overall.flags} flagFeedback={task.flagFeedback} />
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