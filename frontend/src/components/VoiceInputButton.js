import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import AppIcon from "./AppIcon";
import { transcribeVoiceAudio } from "../services/api";

const AUTO_STOP_MS = 7000;

export default function VoiceInputButton({ onTranscript, label = "Voice Input" }) {
  const [open, setOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const intervalRef = useRef(null);
  const autoStopRef = useRef(null);

  const statusText = useMemo(() => {
    if (isProcessing) return "Transcribing your voice input...";
    if (isRecording) return "Listening... speak naturally";
    return "Tap start to record your voice";
  }, [isProcessing, isRecording]);

  useEffect(() => () => {
    cleanupRecording();
  }, []);

  const cleanupRecording = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (autoStopRef.current) {
      clearTimeout(autoStopRef.current);
      autoStopRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    setIsRecording(false);
    setElapsedSeconds(0);
  };

  const closeOverlay = () => {
    cleanupRecording();
    setOpen(false);
    setIsProcessing(false);
    setError("");
  };

  const handleStop = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  };

  const startRecording = async () => {
    try {
      setError("");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      streamRef.current = stream;
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        cleanupRecording();
        if (!audioBlob.size) {
          setError("No audio was captured.");
          return;
        }
        setIsProcessing(true);
        try {
          const response = await transcribeVoiceAudio(audioBlob);
          if (response.transcript) {
            onTranscript(response.transcript);
            setOpen(false);
          } else {
            setError("No speech was detected.");
          }
        } catch (recordingError) {
          setError(recordingError.response?.data?.detail || "Unable to transcribe audio.");
        } finally {
          setIsProcessing(false);
        }
      };

      recorder.start();
      setIsRecording(true);
      intervalRef.current = setInterval(() => setElapsedSeconds((current) => current + 1), 1000);
      autoStopRef.current = setTimeout(handleStop, AUTO_STOP_MS);
    } catch (recordingError) {
      setError("Microphone access is required for voice input.");
    }
  };

  const overlay = open ? (
    <div className="voice-overlay">
      <div className="voice-overlay-backdrop" onClick={closeOverlay} />
      <div className="voice-overlay-card glossy-card" role="dialog" aria-modal="true" aria-label="Voice assistant input">
        <button type="button" className="voice-close-btn" onClick={closeOverlay}>Close</button>
        <div className={`voice-mic-stage${isRecording ? " recording" : ""}${isProcessing ? " processing" : ""}`}>
          <div className="voice-ripple ripple-one" />
          <div className="voice-ripple ripple-two" />
          <div className="voice-ripple ripple-three" />
          <div className="voice-mic-core">
            <AppIcon name="mic" size={36} />
          </div>
        </div>
        <h3>Voice Assistant Input</h3>
        <p className="muted">{statusText}</p>
        <div className="voice-wave-row" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="voice-timer">00:{String(elapsedSeconds).padStart(2, "0")}</div>
        {error ? <p className="error-text">{error}</p> : null}
        <div className="button-row voice-action-row">
          {!isRecording && !isProcessing ? <button type="button" className="btn btn-primary" onClick={startRecording}>Start Recording</button> : null}
          {isRecording ? <button type="button" className="btn btn-danger" onClick={handleStop}>Stop Recording</button> : null}
          <button type="button" className="btn btn-secondary" onClick={closeOverlay}>Cancel</button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button type="button" className="btn btn-secondary voice-trigger-btn" onClick={() => setOpen(true)}>
        <AppIcon name="mic" size={16} />
        <span>{label}</span>
      </button>
      {typeof document !== "undefined" ? createPortal(overlay, document.body) : overlay}
    </>
  );
}
