const paths = {
  overview: "M4 11.5L12 5l8 6.5V20a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z",
  symptom: "M12 21c4.6-3.1 7-6.1 7-10a7 7 0 1 0-14 0c0 3.9 2.4 6.9 7 10z",
  appointment: "M7 3v3M17 3v3M4 9h16M5 6h14a1 1 0 0 1 1 1v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a1 1 0 0 1 1-1z",
  medication: "M9 5.5l5 5M7.5 7l5 5M8 4h4a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4z",
  reports: "M8 3h6l4 4v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM14 3v4h4",
  insurance: "M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6z",
  stats: "M5 19V9M12 19V5M19 19v-8",
  chatbot: "M6 7h12a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3h-4l-4 3v-3H6a3 3 0 0 1-3-3v-5a3 3 0 0 1 3-3z",
  users: "M16 19a4 4 0 0 0-8 0M12 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M19 19a3 3 0 0 0-3-3M18 10a2.5 2.5 0 1 0 0-5",
  logs: "M8 6h10M8 12h10M8 18h7M5 6h.01M5 12h.01M5 18h.01",
  alert: "M12 4l8 14H4zM12 10v4M12 17h.01",
  settings: "M12 8.5A3.5 3.5 0 1 1 8.5 12 3.5 3.5 0 0 1 12 8.5zm0-5.5l1.2 2.5 2.8.4-2 2 .5 2.8L12 9.6l-2.5 1.1.5-2.8-2-2 2.8-.4zM12 15.5l1.2 2.5 2.8.4-2 2 .5 2.8L12 22.1l-2.5 1.1.5-2.8-2-2 2.8-.4z",
  hospital: "M6 21V6a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v15M4 21h16M10 9h4M12 7v4M9 14h2M13 14h2M9 18h2M13 18h2",
  mic: "M12 15a3 3 0 0 0 3-3V7a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3zM19 11a7 7 0 0 1-14 0M12 18v3M9 21h6",
  star: "M12 3l2.7 5.4 6 .9-4.3 4.2 1 5.9L12 16.8 6.6 19.4l1-5.9L3.3 9.3l6-.9z",
  clock: "M12 7v5l3 2M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18z",
  activity: "M4 13h4l2-5 4 10 2-5h4",
  diet: "M7 20c0-5 2.5-9 8-12 1 6-1.5 11-8 12zm6-9c3.2.3 5.6 2.2 7 6-5 .5-8.5-1.3-10.5-5.5",
  location: "M12 21s6-5.7 6-11a6 6 0 1 0-12 0c0 5.3 6 11 6 11zm0-8a3 3 0 1 1 0-6 3 3 0 0 1 0 6z",
  pulse: "M3 12h4l2-4 4 8 2-4h6",
  file: "M7 3h7l4 4v14H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",
};

export default function AppIcon({ name, size = 18, className = "" }) {
  const path = paths[name] || paths.overview;
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}
