import { Link } from 'react-router-dom'
import {TASK_REGISTRY} from '../../config/taskRegistry.js'

export function DashboardHeader({ data }) {
  const tasksDone = TASK_REGISTRY.map(task => ({
    ...task,
    completed: data?.[task.id] != null,
  }))

  const completedCount = tasksDone.filter(t => t.completed).length
  const totalCount = tasksDone.length

  return (
    <header className="dashboard-header" role="banner">


      <div className="dashboard-topbar">
        <Link to="/" className="dashboard-wordmark" aria-label="Back to home">
          LaST-analyser
        </Link>
        <span className="dashboard-progress-label">
          {completedCount} of {totalCount} tasks complete
        </span>
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