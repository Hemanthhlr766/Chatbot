import { useState } from "react";
import { sendContactMessage } from "../services/api";

const initialForm = { name: "", email: "", subject: "", message: "" };

export default function ContactPage() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ loading: false, message: "", error: false });

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setStatus({ loading: true, message: "", error: false });
      const response = await sendContactMessage(form);
      setStatus({ loading: false, message: response.detail || "Your message has been sent successfully.", error: false });
      setForm(initialForm);
    } catch (error) {
      setStatus({ loading: false, message: error.response?.data?.detail || "Unable to send your message.", error: true });
    }
  };

  return (
    <div className="public-page premium-page">
      <section className="contact-heavy-layout">
        <div className="public-card glossy-card contact-form-panel">
          <span className="eyebrow">Contact</span>
          <h1>Talk to the BlueCare AI support and administration team.</h1>
          <p>Send questions, implementation feedback, or support requests directly through the integrated email form.</p>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="field"><label>Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="field"><label>Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            </div>
            <div className="field"><label>Subject</label><input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
            <div className="field"><label>Message</label><textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></div>
            {status.message ? <p className={status.error ? "error-text" : "success-text"}>{status.message}</p> : null}
            <button className="btn btn-primary neon-btn" type="submit" disabled={status.loading}>{status.loading ? "Sending..." : "Send Message"}</button>
          </form>
        </div>
        <div className="public-card glossy-card contact-art-panel">
          <div className="art-stage contact-art">
            <div className="glass-panel support-headline">Support Hub</div>
            <div className="support-ring ring-one" />
            <div className="support-ring ring-two" />
            <div className="glass-panel support-card support-card-top">SMTP Delivery</div>
            <div className="glass-panel support-card support-card-mid">Admin Inbox</div>
            <div className="glass-panel support-card support-card-bottom">Fast Response</div>
          </div>
        </div>
      </section>
    </div>
  );
}
