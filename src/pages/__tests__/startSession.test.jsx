import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { Home } from '../Home.jsx'
import { TaskRouter } from '../TaskRouter.jsx'
import { loadSession } from '../../utils/storage.js'
import { TASK_ORDER } from '../../config/taskRegistry.js'

function renderApp(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tasks" element={<TaskRouter />} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => localStorage.clear())
afterEach(cleanup)

describe('starting a session', () => {
  it('saves a new session and opens the first task from the home screen', async () => {
    renderApp('/')

    await userEvent.click(screen.getByRole('button', { name: /begin/i }))

    expect(await screen.findByRole('heading', { name: 'Tap the Pulse' })).toBeTruthy()
    const session = loadSession()
    expect(session.currentTask).toBe(TASK_ORDER[0])
    expect(session.completedTasks).toEqual([])
    expect(session.appState).toBe('inTask')
  })

  it('resumes the task a saved session was on', async () => {
    localStorage.setItem('lastAnalyser.session', JSON.stringify({
      taskOrder: TASK_ORDER, currentTask: 'wordColourClash', completedTasks: ['tapThePulse', 'signalStop'], appState: 'inTask',
    }))

    renderApp('/tasks')

    expect(await screen.findByRole('heading', { name: 'Word Colour Clash' })).toBeTruthy()
  })

  it('sends a visitor with no session back to the home screen', async () => {
    renderApp('/tasks')

    expect(await screen.findByRole('button', { name: /begin/i })).toBeTruthy()
  })
})
