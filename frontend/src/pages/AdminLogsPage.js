import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import { getAdminLogs } from "../services/api";

export default function AdminLogsPage() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const load = async () => setLogs(await getAdminLogs());
    load();
  }, []);

  return (
    <>
      <PageHeader badge="Conversation Review" title="Chat Logs" description="Review chatbot interactions in a messaging-style supervisory interface for quality and safety monitoring." />
      <div className="panel glossy-card">
        <div className="chat-log-stream">
          {logs.length ? logs.map((log) => (
            <div key={log.id} className="chat-log-card">
              <div className="chat-log-meta">
                <strong>{log.user.name}</strong>
                <span>{new Date(log.created_at).toLocaleString()}</span>
              </div>
              <div className="chat-log-bubbles">
                <div className="assistant-bubble user">{log.user_message}</div>
                <div className="assistant-bubble assistant">{log.bot_response}</div>
              </div>
            </div>
          )) : <p className="muted">No chat logs available.</p>}
        </div>
      </div>
    </>
  );
}
