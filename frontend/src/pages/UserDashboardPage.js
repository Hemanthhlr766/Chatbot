import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppIcon from "../components/AppIcon";
import MetricCard from "../components/MetricCard";
import PageHeader from "../components/PageHeader";
import VoiceInputButton from "../components/VoiceInputButton";
import { getAppointments, getAssessment, getMedications, getProfile, getReports, listInsuranceRequests, sendChatMessage } from "../services/api";

const shortcuts = [
  { to: "/symptoms", label: "Symptom Checker", icon: "symptom" },
  { to: "/appointments", label: "Appointments", icon: "appointment" },
  { to: "/medications", label: "Medication", icon: "medication" },
  { to: "/reports", label: "Reports", icon: "reports" },
];

export default function UserDashboardPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [medications, setMedications] = useState([]);
  const [reports, setReports] = useState([]);
  const [insurance, setInsurance] = useState([]);
  const [assistantQuery, setAssistantQuery] = useState("");
  const [assistantReply, setAssistantReply] = useState("Ask the assistant to book appointments, explain reports, or guide your next health action.");

  useEffect(() => {
    const load = async () => {
      const [profileData, assessmentData, appointmentsData, medicationsData, reportsData, insuranceData] = await Promise.all([
        getProfile(),
        getAssessment(),
        getAppointments(),
        getMedications(),
        getReports(),
        listInsuranceRequests(),
      ]);
      setProfile(profileData);
      setAssessment(assessmentData);
      setAppointments(appointmentsData);
      setMedications(medicationsData);
      setReports(reportsData);
      setInsurance(insuranceData);
    };
    load();
  }, []);

  const upcomingAppointment = useMemo(() => appointments[0], [appointments]);
  const latestMedication = useMemo(() => medications[0], [medications]);
  const latestReport = useMemo(() => reports[0], [reports]);

  const handleAssistantSubmit = async (event) => {
    event.preventDefault();
    if (!assistantQuery.trim()) {
      return;
    }
    const current = assistantQuery;
    setAssistantQuery("");
    try {
      const response = await sendChatMessage(current);
      setAssistantReply(response.message);
      if (response.route) {
        setTimeout(() => navigate(response.route), 800);
      }
    } catch (error) {
      setAssistantReply("The assistant is temporarily unavailable. Please try again.");
    }
  };

  const healthScore = Math.max(62, 92 - appointments.filter((item) => item.status === "cancelled").length * 6 - insurance.length * 2);

  return (
    <>
      <PageHeader
        badge="Patient Overview"
        title="Your Health AI Assistant"
        description="Use the assistant as the center of the platform, then move into appointments, symptoms, medication, and reports through clean guided modules."
      />

      <div className="assistant-hero-card panel glossy-card overview-assistant-card">
        <div className="assistant-hero-copy">
          <span className="eyebrow">AI Care Controller</span>
          <h3>Your Health AI Assistant</h3>
          <p>Start with a question, symptom, or action request. The assistant can route you into the right module and personalize responses using your health history.</p>
          <div className="assistant-response-banner">
            <AppIcon name="chatbot" size={18} />
            <span>{assistantReply}</span>
          </div>
        </div>
        <form className="assistant-inline-form" onSubmit={handleAssistantSubmit}>
          <textarea
            value={assistantQuery}
            onChange={(event) => setAssistantQuery(event.target.value)}
            placeholder="Ask to analyze symptoms, book an appointment, explain a report, or suggest a diet plan"
          />
          <div className="button-row">
            <button className="btn btn-primary" type="submit">Send To Assistant</button>
            <VoiceInputButton onTranscript={setAssistantQuery} />
            <Link className="btn btn-secondary" to="/assistant">Open Full Chatbot</Link>
          </div>
        </form>
      </div>

      <div className="card-grid dashboard-kpi-grid">
        <MetricCard icon="symptom" label="Recent Symptoms" value={assessment?.summary ? "Tracked" : "Pending"} note={assessment?.summary ? "Assessment insights available" : "Complete your first assessment"} />
        <MetricCard icon="appointment" label="Upcoming Appointment" value={upcomingAppointment ? upcomingAppointment.hospital_name : "None"} note={upcomingAppointment ? `${upcomingAppointment.appointment_date} at ${upcomingAppointment.appointment_time}` : "Book your next consultation"} />
        <MetricCard icon="medication" label="Medication Reminder" value={latestMedication ? latestMedication.medicine_name : "No medicine"} note={latestMedication ? latestMedication.schedule || "Reminder schedule ready" : "Upload a prescription to start"} />
        <MetricCard icon="activity" label="Health Score" value={`${healthScore}%`} note="Based on current records and active care workflow" />
      </div>

      <div className="premium-grid-two">
        <div className="panel glossy-card feed-panel">
          <h3 className="section-title">Recent Care Snapshot</h3>
          <div className="summary-list">
            <div className="summary-item focus-item">
              <div className="summary-icon"><AppIcon name="appointment" size={18} /></div>
              <div>
                <strong>Upcoming Appointment</strong>
                <div>{upcomingAppointment ? `${upcomingAppointment.hospital_name} on ${upcomingAppointment.appointment_date}` : "No appointment scheduled yet."}</div>
              </div>
            </div>
            <div className="summary-item focus-item">
              <div className="summary-icon"><AppIcon name="reports" size={18} /></div>
              <div>
                <strong>Latest Report</strong>
                <div>{latestReport ? latestReport.title : "Upload a scan report to unlock summarized findings."}</div>
              </div>
            </div>
            <div className="summary-item focus-item">
              <div className="summary-icon"><AppIcon name="insurance" size={18} /></div>
              <div>
                <strong>Insurance Requests</strong>
                <div>{insurance.length} request(s) currently in the system.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="panel glossy-card shortcut-panel">
          <h3 className="section-title">Quick Module Access</h3>
          <div className="premium-shortcut-grid">
            {shortcuts.map((shortcut) => (
              <Link key={shortcut.to} to={shortcut.to} className="premium-shortcut-card">
                <span className="summary-icon"><AppIcon name={shortcut.icon} size={18} /></span>
                <strong>{shortcut.label}</strong>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="panel glossy-card" style={{ marginTop: 18 }}>
        <h3 className="section-title">Personal Guidance</h3>
        <div className="insight-band-grid">
          <div className="insight-band">
            <AppIcon name="pulse" size={18} />
            <div>
              <strong>Assessment Summary</strong>
              <span>{assessment?.summary || "Complete the preliminary assessment to activate smarter AI guidance."}</span>
            </div>
          </div>
          <div className="insight-band">
            <AppIcon name="diet" size={18} />
            <div>
              <strong>Diet and Medication</strong>
              <span>{latestMedication ? `Your latest plan centers around ${latestMedication.medicine_name}.` : "Upload prescription details to generate medicine and diet suggestions."}</span>
            </div>
          </div>
          <div className="insight-band">
            <AppIcon name="reports" size={18} />
            <div>
              <strong>Records Status</strong>
              <span>{reports.length} report(s) and {medications.length} medication entry(ies) are stored in your workspace.</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
