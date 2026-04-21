import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Home }        from './pages/Home.jsx'
import { TaskRouter }  from './pages/TaskRouter.jsx'
// import { Dashboard }   from './pages/Dashboard.jsx'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<Home />} />
        <Route path="/tasks"     element={<TaskRouter />} />
        {/* <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*"          element={<Navigate to="/" replace />} /> */}
      </Routes>
    </BrowserRouter>
  )
}
