import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import { getAdminSystemControl, updateAdminSystemControl } from "../services/api";

export default function AdminSystemControlPage() {
  const [form, setForm] = useState(null);

  useEffect(() => {
    const load = async () => setForm(await getAdminSystemControl());
    load();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const updated = await updateAdminSystemControl(form);
    setForm(updated);
  };

  return (
    <>
      <PageHeader title="System Control" description="Manage model behavior and notification settings in one dedicated configuration page." />
      <div className="panel">
        {form ? (
          <form onSubmit={handleSubmit}>
            <div className="field"><label>Gemini Model</label><input value={form.gemini_model || ""} onChange={(e) => setForm({ ...form, gemini_model: e.target.value })} /></div>
            <div className="field"><label>Assessment Model</label><input value={form.assessment_model || ""} onChange={(e) => setForm({ ...form, assessment_model: e.target.value })} /></div>
            <div className="field"><label>Emergency Notifications</label><select value={form.emergency_notifications_enabled ? "yes" : "no"} onChange={(e) => setForm({ ...form, emergency_notifications_enabled: e.target.value === "yes" })}><option value="yes">Enabled</option><option value="no">Disabled</option></select></div>
            <div className="field"><label>Email Notifications</label><select value={form.email_notifications_enabled ? "yes" : "no"} onChange={(e) => setForm({ ...form, email_notifications_enabled: e.target.value === "yes" })}><option value="yes">Enabled</option><option value="no">Disabled</option></select></div>
            <button className="btn btn-primary" type="submit">Save Changes</button>
          </form>
        ) : <p className="muted">Loading system controls...</p>}
      </div>
    </>
  );
}
