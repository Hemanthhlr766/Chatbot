import { useEffect, useState } from "react";
import AppIcon from "../components/AppIcon";
import PageHeader from "../components/PageHeader";
import VoiceInputButton from "../components/VoiceInputButton";
import { createMedication, getMedications } from "../services/api";

export default function MedicationPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ medicine_name: "", dosage: "", schedule: "", instructions: "", document: null });

  const load = async () => setItems(await getMedications());
  useEffect(() => { load(); }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await createMedication(form);
    setForm({ medicine_name: "", dosage: "", schedule: "", instructions: "", document: null });
    load();
  };

  const latest = items[0];

  return (
    <>
      <PageHeader badge="Medication Intelligence" title="Medication and Diet Guidance" description="Upload prescription PDFs, describe medicine text, or use voice input to maintain a cleaner treatment workflow." />
      <div className="premium-grid-two">
        <div className="panel glossy-card">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="field"><label>Medicine Name</label><input value={form.medicine_name} onChange={(e) => setForm({ ...form, medicine_name: e.target.value })} placeholder="Example: Azithromycin" /></div>
              <div className="field"><label>Dosage</label><input value={form.dosage} onChange={(e) => setForm({ ...form, dosage: e.target.value })} placeholder="500 mg" /></div>
              <div className="field field-span-2"><label>Schedule</label><input value={form.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value })} placeholder="After breakfast and before sleep" /></div>
            </div>
            <div className="field"><label>Prescription Notes</label><textarea value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} placeholder="Include tablet timing, food restrictions, or doctor instructions" /></div>
            <div className="button-row" style={{ marginBottom: 12 }}>
              <VoiceInputButton onTranscript={(text) => setForm({ ...form, instructions: text })} />
            </div>
            <div className="field"><label>Upload Prescription PDF</label><input type="file" accept="application/pdf" onChange={(e) => setForm({ ...form, document: e.target.files?.[0] || null })} /></div>
            <button className="btn btn-primary" type="submit">Save Medication Plan</button>
          </form>
        </div>

        <div className="panel glossy-card">
          <h3 className="section-title">AI Care Output</h3>
          <div className="summary-list">
            <div className="summary-item focus-item">
              <div className="summary-icon"><AppIcon name="diet" size={18} /></div>
              <div>
                <strong>Diet Plan</strong>
                <div>{latest ? `Recommended support for ${latest.medicine_name}: balanced meals, hydration, and region-friendly home foods around medication timing.` : "Upload a prescription to generate diet guidance."}</div>
              </div>
            </div>
            <div className="summary-item focus-item">
              <div className="summary-icon"><AppIcon name="clock" size={18} /></div>
              <div>
                <strong>Medicine Schedule</strong>
                <div>{latest ? latest.schedule || latest.instructions || "Schedule will appear after extraction." : "No medication schedule generated yet."}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="panel glossy-card" style={{ marginTop: 18 }}>
        <h3 className="section-title">Stored Medication Schedules</h3>
        <div className="summary-list">
          {items.length ? items.map((item) => (
            <div className="summary-item focus-item" key={item.id}>
              <div className="summary-icon"><AppIcon name="medication" size={18} /></div>
              <div>
                <strong>{item.medicine_name}</strong>
                <div>{item.dosage || "Dosage not specified"}</div>
                <div>{item.schedule || item.instructions}</div>
              </div>
              <span className="pill">{item.reminder_email_sent ? "Reminder sent" : "Reminder pending"}</span>
            </div>
          )) : <p className="muted">No medications saved yet.</p>}
        </div>
      </div>
    </>
  );
}
