import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import { createInsuranceRequest, listInsuranceRequests } from "../services/api";

export default function InsurancePage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ policy_number: "", policy_company: "", treatment_stage: "pre", notes: "" });

  const load = async () => setItems(await listInsuranceRequests());
  useEffect(() => { load(); }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await createInsuranceRequest(form);
    setForm({ policy_number: "", policy_company: "", treatment_stage: "pre", notes: "" });
    load();
  };

  return (
    <>
      <PageHeader title="Insurance Assistance" description="Submit pre or post-treatment requests without crowding your dashboard." />
      <div className="split-layout">
        <div className="panel">
          <form onSubmit={handleSubmit}>
            <div className="field"><label>Policy Number</label><input value={form.policy_number} onChange={(e) => setForm({ ...form, policy_number: e.target.value })} /></div>
            <div className="field"><label>Policy Company</label><input value={form.policy_company} onChange={(e) => setForm({ ...form, policy_company: e.target.value })} /></div>
            <div className="field"><label>Treatment Stage</label><select value={form.treatment_stage} onChange={(e) => setForm({ ...form, treatment_stage: e.target.value })}><option value="pre">Pre-Treatment</option><option value="post">Post-Treatment</option></select></div>
            <div className="field"><label>Notes</label><textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            <button className="btn btn-primary" type="submit">Submit Request</button>
          </form>
        </div>
        <div className="panel">
          <h3 className="section-title">Submitted Requests</h3>
          <div className="summary-list">
            {items.map((item) => <div className="summary-item" key={item.id}><strong>{item.policy_company}</strong><div>Policy: {item.policy_number}</div><span className="pill">{item.status}</span></div>)}
          </div>
        </div>
      </div>
    </>
  );
}
