import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppIcon from "../components/AppIcon";
import MetricCard from "../components/MetricCard";
import PageHeader from "../components/PageHeader";
import { getAdminAlerts, getAdminDashboard } from "../services/api";

const shortcuts = [
  { to: "/admin/users", label: "Users", icon: "users" },
  { to: "/admin/appointments", label: "Appointments", icon: "appointment" },
  { to: "/admin/logs", label: "Chat Logs", icon: "logs" },
  { to: "/admin/alerts", label: "Alerts", icon: "alert" },
];

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const load = async () => {
      const [dashboardData, alertsData] = await Promise.all([getAdminDashboard(), getAdminAlerts()]);
      setDashboard(dashboardData);
      setAlerts(alertsData.slice(0, 3));
    };
    load();
  }, []);

  return (
    <>
      <PageHeader badge="Admin Command Center" title="Supervisory Dashboard" description="Track user activity, appointment flow, alerts, and system-wide AI outputs from a cleaner operational view." />
      <div className="card-grid dashboard-kpi-grid">
        <MetricCard icon="users" label="Total Users" value={dashboard?.total_users || 0} />
        <MetricCard icon="appointment" label="Appointments Today" value={dashboard?.appointments_today || 0} />
        <MetricCard icon="alert" label="Alerts" value={dashboard?.alerts_count || 0} />
        <MetricCard icon="medication" label="Active Medications" value={dashboard?.active_medications || 0} />
      </div>

      <div className="premium-grid-two" style={{ marginTop: 18 }}>
        <div className="panel glossy-card admin-hero-panel">
          <div className="assistant-response-banner admin-command-banner">
            <AppIcon name="chatbot" size={18} />
            <span>Admin AI can summarize trends, interpret chat quality, and guide you to operational modules without entering patient-only assessment mode.</span>
          </div>
          <div className="premium-shortcut-grid">
            {shortcuts.map((shortcut) => (
              <Link key={shortcut.to} to={shortcut.to} className="premium-shortcut-card">
                <span className="summary-icon"><AppIcon name={shortcut.icon} size={18} /></span>
                <strong>{shortcut.label}</strong>
              </Link>
            ))}
          </div>
        </div>
        <div className="panel glossy-card">
          <h3 className="section-title">Emergency Alerts</h3>
          <div className="summary-list">
            {alerts.length ? alerts.map((alert) => (
              <div className="summary-item focus-item alert-focus-item" key={alert.id}>
                <div className="summary-icon alert-icon"><AppIcon name="alert" size={18} /></div>
                <div>
                  <strong>{alert.user.name}</strong>
                  <div>{alert.message}</div>
                  <span className="pill pill-danger">Immediate Attention Required</span>
                </div>
              </div>
            )) : <p className="muted">No emergency alerts right now.</p>}
          </div>
        </div>
      </div>
    </>
  );
}
