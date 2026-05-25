import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadSession, saveSession } from '../utils/storage.js';
import { TASK_ORDER } from '../config/taskRegistry.js';
import { TapThePulse }    from '../components/tasks/TapThePulse/TapThePulse.jsx';
import { SignalStop }     from '../components/tasks/SignalStop/SignalStop.jsx';
import { WordColourClash } from '../components/tasks/WordColourClash/WordColourClash.jsx';
import { MatchOrPass }    from '../components/tasks/MatchOrPass/MatchOrPass.jsx';


const TASK_COMPONENTS = {
  tapThePulse:    TapThePulse,
  signalStop:     SignalStop,
  wordColourClash: WordColourClash,
  matchOrPass:    MatchOrPass,
};

export function TaskRouter() {
  const navigate           = useNavigate();
  const [session, setSession] = useState(null);
  const [ready, setReady]  = useState(false);

  useEffect(() => {
    const savedSession = loadSession();
    if (!savedSession) { navigate('/', { replace: true }); return; }
    // Crash recovery: resume from currentTask
    setSession(savedSession);
    setReady(true);
  }, [navigate]);

  function handleTaskComplete(taskKey) {
    const savedSession = loadSession();
    if (!savedSession) return;

    const completedTasks = [...savedSession.completedTasks, taskKey];
    const currentIndex   = TASK_ORDER.indexOf(taskKey);
    const nextTask       = TASK_ORDER[currentIndex + 1] ?? null;

    if (!nextTask) {
      const updated = { ...savedSession, completedTasks, currentTask: null, appState: 'dashboard' };
      saveSession(updated);
      navigate('/dashboard', { replace: true });
      return;
    }

    const updated = { ...savedSession, completedTasks, currentTask: nextTask };
    saveSession(updated);
    setSession(updated);
  }

  if (!ready || !session) return null;

  const currentTask = session.currentTask;
  if (!currentTask) { navigate('/dashboard', { replace: true }); return null; }

  const TaskComponent = TASK_COMPONENTS[currentTask];
  if (!TaskComponent) { navigate('/', { replace: true }); return null; }

  return (
    <TaskComponent
      key={currentTask}
      onComplete={() => handleTaskComplete(currentTask)}
    />
  );
}
