import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import { getAdminMedications } from "../services/api";

export default function AdminMedicationsPage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const load = async () => setItems(await getAdminMedications());
    load();
  }, []);

  return (
    <>
      <PageHeader title="Medication Monitoring" description="Read-only tracking of medication schedules and reminder status across users." />
      <div className="panel">
        <div className="table-wrap">
          <table>
            <thead><tr><th>User</th><th>Medicine</th><th>Dosage</th><th>Schedule</th><th>Reminder</th></tr></thead>
            <tbody>
              {items.map((item) => <tr key={item.id}><td>{item.user.name}</td><td>{item.medicine_name}</td><td>{item.dosage || "-"}</td><td>{item.schedule}</td><td>{item.reminder_email_sent ? "Sent" : "Pending"}</td></tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
