import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Tasks from './component/task'
import LoginScreen from './component/Login-Components'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/dashboard" element={<Tasks />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
