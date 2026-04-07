import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import AppIcon from "./AppIcon";
import { useAuth } from "../services/AuthContext";

const userLinks = [
  { to: "/dashboard", label: "Overview", icon: "overview" },
  { to: "/symptoms", label: "Symptom Checker", icon: "symptom" },
  { to: "/appointments", label: "Appointments", icon: "appointment" },
  { to: "/medications", label: "Medication", icon: "medication" },
  { to: "/reports", label: "Reports", icon: "reports" },
  { to: "/insurance", label: "Insurance", icon: "insurance" },
  { to: "/stats", label: "Stats", icon: "stats" },
  { to: "/assistant", label: "Chatbot", icon: "chatbot" },
];

const adminLinks = [
  { to: "/admin", label: "Dashboard", icon: "overview" },
  { to: "/admin/users", label: "Users", icon: "users" },
  { to: "/admin/appointments", label: "Appointments", icon: "appointment" },
  { to: "/admin/logs", label: "Logs", icon: "logs" },
  { to: "/admin/analytics", label: "Analytics", icon: "stats" },
  { to: "/admin/alerts", label: "Alerts", icon: "alert" },
  { to: "/admin/system-control", label: "Settings", icon: "settings" },
  { to: "/admin/assistant", label: "Chatbot", icon: "chatbot" },
];

export default function AppShell({ role, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const links = role === "admin" ? adminLinks : userLinks;
  const [theme, setTheme] = useState(() => localStorage.getItem("health_assistant_theme") || "light");
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    document.body.dataset.theme = theme;
    localStorage.setItem("health_assistant_theme", theme);
  }, [theme]);

  useEffect(() => {
    setNavOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className={`app-frame ${role === "admin" ? "admin-frame" : "user-frame"}`}>
      <div className="app-bg-layer app-bg-one" />
      <div className="app-bg-layer app-bg-two" />
      <header className="top-nav-shell">
        <div className="top-nav glass-nav">
          <div className="app-brand-lockup">
            <div className="app-brand-mark">
              <AppIcon name={role === "admin" ? "pulse" : "chatbot"} size={18} />
            </div>
            <div>
              <span className="eyebrow">Health Care Assistant</span>
              <strong>{role === "admin" ? "Supervisory Control" : "Patient Intelligence Portal"}</strong>
            </div>
          </div>

          <button type="button" className="mobile-menu-toggle" onClick={() => setNavOpen((current) => !current)}>
            {navOpen ? "Close" : "Menu"}
          </button>

          <nav className={`top-nav-links${navOpen ? " open" : ""}`}>
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.to === "/admin" || link.to === "/dashboard"} className={({ isActive }) => `top-nav-link${isActive ? " active" : ""}`}>
                <AppIcon name={link.icon} size={16} />
                <span>{link.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="top-nav-actions">
            <button
              type="button"
              className="theme-chip"
              onClick={() => setTheme((current) => (current === "light" ? "dark" : "light"))}
              aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            >
              <span className={`theme-orb ${theme}`} />
            </button>
            <div className="profile-chip">
              <div className="profile-avatar">{(user?.name || "H").charAt(0).toUpperCase()}</div>
              <div className="profile-copy">
                <strong>{user?.name || "Health Assistant"}</strong>
                <span>{role === "admin" ? "Admin" : "Patient"}</span>
              </div>
            </div>
            <button className="btn btn-secondary slim-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </header>

      <div className="workspace-shell">
        <div className="workspace-intro panel glossy-card workspace-ribbon">
          <div>
            <span className="eyebrow">{role === "admin" ? "Operations Overview" : "Care Overview"}</span>
            <h1>{role === "admin" ? "Monitor every patient-facing workflow with AI-aware oversight." : "Navigate healthcare actions through one AI-centered workspace."}</h1>
          </div>
          <div className="workspace-meta">
            <span className="status-pill online-pill">System Active</span>
            <span className="status-pill role-pill">{role === "admin" ? "Supervisory Access" : "User Access"}</span>
          </div>
        </div>
        <main className="page-content premium-page-content">{children}</main>
      </div>
    </div>
  );
}
