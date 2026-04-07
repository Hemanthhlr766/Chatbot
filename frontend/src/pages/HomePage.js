import { Link } from "react-router-dom";

const features = [
  { title: "Symptom Intelligence", text: "Voice and text based checking with contextual AI guidance and escalation awareness." },
  { title: "Appointment Flow", text: "Request, track, and manage appointments with approval-ready workflows." },
  { title: "Smart Reports", text: "Upload prescriptions and reports, extract findings, and organize records fast." },
  { title: "Admin Oversight", text: "Built-in supervisory dashboards for alerts, analytics, monitoring, and operational control." },
];

const steps = [
  "Create your account and complete the first health assessment.",
  "Use the assistant to check symptoms, upload reports, and manage medication details.",
  "Track appointments, reminders, analytics, and system-guided next actions.",
];

export default function HomePage() {
  return (
    <div className="public-page premium-page">
      <section className="hero-section hero-heavy public-card glossy-card">
        <div className="hero-copy">
          <span className="eyebrow">AI-Powered Health Care Assistant</span>
          <h1>Premium digital healthcare support designed around intelligent action, not just conversation.</h1>
          <p>
            BlueCare AI combines symptom checking, chatbot-guided workflows, medication support, report analysis,
            appointment coordination, and supervisory healthcare monitoring in one futuristic interface.
          </p>
          <div className="button-row hero-actions">
            <Link className="btn btn-primary neon-btn" to="/login">Login</Link>
            <Link className="btn btn-secondary" to="/register">Register</Link>
          </div>
          <div className="hero-mini-metrics">
            <div className="mini-metric public-card"><strong>24/7</strong><span>AI guidance</span></div>
            <div className="mini-metric public-card"><strong>Multi-Module</strong><span>Patient workflows</span></div>
            <div className="mini-metric public-card"><strong>Real-Time</strong><span>Admin visibility</span></div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="art-stage home-art">
            <div className="art-layer glass-panel main-panel">
              <div className="art-avatar" />
              <div>
                <h3>AI Doctor Interface</h3>
                <p>Symptom analysis, report insight extraction, and action-aware routing.</p>
              </div>
            </div>
            <div className="art-layer glass-panel floating-card top-card">
              <strong>Chatbot Core</strong>
              <span>Context-aware and voice-ready</span>
            </div>
            <div className="art-layer glass-panel floating-card mid-card">
              <strong>Appointments</strong>
              <span>Approve and coordinate care</span>
            </div>
            <div className="art-layer glass-panel floating-card bottom-card">
              <strong>Reports</strong>
              <span>Insights extracted from PDFs</span>
            </div>
          </div>
        </div>
      </section>

      <section className="horizontal-showcase">
        <div className="section-heading-row">
          <div>
            <span className="eyebrow">Feature Flow</span>
            <h2>Everything important is surfaced through layered, intelligent healthcare tools.</h2>
          </div>
        </div>
        <div className="feature-rail">
          {features.map((feature) => (
            <article key={feature.title} className="public-card glossy-card feature-card-heavy">
              <span className="feature-dot" />
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="public-split-grid">
        <div className="public-card glossy-card how-card">
          <span className="eyebrow">How It Works</span>
          <h2>Structured flow from onboarding to continuous healthcare assistance.</h2>
          <div className="timeline-steps">
            {steps.map((step, index) => (
              <div key={step} className="timeline-step">
                <div className="timeline-index">0{index + 1}</div>
                <div>{step}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="public-card glossy-card trust-card">
          <span className="eyebrow">Why It Feels Different</span>
          <h2>A healthcare product interface built to feel modern, responsive, and trustworthy.</h2>
          <p>
            Heavy glass UI, blue neon accents, assistant-first workflows, and clear role separation make the
            platform feel production-ready instead of academic.
          </p>
        </div>
      </section>
    </div>
  );
}
