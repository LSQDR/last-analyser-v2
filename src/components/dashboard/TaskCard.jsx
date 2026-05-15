import { useState, useEffect, useRef } from 'react';
import { MetricTable } from './MetricTable.jsx';
import { FlagSection } from './FlagSection.jsx';

export function TaskCard({ task, taskData }) {
  const [showRetake, setShowRetake] = useState(false);
  const ChartComponent = task.ChartComponent;
  const dialogRef = useRef(null);

  // Focus trap
  useEffect(() => {
    if (!showRetake || !dialogRef.current) return;

    const dialog = dialogRef.current;
    const focusable = dialog.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    // Focus the first element when dialog opens
    first?.focus();

    function onKeyDown(e) {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }

    // Close on Escape
    function onEscape(e) {
      if (e.key === 'Escape') setShowRetake(false);
    }

    dialog.addEventListener('keydown', onKeyDown);
    dialog.addEventListener('keydown', onEscape);
    return () => {
      dialog.removeEventListener('keydown', onKeyDown);
      dialog.removeEventListener('keydown', onEscape);
    };
  }, [showRetake]);

  function handleRetakeConfirm() {
    localStorage.removeItem(task.storageKey);
    window.location.reload();
  }

  return (
    <section
      id={task.id}
      className="task-card"
      aria-labelledby={`${task.id}-heading`}
    >
      <div className="task-card-header">
        <h3 id={`${task.id}-heading`}>{task.name}</h3>
        <span className="task-card-domain-chip">{task.domain}</span>
      </div>

      {taskData.overall.flags.length > 0 && (
        <div className="task-flag-banner" role="alert">
          <span className="task-flag-banner__icon" aria-hidden="true">&#9873;</span>
          <span className="task-flag-banner__count">
            {taskData.overall.flags.length}
          </span>
          <span className="task-flag-banner__label">
            {taskData.overall.flags.length !== 1 ? ' flags raised' : ' flag raised'}
          </span>
        </div>
      )}

      <MetricTable metrics={task.getMetrics(taskData.overall)} />

      {ChartComponent && (
        <figure className="task-chart-figure">
          <figcaption className="task-chart-caption">{task.name} — results</figcaption>
          <ChartComponent data={taskData} />
        </figure>
      )}

      <FlagSection
        flags={taskData.overall.flags}
        flagFeedback={task.flagFeedback}
      />

      <div className="task-card-footer">
        <button className="retake-btn" onClick={() => setShowRetake(true)}>
          Retake this task
        </button>
      </div>

      {showRetake && (
        <div
          className="retake-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="retake-dialog-heading"
          ref={dialogRef}
        >
          <div className="retake-dialog">
            <h3 id="retake-dialog-heading">Retake {task.name}?</h3>
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
      <div className="task-card-header">
        <span className="placeholder-name">{task.name}</span>
        <span className="task-card-domain-chip task-card-domain-chip--pending">
          {task.domain}
        </span>
      </div>
      <p className="placeholder-label">Not yet attempted</p>
      <a href="/" className="placeholder-cta">Go to tasks to start &#8594;</a>
    </section>
  );
}