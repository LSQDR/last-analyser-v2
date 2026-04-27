import { useState } from 'react'
import { Link } from 'react-router-dom'
import { loadTaskResult } from '../utils/storage.js'
import { exportTaskJSON, exportAllJSON } from '../utils/exportJSON.js'
import { EventLogTable }    from '../components/researcher/EventLogTable.jsx'
import { TechnicalMetrics } from '../components/researcher/TechnicalMetrics.jsx'
import './ResearcherMode.css'

const TASKS = [
  { key: 'tapThePulse',    label: 'Task 1 — Tap the Pulse',     domain: 'Sustained Attention'  },
  { key: 'signalStop',     label: 'Task 2 — Signal Stop',        domain: 'Inhibition Control'   },
  { key: 'wordColourClash',label: 'Task 3 — Word Colour Clash',  domain: 'Interference Control' },
  { key: 'matchOrPass',    label: 'Task 4 — Match or Pass',      domain: 'Working Memory'       },
]

function TaskSection({ task }) {
  const [open,    setOpen]    = useState(false)
  const [subTab,  setSubTab]  = useState('metrics') // 'metrics' | 'events'

  const data = loadTaskResult(task.key)

  return (
    <section className="rm-task-section">
      <button
        className={`rm-task-toggle ${open ? 'rm-task-toggle--open' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span className="rm-task-label">
          {data ? '✓' : '○'} {task.label}
          <span className="rm-task-domain">{task.domain}</span>
        </span>
        {data && (
          <span className="rm-task-meta">
            {data.completedAt ? new Date(data.completedAt).toLocaleString('en-GB') : ''}
          </span>
        )}
        <span className="rm-chevron" aria-hidden="true">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="rm-task-body">
          {!data ? (
            <p className="researcher-empty">No completed result found for this task.</p>
          ) : (
            <>
              <div className="rm-subtabs" role="tablist">
                <button role="tab" aria-selected={subTab === 'metrics'}
                  className={`rm-subtab ${subTab === 'metrics' ? 'rm-subtab--active' : ''}`}
                  onClick={() => setSubTab('metrics')}>
                  Technical Metrics
                </button>
                <button role="tab" aria-selected={subTab === 'events'}
                  className={`rm-subtab ${subTab === 'events' ? 'rm-subtab--active' : ''}`}
                  onClick={() => setSubTab('events')}>
                  Event Log ({data.events?.length ?? 0} trials)
                </button>
              </div>

              {subTab === 'metrics' && (
                <TechnicalMetrics
                  taskKey={task.key}
                  overall={data.overall}
                  config={data.config}
                />
              )}

              {subTab === 'events' && (
                <EventLogTable taskKey={task.key} events={data.events} />
              )}

              <button
                className="rm-export-btn"
                onClick={() => exportTaskJSON(task.key, data)}
              >
                ↓ Download {task.label} JSON
              </button>
            </>
          )}
        </div>
      )}
    </section>
  )
}

export function ResearcherMode() {
  const allData = Object.fromEntries(
    TASKS.map(t => [t.key, loadTaskResult(t.key)])
  )
  const anyComplete = Object.values(allData).some(Boolean)

  return (
    <div className="researcher-page">
      <header className="rm-header">
        <Link to="/dashboard" className="rm-back-link">← Dashboard</Link>
        <h1>Researcher View</h1>
        <p className="rm-subtitle">
          Raw trial data, technical metrics, and JSON exports for the current session.
          No data is transmitted — all values are read directly from <code>localStorage</code>.
        </p>
      </header>

      <main className="rm-main">
        {TASKS.map(task => (
          <TaskSection key={task.key} task={task} />
        ))}

        <div className="rm-export-all">
          <button
            className="rm-export-all-btn"
            disabled={!anyComplete}
            onClick={() => exportAllJSON(allData)}
          >
            ↓ Export All Tasks as JSON
          </button>
          {!anyComplete && (
            <p className="rm-export-note">Complete at least one task to export.</p>
          )}
        </div>
      </main>
    </div>
  )
}
