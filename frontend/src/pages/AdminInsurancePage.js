import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import { getAdminInsurance } from "../services/api";

export default function AdminInsurancePage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const load = async () => setItems(await getAdminInsurance());
    load();
  }, []);

  return (
    <>
      <PageHeader title="Insurance Monitoring" description="Read-only review of insurance assistance requests submitted by users." />
      <div className="panel">
        <div className="table-wrap">
          <table>
            <thead><tr><th>User</th><th>Policy Number</th><th>Company</th><th>Stage</th><th>Status</th></tr></thead>
            <tbody>
              {items.map((item) => <tr key={item.id}><td>{item.user.name}</td><td>{item.policy_number}</td><td>{item.policy_company}</td><td>{item.treatment_stage}</td><td>{item.status}</td></tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
