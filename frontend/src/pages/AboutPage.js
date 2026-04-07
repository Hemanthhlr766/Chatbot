const pillars = [
  { title: "Project Objective", text: "Deliver an AI-enabled healthcare assistant that improves accessibility, organization, and guided decision support." },
  { title: "Core Stack", text: "React frontend, Django REST backend, MySQL database, AI APIs, PDF extraction, voice tools, and SMTP notifications." },
  { title: "Supervisory Model", text: "User journeys are patient-centric while admins monitor all outputs, trends, and operational workflows in read/manage mode." },
];

export default function AboutPage() {
  return (
    <div className="public-page premium-page">
      <section className="public-split-hero about-hero">
        <div className="public-card glossy-card public-section wide-panel">
          <span className="eyebrow">About The Platform</span>
          <h1>Healthcare guidance powered by a layered, AI-enabled care coordination system.</h1>
          <p>
            The Health Care Assistant Chatbot is built to support patients and administrators through a connected digital ecosystem
            for symptom triage, medication support, report understanding, appointment coordination, and data-driven oversight.
          </p>
        </div>
        <div className="public-card glossy-card about-art-card">
          <div className="art-stage about-art">
            <div className="glass-panel art-banner">Healthcare AI Orchestration</div>
            <div className="glass-panel about-node left-node">Patient Care</div>
            <div className="glass-panel about-node center-node">AI Assistant</div>
            <div className="glass-panel about-node right-node">Admin Monitoring</div>
          </div>
        </div>
      </section>

      <section className="horizontal-showcase">
        <div className="feature-rail">
          {pillars.map((pillar) => (
            <article key={pillar.title} className="public-card glossy-card feature-card-heavy">
              <h3>{pillar.title}</h3>
              <p>{pillar.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="public-split-grid">
        <div className="public-card glossy-card timeline-card">
          <span className="eyebrow">Project Flow</span>
          <div className="timeline-steps">
            <div className="timeline-step"><div className="timeline-index">01</div><div>User onboarding and profile capture</div></div>
            <div className="timeline-step"><div className="timeline-index">02</div><div>Assessment and AI-generated medical guidance</div></div>
            <div className="timeline-step"><div className="timeline-index">03</div><div>Reports, medication, and appointment workflows</div></div>
            <div className="timeline-step"><div className="timeline-index">04</div><div>Admin monitoring, alerts, analytics, and system control</div></div>
          </div>
        </div>
        <div className="public-card glossy-card trust-card">
          <span className="eyebrow">Credibility</span>
          <h2>Purpose-built for realistic healthcare workflow separation.</h2>
          <p>
            Patients receive personalized support while admins validate outputs, monitor alerts, and maintain platform integrity without acting as patients.
          </p>
        </div>
      </section>
    </div>
  );
}
