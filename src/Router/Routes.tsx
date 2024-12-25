import App from "@/App";
import Dashboard from "@/component/Dashboard-Components";
import DashboardUI from "@/component/Dashboard-Components/dashboard";
import DebtReminderUI from "@/component/Dashboard-Components/debtReminders";
import TransferUI from "@/component/Dashboard-Components/transferMoney";
import AuthScreen from "@/component/Login-Components";
import { ForgotPasswordForm } from "@/component/Login-Components/forgotPasswordForm";
import { LoginForm } from "@/component/Login-Components/loginForm";
import { ResetPassword } from "@/component/Login-Components/resetPassword";
import { VerifyCode } from "@/component/Login-Components/verifyCode";
import { createBrowserRouter, Navigate } from "react-router-dom";


export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "",
        element: <Navigate to="auth" replace />,
      },
      {
        path: "auth",
        element: <AuthScreen />,
        children: [
          { path: "", element: <Navigate to="login" replace /> },
          { path: "login", element: <LoginForm /> },
          { path: "forgotPassword", element: <ForgotPasswordForm /> },
          { path: "verifyCode", element: <VerifyCode /> },
          { path: "resetPassword", element: <ResetPassword /> },
        ],
      },
      {
        path: "dashboard",
        element: <Dashboard />,
        children: [
          { path: "", element: <DashboardUI/> },
          { path: "transfer-money", element: <TransferUI /> },
          { path: "manage-beneficiaries", element: <TransferUI /> },
          { path: "transaction-history", element: <TransferUI /> },
          { path: "debt-reminders", element: <DebtReminderUI /> },
          { path: "settings", element: <TransferUI /> },
          { path: "help-center", element: <TransferUI /> },
          { path: "profile", element: <TransferUI /> },
          { path: "logout", element: <Navigate to="/auth" replace /> },
        ],
      },
    ],
  },
]);
