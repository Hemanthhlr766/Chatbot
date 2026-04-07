import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import { getAdminAssessments } from "../services/api";

export default function AdminAssessmentsPage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const load = async () => setItems(await getAdminAssessments());
    load();
  }, []);

  return (
    <>
      <PageHeader title="Assessment Monitoring" description="Read-only access to all preliminary assessments, generated questions, and user responses." />
      <div className="panel">
        <div className="table-wrap">
          <table>
            <thead><tr><th>User</th><th>Previously Treated</th><th>Summary</th><th>Questions</th><th>Answers</th></tr></thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.user.name}</td>
                  <td>{item.is_previously_treated ? "Yes" : "No"}</td>
                  <td>{item.summary || "-"}</td>
                  <td>{item.generated_questions?.length || 0}</td>
                  <td>{item.answers ? JSON.stringify(item.answers) : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
