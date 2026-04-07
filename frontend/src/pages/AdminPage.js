import { useEffect, useState } from "react";
import { BarPanel, PiePanel } from "../components/ChartPanel";
import MetricCard from "../components/MetricCard";
import { getAdminAlerts, getAdminAnalytics, getAdminAppointments, getAdminDashboard, getAdminLogs, getAdminSystemControl, getAdminUsers, updateAdminAppointment, updateAdminSystemControl, updateUserBlockStatus } from "../services/api";

export default function AdminPage() {
  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [logs, setLogs] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [systemControl, setSystemControl] = useState(null);

  const loadAll = async () => {
    const [dashboardData, usersData, appointmentsData, logsData, analyticsData, alertsData, systemControlData] = await Promise.all([getAdminDashboard(), getAdminUsers(), getAdminAppointments(), getAdminLogs(), getAdminAnalytics(), getAdminAlerts(), getAdminSystemControl()]);
    setDashboard(dashboardData);
    setUsers(usersData);
    setAppointments(appointmentsData);
    setLogs(logsData);
    setAnalytics(analyticsData);
    setAlerts(alertsData);
    setSystemControl(systemControlData);
  };

  useEffect(() => { loadAll(); }, []);

  const toggleBlock = async (user) => { await updateUserBlockStatus(user.id, !user.is_blocked); loadAll(); };
  const changeAppointmentStatus = async (appointmentId, status) => { await updateAdminAppointment(appointmentId, status); loadAll(); };
  const saveSystemControl = async (event) => { event.preventDefault(); await updateAdminSystemControl(systemControl); loadAll(); };

  return (
    <>
      <div className="card-grid">
        <MetricCard label="Total users" value={dashboard?.total_users || 0} />
        <MetricCard label="Appointments today" value={dashboard?.appointments_today || 0} />
        <MetricCard label="Active medications" value={dashboard?.active_medications || 0} />
        <MetricCard label="Open alerts" value={dashboard?.alerts_count || 0} note="Emergency-triggered and review pending" />
      </div>
      <div className="split-layout"><BarPanel title="Symptom Frequency" data={dashboard?.symptom_frequency || []} /><PiePanel title="Patient Statistics" data={dashboard?.patient_statistics || []} /></div>
      <div className="panel" style={{ marginTop: 18 }}>
        <h3 className="section-title">Emergency Alerts</h3>
        <div className="card-grid">{alerts.map((alert) => <div className="metric-card" key={alert.id}><span className="pill pill-danger">Immediate Attention Required</span><strong style={{ fontSize: "1.1rem" }}>{alert.user.name}</strong><div>{alert.message}</div><div className="muted">{new Date(alert.created_at).toLocaleString()}</div></div>)}</div>
      </div>
      <div className="split-layout">
        <div className="panel">
          <h3 className="section-title">User Management</h3>
          <div className="table-wrap"><table><thead><tr><th>Name</th><th>Age</th><th>Gender</th><th>Symptoms</th><th>Status</th><th>Action</th></tr></thead><tbody>{users.map((user) => <tr key={user.id}><td>{user.name}</td><td>{user.age}</td><td>{user.gender}</td><td>{user.latest_symptom || "-"}</td><td><span className="pill">{user.status}</span></td><td><button className="btn btn-secondary" onClick={() => toggleBlock(user)}>{user.is_blocked ? "Unblock" : "Block"}</button></td></tr>)}</tbody></table></div>
        </div>
        <div className="panel">
          <h3 className="section-title">Appointment Management</h3>
          <div className="table-wrap"><table><thead><tr><th>Patient</th><th>Hospital</th><th>Date & Time</th><th>Status</th><th>Action</th></tr></thead><tbody>{appointments.map((appointment) => <tr key={appointment.id}><td>{appointment.user.name}</td><td>{appointment.hospital_name}</td><td>{appointment.appointment_date} {appointment.appointment_time}</td><td><span className="pill">{appointment.status}</span></td><td><div className="button-row"><button className="btn btn-primary" onClick={() => changeAppointmentStatus(appointment.id, "approved")}>Approve</button><button className="btn btn-danger" onClick={() => changeAppointmentStatus(appointment.id, "cancelled")}>Cancel</button></div></td></tr>)}</tbody></table></div>
        </div>
      </div>
      <div className="split-layout">
        <BarPanel title="Appointment Trends" data={analytics?.appointment_trends || []} />
        <PiePanel title="Insurance Requests" data={analytics?.insurance_requests?.map((item) => ({ status: item.status, total: 1 })) || []} />
      </div>
      <div className="split-layout">
        <div className="panel">
          <h3 className="section-title">Chat Logs Monitoring</h3>
          <div className="table-wrap"><table><thead><tr><th>User</th><th>Message</th><th>Bot Response</th><th>Timestamp</th></tr></thead><tbody>{logs.map((log) => <tr key={log.id}><td>{log.user.name}</td><td>{log.user_message}</td><td>{log.bot_response}</td><td>{new Date(log.created_at).toLocaleString()}</td></tr>)}</tbody></table></div>
        </div>
        <div className="panel">
          <h3 className="section-title">System Control</h3>
          {systemControl ? <form onSubmit={saveSystemControl}><div className="field"><label>Gemini model</label><input value={systemControl.gemini_model || ""} onChange={(e) => setSystemControl({ ...systemControl, gemini_model: e.target.value })} /></div><div className="field"><label>Assessment model</label><input value={systemControl.assessment_model || ""} onChange={(e) => setSystemControl({ ...systemControl, assessment_model: e.target.value })} /></div><div className="field"><label>Emergency notifications</label><select value={systemControl.emergency_notifications_enabled ? "yes" : "no"} onChange={(e) => setSystemControl({ ...systemControl, emergency_notifications_enabled: e.target.value === "yes" })}><option value="yes">Enabled</option><option value="no">Disabled</option></select></div><div className="field"><label>Email notifications</label><select value={systemControl.email_notifications_enabled ? "yes" : "no"} onChange={(e) => setSystemControl({ ...systemControl, email_notifications_enabled: e.target.value === "yes" })}><option value="yes">Enabled</option><option value="no">Disabled</option></select></div><button className="btn btn-primary" type="submit">Save System Control</button></form> : null}
        </div>
      </div>
    </>
  );
}
