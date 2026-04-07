import { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import PublicNavbar from "./PublicNavbar";

export default function PublicLayout() {
  const [theme, setTheme] = useState(() => localStorage.getItem("health_assistant_theme") || "light");

  useEffect(() => {
    document.body.dataset.theme = theme;
    localStorage.setItem("health_assistant_theme", theme);
  }, [theme]);

  return (
    <div className="public-shell heavy-public-shell">
      <div className="public-bg-orb orb-one" />
      <div className="public-bg-orb orb-two" />
      <div className="public-bg-grid" />
      <PublicNavbar
        theme={theme}
        onToggleTheme={() => setTheme((current) => (current === "light" ? "dark" : "light"))}
      />
      <main className="public-main">
        <Outlet />
      </main>
      <Link className="public-floating-assistant" to="/login">
        <span>AI Assistant</span>
        <small>Login to continue</small>
      </Link>
    </div>
  );
}
