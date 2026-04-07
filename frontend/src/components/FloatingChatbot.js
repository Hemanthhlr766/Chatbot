import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import VoiceInputButton from "./VoiceInputButton";
import { sendChatMessage, synthesizeSpeechAudio } from "../services/api";

const quickPrompts = ["Book appointment tomorrow", "Check my symptoms", "Explain my uploaded report", "Give a diet plan"];

export default function FloatingChatbot({ adminMode = false }) {
  const navigate = useNavigate();
  const audioRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: adminMode
        ? "I can monitor alerts, interpret trends, and guide you into admin workflows."
        : "I can book appointments, check symptoms, explain reports, and guide you through the system.",
    },
  ]);

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
      // Intentionally ignore TTS playback failures.
    }
  };

  const submitMessage = async (event) => {
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
      setMessages((prev) => [...prev, { role: "assistant", text: "The assistant could not respond right now. Please try again." }]);
    }
  };

  return (
    <div className={`assistant-dock${open ? " open" : ""}`}>
      {open ? (
        <div className="assistant-window panel glossy-card">
          <div className="assistant-header">
            <div>
              <strong>AI Health Assistant</strong>
              <div className="muted">Context-aware guidance across the platform</div>
            </div>
            <button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>Close</button>
          </div>
          <div className="assistant-quick-actions">
            {quickPrompts.map((prompt) => <button key={prompt} type="button" className="chip-button" onClick={() => setMessage(prompt)}>{prompt}</button>)}
          </div>
          <div className="assistant-messages">
            {messages.map((item, index) => (
              <div key={`${item.role}-${index}`} className={`assistant-bubble ${item.role}`}>
                <div>{item.text}</div>
                {item.action && item.action !== "general_help" ? <span className="assistant-action-tag">{item.action.replaceAll("_", " ")}</span> : null}
                {item.route ? <button type="button" className="btn btn-secondary assistant-route-button" onClick={() => navigate(item.route)}>Open Related Module</button> : null}
              </div>
            ))}
          </div>
          <form onSubmit={submitMessage} className="assistant-form">
            <textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ask, book, analyze, or get guided to a module" />
            <div className="button-row">
              <button type="submit" className="btn btn-primary">Send</button>
              <VoiceInputButton onTranscript={setMessage} label="Voice" />
            </div>
          </form>
        </div>
      ) : null}
      <button type="button" className="assistant-fab" onClick={() => setOpen((prev) => !prev)}>
        AI Assistant
      </button>
    </div>
  );
}
