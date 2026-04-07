import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import PageHeader from "../components/PageHeader";
import VoiceInputButton from "../components/VoiceInputButton";
import { sendChatMessage, synthesizeSpeechAudio } from "../services/api";

const patientPrompts = ["Book appointment tomorrow", "Analyze my symptoms", "Explain my report findings", "Give me a diet plan"];
const adminPrompts = ["Show critical alerts", "Summarize appointment trends", "Review user activity", "Guide me to system control"];

export default function ChatbotPage({ adminMode = false }) {
  const navigate = useNavigate();
  const audioRef = useRef(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: adminMode
        ? "Ask me to review alerts, inspect trends, or guide you to admin workflows."
        : "Ask me to book appointments, analyze symptoms, explain reports, or guide you through any patient workflow.",
    },
  ]);

  const prompts = adminMode ? adminPrompts : patientPrompts;

  const playResponseAudio = async (text) => {
    try {
      const audioBlob = await synthesizeSpeechAudio(text);
      const url = URL.createObjectURL(audioBlob);
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => URL.revokeObjectURL(url);
      await audio.play();
    } catch (error) {
      // Intentionally silent fallback when TTS is unavailable.
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!message.trim()) {
      return;
    }

    const current = message;
    setMessages((prev) => [...prev, { role: "user", text: current }]);
    setMessage("");

    try {
      const response = await sendChatMessage(current);
      setMessages((prev) => [...prev, { role: "assistant", text: response.message, action: response.action, route: response.route }]);
      playResponseAudio(response.message);
    } catch (error) {
      setMessages((prev) => [...prev, { role: "assistant", text: "The assistant is temporarily unavailable." }]);
    }
  };

  return (
    <>
      <PageHeader title="AI Assistant" description="The central controller of the platform, available as a full-page workspace and a floating assistant from every route." />
      <div className="chatbot-layout">
        <div className="panel glossy-card assistant-page">
          <div className="assistant-hero">
            <div>
              <span className="eyebrow">Primary Intelligence Layer</span>
              <h3>Context-aware assistant with voice, routing, and action guidance</h3>
              <p className="muted">It can reason over assessments, records, history, and current actions while guiding users into the right module.</p>
            </div>
          </div>
          <div className="assistant-quick-actions">
            {prompts.map((prompt) => <button key={prompt} type="button" className="chip-button" onClick={() => setMessage(prompt)}>{prompt}</button>)}
          </div>
          <div className="assistant-messages full-page-assistant">
            {messages.map((item, index) => (
              <div key={`${item.role}-${index}`} className={`assistant-bubble ${item.role}`}>
                <div>{item.text}</div>
                {item.action && item.action !== "general_help" ? <span className="assistant-action-tag">{item.action.replaceAll("_", " ")}</span> : null}
                {item.route ? <button type="button" className="btn btn-secondary assistant-route-button" onClick={() => navigate(item.route)}>Open Related Module</button> : null}
              </div>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="assistant-form assistant-form-large">
            <textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Try: book appointment tomorrow, explain my report, give a diet plan" />
            <div className="button-row">
              <button className="btn btn-primary" type="submit">Send</button>
              <VoiceInputButton onTranscript={setMessage} label="Speak To Assistant" />
            </div>
          </form>
        </div>
        <div className="assistant-side-panel">
          <div className="panel glossy-card">
            <h3 className="section-title">What It Can Control</h3>
            <div className="summary-list">
              <div className="summary-item"><strong>Appointments</strong><div>Guide or trigger booking and scheduling workflows.</div></div>
              <div className="summary-item"><strong>Symptoms</strong><div>Interpret symptom input and connect users to triage guidance.</div></div>
              <div className="summary-item"><strong>Reports and History</strong><div>Use prior context to make answers more relevant and personalized.</div></div>
            </div>
          </div>
          <div className="panel glossy-card">
            <h3 className="section-title">Assistant Tips</h3>
            <ul className="tips-list">
              <li>Use voice input for faster hands-free interaction.</li>
              <li>Ask it to navigate you to any feature by name.</li>
              <li>Ask follow-up questions for personalized next steps.</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
