import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";
import { useAuth } from "../services/AuthContext";

const initialRegisterState = { name: "", age: "", gender: "male", username: "", password: "", mobile_number: "", email: "", location: "" };

const registerSections = [
  {
    title: "Personal Information",
    fields: ["name", "age", "gender"],
  },
  {
    title: "Account Security",
    fields: ["username", "password"],
  },
  {
    title: "Contact Information",
    fields: ["mobile_number", "email", "location"],
  },
];

const fieldMeta = {
  name: { label: "Full Name", type: "text", placeholder: "Enter your full name" },
  age: { label: "Age", type: "number", placeholder: "Enter age" },
  gender: { label: "Gender", type: "select" },
  username: { label: "Username", type: "text", placeholder: "Choose a username" },
  password: { label: "Password", type: "password", placeholder: "Create a strong password" },
  mobile_number: { label: "Mobile Number", type: "text", placeholder: "Enter mobile number" },
  email: { label: "Email", type: "email", placeholder: "Enter email address" },
  location: { label: "Location", type: "text", placeholder: "Enter your city or location" },
};

export default function AuthPage({ initialMode = "login" }) {
  const [mode, setMode] = useState(initialMode);
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [registerForm, setRegisterForm] = useState(initialRegisterState);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const headline = useMemo(
    () =>
      mode === "login"
        ? "Access your health workspace, appointments, reports, and AI guidance through one clean portal."
        : "Create a patient account with a streamlined onboarding flow designed for clarity and speed.",
    [mode]
  );

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      setError("");
      const user = await login(credentials);
      navigate(user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      setError("");
      await registerUser({ ...registerForm, age: Number(registerForm.age || 0) });
      setMode("login");
      setCredentials({ username: registerForm.username, password: registerForm.password });
    } catch (err) {
      const data = err.response?.data;
      setError(typeof data === "object" ? JSON.stringify(data) : "Unable to register.");
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (field) => {
    const meta = fieldMeta[field];

    if (meta.type === "select") {
      return (
        <select value={registerForm[field]} onChange={(e) => setRegisterForm({ ...registerForm, [field]: e.target.value })}>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      );
    }

    if (field === "password") {
      return (
        <div className="password-shell clean-password-shell">
          <input
            type={showPassword ? "text" : "password"}
            value={registerForm.password}
            placeholder={meta.placeholder}
            onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
          />
          <button type="button" className="password-toggle" onClick={() => setShowPassword((current) => !current)}>
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      );
    }

    return (
      <input
        type={meta.type}
        value={registerForm[field]}
        placeholder={meta.placeholder}
        onChange={(e) => setRegisterForm({ ...registerForm, [field]: e.target.value })}
      />
    );
  };

  return (
    <div className="auth-shell public-auth-shell premium-auth-shell clean-auth-shell">
      <div className="auth-backdrop-art" />
      <div className="auth-card premium-auth-card clean-auth-card">
        <section className="hero-panel auth-showcase clean-auth-showcase glossy-card">
          <span className="eyebrow">Healthcare Access</span>
          <h2>{mode === "login" ? "Welcome back" : "Create your account"}</h2>
          <p>{headline}</p>
          <div className="auth-highlight-list">
            <div className="auth-highlight-item">
              <strong>Unified care access</strong>
              <span>Appointments, reports, chatbot, and medication tools in one place.</span>
            </div>
            <div className="auth-highlight-item">
              <strong>AI-guided experience</strong>
              <span>Built around intelligent workflows instead of scattered forms.</span>
            </div>
            <div className="auth-highlight-item">
              <strong>Secure and structured</strong>
              <span>Role-based access for patients and supervisory administrators.</span>
            </div>
          </div>
          <div className="button-row clean-auth-links">
            <Link className="btn btn-secondary" to="/">Back To Home</Link>
            <Link className="btn btn-secondary" to="/contact">Contact</Link>
          </div>
        </section>

        <section className="auth-form-panel public-card glossy-card clean-auth-form-panel">
          <div className="auth-panel-header">
            <div>
              <span className="eyebrow">{mode === "login" ? "Sign In" : "New Account"}</span>
              <h3>{mode === "login" ? "Login to continue" : "Register to get started"}</h3>
            </div>
            <div className="button-row auth-mode-switch clean-auth-mode-switch">
              <button type="button" className={`btn ${mode === "login" ? "btn-primary neon-btn" : "btn-secondary"}`} onClick={() => setMode("login")}>Login</button>
              <button type="button" className={`btn ${mode === "register" ? "btn-primary neon-btn" : "btn-secondary"}`} onClick={() => setMode("register")}>Register</button>
            </div>
          </div>

          {error ? <p className="error-text">{error}</p> : null}

          {mode === "login" ? (
            <form className="clean-auth-form login-form" onSubmit={handleLogin}>
              <div className="field">
                <label>Username</label>
                <input
                  placeholder="Enter your username"
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Password</label>
                <div className="password-shell clean-password-shell">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  />
                  <button type="button" className="password-toggle" onClick={() => setShowPassword((current) => !current)}>
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
              <button className="btn btn-primary neon-btn auth-submit" disabled={loading} type="submit">
                {loading ? "Signing in..." : "Login"}
              </button>
              <p className="muted auth-footnote">Don’t have an account? <Link to="/register">Register</Link></p>
            </form>
          ) : (
            <form className="clean-auth-form register-form" onSubmit={handleRegister}>
              <div className="auth-form-groups clean-register-groups">
                {registerSections.map((section) => (
                  <div key={section.title} className="auth-group-card clean-auth-group-card">
                    <h4>{section.title}</h4>
                    <div className="form-grid clean-form-grid">
                      {section.fields.map((field) => (
                        <div key={field} className={`field ${field === "location" ? "field-span-2" : ""}`}>
                          <label>{fieldMeta[field].label}</label>
                          {renderInput(field)}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <button className="btn btn-primary neon-btn auth-submit" disabled={loading} type="submit">
                {loading ? "Creating account..." : "Register"}
              </button>
              <p className="muted auth-footnote">Already registered? <Link to="/login">Login</Link></p>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
