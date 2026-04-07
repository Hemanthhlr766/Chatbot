import { useEffect, useState } from "react";
import AppIcon from "../components/AppIcon";
import PageHeader from "../components/PageHeader";
import { getAdminAlerts } from "../services/api";

export default function AdminAlertsPage() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const load = async () => setAlerts(await getAdminAlerts());
    load();
  }, []);

  return (
    <>
      <PageHeader badge="Critical Monitoring" title="Emergency Alerts" description="High-visibility alert cards for critical symptoms and immediate response workflows." />
      <div className="alert-grid">
        {alerts.length ? alerts.map((alert) => (
          <div key={alert.id} className="metric-card alert-card premium-alert-card glossy-card">
            <div className="alert-headline"><AppIcon name="alert" size={18} /> <span>Immediate Attention Required</span></div>
            <strong style={{ fontSize: "1.15rem" }}>{alert.user.name}</strong>
            <div>{alert.message}</div>
            <div className="muted">{new Date(alert.created_at).toLocaleString()}</div>
          </div>
        )) : <p className="muted">No emergency alerts right now.</p>}
      </div>
    </>
  );
}
