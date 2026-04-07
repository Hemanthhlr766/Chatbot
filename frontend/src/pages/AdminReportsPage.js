import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import { getAdminReports } from "../services/api";

export default function AdminReportsPage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const load = async () => setItems(await getAdminReports());
    load();
  }, []);

  const summaryFor = (item) => item.analysis_summary || item.findings?.analysis_summary || "No summary available";
  const issuesFor = (item) => item.health_issues || (Array.isArray(item.findings) ? item.findings : item.findings?.health_issues) || [];

  return (
    <>
      <PageHeader title="Report Monitoring" description="Read-only access to uploaded reports and extracted health insights for verification." />
      <div className="panel">
        <div className="table-wrap">
          <table>
            <thead><tr><th>User</th><th>Title</th><th>Type</th><th>Summary</th><th>Health Issues</th></tr></thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.user.name}</td>
                  <td>{item.title}</td>
                  <td>{item.report_type}</td>
                  <td>{summaryFor(item)}</td>
                  <td>{issuesFor(item).length ? issuesFor(item).join(", ") : "No findings extracted"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
