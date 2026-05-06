import { useState } from 'react';
import {MetricTable} from './MetricTable.jsx';
import {FlagSection} from './FlagSection.jsx';

export function TaskCard({ task, taskData }) {
  const [showRetake, setShowRetake] = useState(false);
  const ChartComponent = task.ChartComponent;

  function handleRetakeConfirm() {
    localStorage.removeItem(task.storageKey);
    window.location.reload();
  }

  return (
    <section id={task.id} className="task-card" aria-labelledby={`${task.id}-heading`}>
      <div className="task-card-header">
        <h3 id={`${task.id}-heading`}>{task.name}</h3>
        <span className="task-card-domain">{task.domain}</span>
      </div>

      {taskData.overall.flags.length > 0 && (
        <div className="task-flag-banner" role="alert">
          {taskData.overall.flags.length} flag{taskData.overall.flags.length !== 1 ? 's' : ''} raised
        </div>
      )}

      <MetricTable metrics={task.getMetrics(taskData.overall)} />

      {ChartComponent && <ChartComponent data={taskData} />}

      <FlagSection
        flags={taskData.overall.flags}
        flagFeedback={task.flagFeedback}
      />

      <button className="retake-btn" onClick={() => setShowRetake(true)}>
        Retake this task
      </button>

      {showRetake && (
        <div className="retake-backdrop" role="dialog" aria-modal="true">
          <div className="retake-dialog">
            <h3>Retake {task.name}?</h3>
            <p>Your current result will be cleared and you'll start fresh.</p>
            <div className="dialog-actions">
              <button className="btn-confirm" onClick={handleRetakeConfirm}>
                Yes, retake
              </button>
              <button className="btn-cancel" onClick={() => setShowRetake(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export function TaskCardPlaceholder({ task }) {
  return (
    <section className="task-card task-card--placeholder">
      <p className="placeholder-label">Not yet attempted</p>
      <p className="placeholder-name">{task.name}</p>
    </section>
  );
}