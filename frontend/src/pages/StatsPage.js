import { useEffect, useMemo, useState } from "react";
import MetricCard from "../components/MetricCard";
import { BarPanel, PiePanel } from "../components/ChartPanel";
import PageHeader from "../components/PageHeader";
import { getAppointments, getMedications, getReports } from "../services/api";

export default function StatsPage() {
  const [appointments, setAppointments] = useState([]);
  const [medications, setMedications] = useState([]);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const load = async () => {
      const [appointmentsData, medicationsData, reportsData] = await Promise.all([getAppointments(), getMedications(), getReports()]);
      setAppointments(appointmentsData);
      setMedications(medicationsData);
      setReports(reportsData);
    };
    load();
  }, []);

  const appointmentData = useMemo(() => appointments.reduce((acc, item) => {
    const found = acc.find((entry) => entry.status === item.status);
    if (found) {
      found.total += 1;
    } else {
      acc.push({ status: item.status, total: 1 });
    }
    return acc;
  }, []), [appointments]);

  const reportData = useMemo(() => reports.reduce((acc, item) => {
    const found = acc.find((entry) => entry.status === item.report_type);
    if (found) {
      found.total += 1;
    } else {
      acc.push({ status: item.report_type, total: 1 });
    }
    return acc;
  }, []), [reports]);

  const medicationData = medications.map((item, index) => ({ predicted_disease: item.medicine_name || `Medication ${index + 1}`, total: 1 }));

  return (
    <>
      <PageHeader badge="Health Analytics" title="Stats and Trends" description="Review your health activity, disease history indicators, medication activity, and report distribution through cleaner analytics cards." />
      <div className="card-grid dashboard-kpi-grid">
        <MetricCard icon="appointment" label="Appointments Logged" value={appointments.length} note="All appointment requests in your care timeline" />
        <MetricCard icon="medication" label="Medication Entries" value={medications.length} note="Tracked prescription and reminder schedule items" />
        <MetricCard icon="reports" label="Reports Stored" value={reports.length} note="Documents available for AI report review" />
        <MetricCard icon="stats" label="Health Trend View" value="Active" note="Your analytics dashboard is up to date" />
      </div>
      <div className="premium-grid-two" style={{ marginTop: 18 }}>
        <BarPanel title="Appointment Trends" data={appointmentData} />
        <PiePanel title="Report Distribution" data={reportData} />
      </div>
      <div style={{ marginTop: 18 }}>
        <BarPanel title="Medication Snapshot" data={medicationData} />
      </div>
    </>
  );
}
