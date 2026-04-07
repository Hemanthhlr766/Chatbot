import { useEffect, useState } from "react";
import AppIcon from "../components/AppIcon";
import PageHeader from "../components/PageHeader";
import { getAdminUserDetail, getAdminUsers, updateUserBlockStatus } from "../services/api";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const load = async () => setUsers(await getAdminUsers());
  useEffect(() => { load(); }, []);

  const toggleBlock = async (user) => {
    await updateUserBlockStatus(user.id, !user.is_blocked);
    load();
  };

  const viewDetails = async (userId) => {
    setSelectedUser(await getAdminUserDetail(userId));
  };

  return (
    <>
      <PageHeader badge="User Supervision" title="User Management" description="Inspect symptoms, medication, reports, and assessment outputs in a cleaner monitoring workspace." />
      <div className="premium-grid-two">
        <div className="panel glossy-card">
          <div className="table-wrap premium-table-wrap">
            <table className="premium-table">
              <thead><tr><th>Name</th><th>Age</th><th>Gender</th><th>Latest Symptom</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.age}</td>
                    <td>{user.gender}</td>
                    <td>{user.latest_symptom || "-"}</td>
                    <td><span className="pill">{user.status}</span></td>
                    <td>
                      <div className="button-row">
                        <button className="btn btn-secondary slim-btn" onClick={() => viewDetails(user.id)}>Inspect</button>
                        <button className="btn btn-secondary slim-btn" onClick={() => toggleBlock(user)}>{user.is_blocked ? "Unblock" : "Block"}</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="panel glossy-card">
          <h3 className="section-title">Expanded User View</h3>
          {selectedUser ? (
            <div className="summary-list">
              <div className="summary-item focus-item">
                <div className="summary-icon"><AppIcon name="users" size={18} /></div>
                <div>
                  <strong>{selectedUser.profile.name}</strong>
                  <div>{selectedUser.profile.email}</div>
                  <div>{selectedUser.profile.location}</div>
                </div>
              </div>
              <div className="summary-item"><strong>Assessment Summary</strong><div>{selectedUser.assessment || "No assessment yet"}</div></div>
              <div className="summary-item"><strong>Disease History</strong><div>{selectedUser.disease_history || "No disease history recorded"}</div></div>
              <div className="summary-item"><strong>Documents / Extracted Text</strong><div>{selectedUser.documents_text || "No uploaded text extracted"}</div></div>
            </div>
          ) : <p className="muted">Choose a user to inspect profile, records, and AI-generated outputs.</p>}
        </div>
      </div>
    </>
  );
}
