const TASK_META = [
  { id: 'task1', name: 'Tap the Pulse',    shortName: 'Tap' },
  { id: 'task2', name: 'Signal Stop',      shortName: 'Stop' },
  { id: 'task3', name: 'Word Colour Clash',shortName: 'Stroop' },
  { id: 'task4', name: 'Match or Pass',    shortName: 'N-Back' },
]

export function DashboardHeader({ data }) {
  const tasksDone = TASK_META.map(t => ({ ...t, completed: data?.[t.id] !== null && data?.[t.id] !== undefined }))

  return (
    <header className="dashboard-header" role="banner">
      <div className="disclaimer-banner" role="alert" aria-live="polite">
        <strong>Important:</strong> This tool is for educational self-reflection only and does not constitute a clinical or diagnostic assessment. Results should not be used to self-diagnose or replace professional evaluation.
      </div>
      <nav className="dashboard-nav" aria-label="Jump to task results">
        {tasksDone.map(task => (
          <a
            key={task.id}
            href={`#${task.id}`}
            className={`nav-pill ${task.completed ? 'nav-pill--done' : 'nav-pill--pending'}`}
            aria-label={`Jump to ${task.name} results`}
          >
            {task.completed ? '✓ ' : ''}{task.shortName}
          </a>
        ))}
      </nav>
    </header>
  )
}
