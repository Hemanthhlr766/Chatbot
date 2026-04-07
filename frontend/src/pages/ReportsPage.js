import { useEffect, useState } from "react";
import AppIcon from "../components/AppIcon";
import PageHeader from "../components/PageHeader";
import { createReport, getReports } from "../services/api";

export default function ReportsPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ title: "", report_type: "medical", file: null });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = async () => setItems(await getReports());
  useEffect(() => { load(); }, []);

  const healthIssuesFor = (item) => item.health_issues || (Array.isArray(item.findings) ? item.findings : item.findings?.health_issues) || [];
  const recommendationsFor = (item) => item.recommendations || item.findings?.recommendations || [];
  const summaryFor = (item) => item.analysis_summary || item.findings?.analysis_summary || "Analysis will appear after extraction.";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.file) {
      setError("Please upload a PDF report before submitting.");
      return;
    }

    try {
      setIsSubmitting(true);
      await createReport(form);
      setForm({ title: "", report_type: "medical", file: null });
      setSuccess("Report uploaded and analyzed successfully.");
      await load();
    } catch (submitError) {
      const detail = submitError.response?.data;
      if (typeof detail === "string") {
        setError(detail);
      } else if (detail?.detail) {
        setError(detail.detail);
      } else if (detail && typeof detail === "object") {
        const firstMessage = Object.entries(detail)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
          .join(" | ");
        setError(firstMessage || "Unable to upload the report.");
      } else {
        setError("Unable to upload the report.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader badge="Report Intelligence" title="Scan Reports" description="Upload PDFs and review extracted issues through a cleaner, more credible report workspace." />
      <div className="premium-grid-two">
        <div className="panel glossy-card">
          <form onSubmit={handleSubmit}>
            <div className="field"><label>Report Title</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Blood test - April review" /></div>
            <div className="field"><label>Report Type</label><select value={form.report_type} onChange={(e) => setForm({ ...form, report_type: e.target.value })}><option value="medical">Medical Report</option><option value="medication">Medication</option><option value="assessment">Assessment</option></select></div>
            <div className="field"><label>Upload PDF</label><input type="file" accept="application/pdf" onChange={(e) => setForm({ ...form, file: e.target.files?.[0] || null })} /></div>
            {error ? <p className="error-text">{error}</p> : null}
            {success ? <p className="success-text">{success}</p> : null}
            <button className="btn btn-primary" type="submit" disabled={isSubmitting}>{isSubmitting ? "Analyzing..." : "Upload and Analyze"}</button>
          </form>
        </div>
        <div className="panel glossy-card">
          <h3 className="section-title">AI Summary Layer</h3>
          <div className="summary-list">
            <div className="summary-item focus-item">
              <div className="summary-icon"><AppIcon name="reports" size={18} /></div>
              <div>
                <strong>Issue Extraction</strong>
                <div>Uploaded reports are summarized into structured findings for easier review.</div>
              </div>
            </div>
            <div className="summary-item focus-item">
              <div className="summary-icon"><AppIcon name="chatbot" size={18} /></div>
              <div>
                <strong>Chatbot Context</strong>
                <div>The assistant can explain uploaded findings using your report history.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="panel glossy-card" style={{ marginTop: 18 }}>
        <h3 className="section-title">Stored Reports</h3>
        <div className="summary-list">
          {items.length ? items.map((item) => (
            <div className="summary-item focus-item report-analysis-card" key={item.id}>
              <div className="summary-icon"><AppIcon name="file" size={18} /></div>
              <div>
                <strong>{item.title}</strong>
                <div className="muted">{item.report_type}</div>
                <div><strong>Summary:</strong> {summaryFor(item)}</div>
                <div><strong>Health Issues:</strong> {healthIssuesFor(item).length ? healthIssuesFor(item).join(", ") : "No issues extracted yet."}</div>
                <div><strong>Recommendations:</strong> {recommendationsFor(item).length ? recommendationsFor(item).join(", ") : "Recommendations will appear after analysis."}</div>
              </div>
            </div>
          )) : <p className="muted">No reports stored yet.</p>}
        </div>
      </div>
    </>
  );
}
