import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import SetupPage from './pages/SetupPage'
import PlayPage from './pages/PlayPage'
import ScoreboardPage from './pages/ScoreboardPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/setup/:gameId" element={<SetupPage />} />
      <Route path="/play/:gameId" element={<PlayPage />} />
      <Route path="/scoreboard/:gameId" element={<ScoreboardPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
