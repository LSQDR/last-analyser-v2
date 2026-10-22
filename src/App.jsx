import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Home }        from './pages/Home.jsx'
import './App.css'

// Each route after Home loads as its own chunk.
const TaskRouter     = lazy(() => import('./pages/TaskRouter.jsx').then((m) => ({ default: m.TaskRouter })))
const Dashboard      = lazy(() => import('./pages/Dashboard.jsx').then((m) => ({ default: m.Dashboard })))
const ResearcherMode = lazy(() => import('./pages/ResearcherMode.jsx').then((m) => ({ default: m.ResearcherMode })))

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tasks" element={<TaskRouter />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/researcher" element={<ResearcherMode />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
