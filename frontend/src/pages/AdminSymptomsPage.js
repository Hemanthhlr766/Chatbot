import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import { getAdminSymptoms } from "../services/api";

export default function AdminSymptomsPage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const load = async () => setItems(await getAdminSymptoms());
    load();
  }, []);

  return (
    <>
      <PageHeader title="Symptom Monitoring" description="Read-only review of symptom submissions and checker outputs generated for users." />
      <div className="panel">
        <div className="table-wrap">
          <table>
            <thead><tr><th>User</th><th>Symptom</th><th>Prediction</th><th>Confidence</th><th>Source</th></tr></thead>
            <tbody>
              {items.map((item) => <tr key={item.id}><td>{item.user.name}</td><td>{item.symptom_text}</td><td>{item.predicted_disease}</td><td>{Math.round((item.confidence_score || 0) * 100)}%</td><td>{item.source}</td></tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
