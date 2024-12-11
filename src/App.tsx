import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Tasks from './component/task'
import AuthScreen from './component/Login-Components'
import { LoginForm } from './component/Login-Components/loginForm'
import { ForgotPasswordForm } from './component/Login-Components/forgotPasswordForm'
import { VerifyCode } from './component/Login-Components/verifyCode'
import { ResetPassword } from './component/Login-Components/resetPassword'
import { Toaster } from './components/ui/toaster'

function App() {
  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/auth" element={<AuthScreen />} >
          <Route index element={<Navigate to={"login"} replace />} />
          <Route path="login" element={<LoginForm />} />
          <Route path="forgotPassword" element={<ForgotPasswordForm />} />
          <Route path="verifyCode" element={<VerifyCode />} />
          <Route path="resetPassword" element={<ResetPassword />} />
        </Route>
        <Route path="/dashboard" element={<Tasks />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
