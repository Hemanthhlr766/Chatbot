import { useEffect, useState } from "react";
import AppIcon from "../components/AppIcon";
import PageHeader from "../components/PageHeader";
import { getAdminAppointments, updateAdminAppointment } from "../services/api";

export default function AdminAppointmentsPage() {
  const [items, setItems] = useState([]);

  const load = async () => setItems(await getAdminAppointments());
  useEffect(() => { load(); }, []);

  const updateStatus = async (appointmentId, status) => {
    await updateAdminAppointment(appointmentId, status);
    load();
  };

  return (
    <>
      <PageHeader badge="Scheduling Control" title="Appointment Management" description="Approve, reject, or supervise every incoming request through a cleaner healthcare operations screen." />
      <div className="panel glossy-card">
        <div className="table-wrap premium-table-wrap">
          <table className="premium-table">
            <thead>
              <tr><th>Patient</th><th>Hospital</th><th>Date & Time</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.user.name}</td>
                  <td>{item.hospital_name}</td>
                  <td>{item.appointment_date} {item.appointment_time}</td>
                  <td><span className="pill">{item.status}</span></td>
                  <td>
                    <div className="button-row">
                      <button className="btn btn-primary slim-btn" onClick={() => updateStatus(item.id, "approved")}><AppIcon name="appointment" size={14} /> Approve</button>
                      <button className="btn btn-danger slim-btn" onClick={() => updateStatus(item.id, "cancelled")}><AppIcon name="alert" size={14} /> Reject</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
