import { useState } from "react";
import AppIcon from "../components/AppIcon";
import PageHeader from "../components/PageHeader";
import VoiceInputButton from "../components/VoiceInputButton";
import { createSymptomLog } from "../services/api";

const quickSymptoms = [
  { label: "Fever", icon: "pulse" },
  { label: "Cough", icon: "activity" },
  { label: "Headache", icon: "symptom" },
  { label: "Fatigue", icon: "clock" },
  { label: "Chest Pain", icon: "alert" },
  { label: "Breathing Issue", icon: "pulse" },
];

export default function SymptomsPage() {
  const [form, setForm] = useState({ symptom_text: "", source: "text" });
  const [result, setResult] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = await createSymptomLog(form);
    setResult(data);
    setForm({ symptom_text: "", source: "text" });
  };

  return (
    <>
      <PageHeader badge="Symptom Intelligence" title="AI Symptom Checker" description="Describe symptoms through text or voice and review a clearer disease prediction card with guided suggestions." />
      <div className="premium-grid-two symptom-layout">
        <div className="panel glossy-card symptom-form-panel">
          <div className="chip-stack symptom-chip-stack">
            {quickSymptoms.map((item) => (
              <button
                key={item.label}
                type="button"
                className="symptom-chip"
                onClick={() => setForm((current) => ({ ...current, symptom_text: current.symptom_text ? `${current.symptom_text}, ${item.label}` : item.label }))}
              >
                <AppIcon name={item.icon} size={16} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Describe your symptoms</label>
              <textarea value={form.symptom_text} onChange={(event) => setForm({ ...form, symptom_text: event.target.value })} placeholder="Example: fever with body pain since yesterday and mild cough at night" />
            </div>
            <div className="button-row">
              <button className="btn btn-primary" type="submit">Analyze Symptoms</button>
              <VoiceInputButton onTranscript={(text) => setForm({ symptom_text: text, source: "voice" })} />
            </div>
          </form>
        </div>

        <div className="panel glossy-card symptom-result-panel">
          <h3 className="section-title">AI Result</h3>
          {result ? (
            <div className="summary-list">
              <div className="result-hero-card">
                <div className="result-hero-icon"><AppIcon name="symptom" size={22} /></div>
                <div>
                  <strong>{result.predicted_disease}</strong>
                  <span>Confidence score: {(result.confidence_score * 100).toFixed(0)}%</span>
                </div>
              </div>
              <div className="suggestion-list">
                {result.suggestions.map((item) => (
                  <div key={item} className="suggestion-card">
                    <AppIcon name="activity" size={16} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-state-box">
              <AppIcon name="chatbot" size={24} />
              <p>Your predicted issue and suggestions will appear here after analysis.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
