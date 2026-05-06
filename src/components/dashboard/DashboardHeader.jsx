import { TASK_REGISTRY } from '../../config/taskRegistry.js';

export function DashboardHeader({ data }) {
  const tasksDone = TASK_REGISTRY.map((task) => ({
    ...task,
    completed: data?.[task.id] != null,
  }));

  return (
    <header className="dashboard-header" role="banner">
      <div className="disclaimer-banner" role="alert" aria-live="polite">
        <strong>Important</strong> This tool is for educational self-reflection only and does
        not constitute a clinical or diagnostic assessment. Results should not be used to
        self-diagnose or replace professional evaluation.
      </div>
      <nav className="dashboard-nav" aria-label="Jump to task results">
        {tasksDone.map((task) => (
          <a
            key={task.id}
            href={`#${task.id}`}
            className={`nav-pill ${task.completed ? 'nav-pill--done' : 'nav-pill--pending'}`}
            aria-label={`Jump to ${task.name} results`}
          >
            {task.completed ? task.shortName : ''}
          </a>
        ))}
      </nav>
    </header>
  );
}
