import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AuthScreen from './component/Login-Components'
import { LoginForm } from './component/Login-Components/loginForm'
import { ForgotPasswordForm } from './component/Login-Components/forgotPasswordForm'
import { VerifyCode } from './component/Login-Components/verifyCode'
import { ResetPassword } from './component/Login-Components/resetPassword'
import { Toaster } from './components/ui/toaster'
import Dashboard from './component/Dashboard-Components'
import TransferUI from './component/Dashboard-Components/transferMoney'
import DashboardUI from './component/Dashboard-Components/dashboard'

function App() {
  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        <Route path="/" element={<Navigate to="/auth" replace />} />
        <Route path="/auth" element={<AuthScreen />} >
          <Route index element={<Navigate to={"login"} replace />} />
          <Route path="login" element={<LoginForm />} />
          <Route path="forgotPassword" element={<ForgotPasswordForm />} />
          <Route path="verifyCode" element={<VerifyCode />} />
          <Route path="resetPassword" element={<ResetPassword />} />
        </Route>
        <Route path="/dashboard" element={<Dashboard />} >
          <Route index element={<DashboardUI />} />
          <Route path="transfer-money" element={<TransferUI />} />
          <Route path="manage-beneficiaries" element={<TransferUI />} />
          <Route path="transaction-history" element={<TransferUI />} />
          <Route path="debt-reminders" element={<TransferUI />} />
          <Route path="settings" element={<TransferUI />} />
          <Route path="help-center" element={<TransferUI />} />
          <Route path="profile" element={<TransferUI />} />
          <Route path="logout" element={<Navigate to="/auth" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App