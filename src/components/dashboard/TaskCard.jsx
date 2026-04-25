import { useState } from 'react'
import { MetricTable }   from './MetricTable.jsx'
import { FlagSection }   from './FlagSection.jsx'

export function TaskCard({ taskKey, taskData, meta }) {

  function handleRetakeConfirm() {
    retakeSingleTask(taskKey)
    window.location.reload()
  }

  return (
    <section id={meta.id} className="task-card" aria-labelledby={`${taskKey}-heading`}>
      <div className="task-card-header">
        <h3 id={`${taskKey}-heading`}>{meta.name}</h3>
        <span className="task-card-domain">{meta.domain}</span>
      </div>

      {taskData.overall.flags.length > 0 && (
        <div className="task-flag-banner" role="alert">
          {taskData.overall.flags.length} flag{taskData.overall.flags.length > 1 ? 's' : ''} raised
        </div>
      )}

      <MetricTable metrics={meta.metrics(taskData.overall)} />
      <meta.ChartComponent data={taskData} />
      <FlagSection flags={taskData.overall.flags} meta={meta} />
      
    </section>
  )
}

export function TaskCardPlaceholder({ taskName }) {
  return (
    <section className="task-card task-card--placeholder">
      <p className="placeholder-label">Not yet attempted</p>
      <p className="placeholder-name">{taskName}</p>
    </section>
  )
}
