import { useState } from 'react'
import { Link } from 'react-router-dom'
import { loadTaskResult } from '../utils/storage.js'
import { exportTaskJSON, exportAllJSON } from '../utils/exportJSON.js'
import { TASK_REGISTRY } from '../config/taskRegistry.js'
import { EventLogTable }    from '../components/researcher/EventLogTable.jsx'
import { TechnicalMetrics } from '../components/researcher/TechnicalMetrics.jsx'
import './ResearcherMode.css'

function TaskSection({ task, data, idx }) {
  const [open, setOpen]     = useState(false)
  const [subTab, setSubTab] = useState('metrics')
  const allData = TASK_REGISTRY.map(t => ({ 
      task: t,
      data: loadTaskResult(t.storageKey),
    }))

  return (
    <section className="rm-task-section">
      <button
        className={`rm-task-toggle${open ? ' rm-task-toggle--open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="rm-task-label">
          Task {idx + 1} — {task.name}
          <span className="rm-task-domain">{task.domain}</span>
        </span>
        <span className="rm-task-meta">
          {data
            ? new Date(data.completedAt).toLocaleString('en-GB')
            : 'Not completed'}
        </span>
        <span className="rm-chevron" aria-hidden="true">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="rm-task-body">
          {!data ? (
            <p className="researcher-empty">No completed result found for this task.</p>
          ) : (
            <>
              <div className="rm-subtabs" role="tablist">
                <button
                  role="tab"
                  aria-selected={subTab === 'metrics'}
                  className={`rm-subtab${subTab === 'metrics' ? ' rm-subtab--active' : ''}`}
                  onClick={() => setSubTab('metrics')}
                >
                  Technical Metrics
                </button>
                <button
                  role="tab"
                  aria-selected={subTab === 'events'}
                  className={`rm-subtab${subTab === 'events' ? ' rm-subtab--active' : ''}`}
                  onClick={() => setSubTab('events')}
                >
                  Event Log ({data.events?.length ?? 0} trials)
                </button>
              </div>

              {subTab === 'metrics' && (
                <TechnicalMetrics
                  taskKey={task.storageKey}
                  overall={data.overall}
                  config={data.config}
                />
              )}
              {subTab === 'events' && (
                <EventLogTable
                  columns={task.columns}
                  events={data.events}
                />
              )}

              <button
                className="rm-export-btn"
                onClick={() => exportTaskJSON(task.storageKey, data)}
              >
                Download {task.name} JSON
              </button>
            </>
          )}
        </div>
      )}
    </section>
  )
}

export function ResearcherMode() {
  const allData    = Object.fromEntries(
    TASK_REGISTRY.map((t) => [t.storageKey, loadTaskResult(t.storageKey)])
  )
  const anyComplete = Object.values(allData).some(Boolean)

  return (
    <div className="researcher-page">
      <header className="rm-header">
        <Link to="/dashboard" className="rm-back-link">← Dashboard</Link>
        <h1>Researcher View</h1>
        <p className="rm-subtitle">
          Raw trial data, technical metrics, and JSON exports for the current session.
          No data is transmitted — all values are read directly from{' '}
          <code>localStorage</code>.
        </p>
      </header>

      <main className="rm-main">
        {TASK_REGISTRY.map((task, idx) => (
          <TaskSection key={task.storageKey} task={task} idx={idx} />
        ))}

        <div className="rm-export-all">
          <button
            className="rm-export-all-btn"
            disabled={!anyComplete}
            onClick={() => exportAllJSON(allData)}
          >
            Export All Tasks as JSON
          </button>
          {!anyComplete && (
            <p className="rm-export-note">Complete at least one task to export.</p>
          )}
        </div>
      </main>
    </div>
  )
}
