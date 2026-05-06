import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadTaskResult, loadSession, saveSession, clearAllResults } from '../utils/storage.js';
import { TASK_REGISTRY, TASK_ORDER } from '../config/taskRegistry.js';
import clsx from 'clsx';
import './Home.css';

export function Home() {
  const navigate                    = useNavigate();
  const [completedTasks, setCompletedTasks] = useState([]);
  const [session, setSession]       = useState(null);

  useEffect(() => {
    const completed = TASK_ORDER.filter((k) => loadTaskResult(k) !== null);
    setCompletedTasks(completed);
    setSession(loadSession());
  }, []);

  const allDone      = completedTasks.length === 4;
  const inProgress   = session?.appState === 'inTask';
  const hasAnyResult = completedTasks.length > 0;

  function handleStart() {
    if (inProgress && session) { navigate('/tasks'); return; }
    const newSession = {
      createdAt:      new Date().toISOString(),
      taskOrder:      TASK_ORDER,
      currentTask:    TASK_ORDER[0],
      completedTasks: [],
      appState:       'inTask',
    };
    saveSession(newSession);
    navigate('/tasks');
  }

  function handleRetakeAll() {
    clearAllResults();
    const newSession = {
      createdAt:      new Date().toISOString(),
      taskOrder:      TASK_ORDER,
      currentTask:    TASK_ORDER[0],
      completedTasks: [],
      appState:       'inTask',
    };
    saveSession(newSession);
    navigate('/tasks');
  }

  const taskElements = TASK_REGISTRY.map((task) => {
    const done      = completedTasks.includes(task.storageKey);
    const isCurrent = session?.currentTask === task.storageKey && inProgress;
    return (
      <div
        key={task.storageKey}
        className={clsx('task-item', { 'task-item-current': isCurrent, 'task-item-done': done })}
      >
        <span>{done ? '✓' : isCurrent ? '▶' : ''}</span>
        <div>
          <p className={clsx('task-item-label', { 'task-item-label--done': done, 'task-item-label-current': isCurrent })}>
            {task.name}
          </p>
          <p className="task-item-domain">{task.domain}</p>
        </div>
      </div>
    );
  });

  return (
    <main>
      <h1>LAST-Analyser</h1>
      <p>
        ADHD Task Performance Analyzer is an interactive web application that lets you explore
        your cognitive patterns through four short, evidence-based mini-games. Covering sustained
        attention, interference control, response inhibition, and working memory. Each task captures
        real behavioural data such as reaction times, error rates, and accuracy, which are then
        compared against published neuropsychological research benchmarks to give you meaningful,
        personalised insights. This tool is designed for educational self-reflection only and is
        not a diagnostic or clinical assessment.
      </p>

      <div role="alert" aria-live="polite" className="disclaimer-cont">
        <strong>Important</strong> This tool is for educational self-reflection only and does not
        constitute a clinical or diagnostic assessment. Results should not be used to self-diagnose
        or replace professional evaluation.
      </div>

      <div className="task-list">{taskElements}</div>

      <div className="button-section">
        {!allDone && (
          <button className="start-btn" onClick={handleStart}>
            {inProgress ? 'Continue Task' : completedTasks.length > 0 ? 'Continue' : 'Start'}
          </button>
        )}
        {hasAnyResult && (
          <button className="results-btn" onClick={() => navigate('/dashboard')}>
            View Results Dashboard
          </button>
        )}
        {hasAnyResult && (
          <button className="retake-btn" onClick={handleRetakeAll}>
            Start New Run
          </button>
        )}
      </div>
    </main>
  );
}
