import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
  { to: "/login", label: "Login" },
  { to: "/register", label: "Register" },
];

export default function PublicNavbar({ theme, onToggleTheme }) {
  const isLight = theme === "light";

  return (
    <header className="public-navbar-wrap">
      <div className="public-navbar glossy-card">
        <div className="public-brand">
          <div className="brand-mark">+</div>
          <div>
            <span className="eyebrow">Health Care Assistant</span>
            <strong>BlueCare AI</strong>
          </div>
        </div>
        <nav className="public-nav-links">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={({ isActive }) => `public-nav-link${isActive ? " active" : ""}`}>
              <span>{link.label}</span>
            </NavLink>
          ))}
          <button
            type="button"
            className={`public-theme-toggle icon-toggle ${isLight ? "light" : "dark"}`}
            onClick={onToggleTheme}
            title={isLight ? "Switch to dark theme" : "Switch to light theme"}
            aria-label={isLight ? "Switch to dark theme" : "Switch to light theme"}
          >
            <span className={`theme-icon-shape ${isLight ? "moon" : "sun"}`} aria-hidden="true" />
          </button>
        </nav>
      </div>
    </header>
  );
}
