import { useNavigate } from "react-router-dom";
import { useAuth } from "../services/AuthContext";

export default function DashboardLayout({ title, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <div className="topbar">
        <div className="brand">
          <h1>{title}</h1>
          <p>{user?.name} · {user?.role === "admin" ? "System oversight and interventions" : "AI-guided health support"}</p>
        </div>
        <div className="button-row">
          <span className="pill">{user?.email}</span>
          <button className="btn btn-secondary" onClick={handleLogout}>Logout</button>
        </div>
      </div>
      {children}
    </div>
  );
}
