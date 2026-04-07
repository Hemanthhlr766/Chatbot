export default function PageHeader({ title, description, badge = "Workspace", actions }) {
  return (
    <div className="page-header premium-page-header">
      <div>
        <span className="eyebrow">{badge}</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {actions ? <div className="button-row">{actions}</div> : null}
    </div>
  );
}
