import App from "@/App";
import Dashboard from "@/component/Dashboard-Components";
import CustomerAccountUI from "@/component/Dashboard-Components/customerAccount";
import CustomerTransactionUI from "@/component/Dashboard-Components/customerTransactions";
import DashboardUI from "@/component/Dashboard-Components/dashboard";
import DebtReminderUI from "@/component/Dashboard-Components/debtReminders";
import DepositUI from "@/component/Dashboard-Components/deposit";
import EmployeeAccountUI from "@/component/Dashboard-Components/employeeAccount";
import EmployeeTransactionUI from "@/component/Dashboard-Components/employeeTransactions";
import ManageBeneficiaryUI from "@/component/Dashboard-Components/manageBeneficiary";
import ProfileUI from "@/component/Dashboard-Components/profile";
import TransactionUI from "@/component/Dashboard-Components/transactions";
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
        path: "Employee",
        element: <Navigate to="/dashboard/customer-account" replace />,
      },
      {
        path: "Admin",
        element: <Navigate to="/dashboard/employee-account" replace />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
        children: [
          { path: "", element: <DashboardUI/> },
          { path: "transfer-money", element: <TransferUI /> },
          { path: "manage-beneficiaries", element: <ManageBeneficiaryUI /> },
          { path: "transaction-history", element: <TransactionUI /> },
          { path: "debt-reminders", element: <DebtReminderUI /> },
          { path: "settings", element: <TransferUI /> },
          { path: "help-center", element: <TransferUI /> },
          { path: "profile", element: <ProfileUI /> },
          { path: "logout", element: <Navigate to="/auth" replace /> },
          { path: "customer-account", element: <CustomerAccountUI /> },
          { path: "deposit-money", element: <DepositUI /> },
          { path: "customer-transactions-history", element: <CustomerTransactionUI /> },
          { path: "employee-account", element: <EmployeeAccountUI /> },
          { path: "employee-transactions-history", element: <EmployeeTransactionUI /> },
        ],
      },
    ],
  },
]);
