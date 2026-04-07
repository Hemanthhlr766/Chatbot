import AppIcon from "./AppIcon";

export default function MetricCard({ label, value, note, icon = "overview" }) {
  return (
    <div className="metric-card premium-metric-card glossy-card">
      <div className="metric-icon-wrap">
        <AppIcon name={icon} size={18} />
      </div>
      <span className="muted">{label}</span>
      <strong>{value}</strong>
      {note ? <div className="muted">{note}</div> : null}
    </div>
  );
}
