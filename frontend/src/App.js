import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AppShell from "./components/AppShell";
import FloatingChatbot from "./components/FloatingChatbot";
import PublicLayout from "./components/PublicLayout";
import AdminAlertsPage from "./pages/AdminAlertsPage";
import AdminAnalyticsPage from "./pages/AdminAnalyticsPage";
import AdminAppointmentsPage from "./pages/AdminAppointmentsPage";
import AdminAssessmentsPage from "./pages/AdminAssessmentsPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminInsurancePage from "./pages/AdminInsurancePage";
import AdminLogsPage from "./pages/AdminLogsPage";
import AdminMedicationsPage from "./pages/AdminMedicationsPage";
import AdminReportsPage from "./pages/AdminReportsPage";
import AdminSymptomsPage from "./pages/AdminSymptomsPage";
import AdminSystemControlPage from "./pages/AdminSystemControlPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AuthPage from "./pages/AuthPage";
import AboutPage from "./pages/AboutPage";
import ChatbotPage from "./pages/ChatbotPage";
import ContactPage from "./pages/ContactPage";
import HomePage from "./pages/HomePage";
import InsurancePage from "./pages/InsurancePage";
import MedicationPage from "./pages/MedicationPage";
import ReportsPage from "./pages/ReportsPage";
import StatsPage from "./pages/StatsPage";
import SymptomsPage from "./pages/SymptomsPage";
import UserAppointmentsPage from "./pages/UserAppointmentsPage";
import UserDashboardPage from "./pages/UserDashboardPage";
import { AuthProvider, useAuth } from "./services/AuthContext";

function HomeRedirect() {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />;
}

function UserLayout() {
  return (
    <ProtectedRoute role="user">
      <AppShell role="user">
        <Outlet />
        <FloatingChatbot />
      </AppShell>
    </ProtectedRoute>
  );
}

function AdminLayout() {
  return (
    <ProtectedRoute role="admin">
      <AppShell role="admin">
        <Outlet />
        <FloatingChatbot adminMode />
      </AppShell>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<AuthPage initialMode="login" />} />
          <Route path="/register" element={<AuthPage initialMode="register" />} />
        </Route>

        <Route element={<UserLayout />}>
          <Route path="/dashboard" element={<UserDashboardPage />} />
          <Route path="/symptoms" element={<SymptomsPage />} />
          <Route path="/insurance" element={<InsurancePage />} />
          <Route path="/medications" element={<MedicationPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/appointments" element={<UserAppointmentsPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/assistant" element={<ChatbotPage />} />
        </Route>

        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/assessments" element={<AdminAssessmentsPage />} />
          <Route path="/admin/symptoms" element={<AdminSymptomsPage />} />
          <Route path="/admin/medications" element={<AdminMedicationsPage />} />
          <Route path="/admin/reports" element={<AdminReportsPage />} />
          <Route path="/admin/insurance" element={<AdminInsurancePage />} />
          <Route path="/admin/appointments" element={<AdminAppointmentsPage />} />
          <Route path="/admin/logs" element={<AdminLogsPage />} />
          <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
          <Route path="/admin/alerts" element={<AdminAlertsPage />} />
          <Route path="/admin/system-control" element={<AdminSystemControlPage />} />
          <Route path="/admin/assistant" element={<ChatbotPage adminMode />} />
        </Route>

        <Route path="/home-redirect" element={<HomeRedirect />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
