import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("health_assistant_access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const createFormData = (payload) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      formData.append(key, value);
    }
  });
  return formData;
};

export const sendContactMessage = async (payload) => (await api.post("/public/contact", payload)).data;
export const registerUser = async (payload) => (await api.post("/auth/register", payload)).data;
export const loginUser = async (payload) => (await api.post("/auth/login", payload)).data;
export const getProfile = async () => (await api.get("/user/profile")).data;
export const getAssessment = async () => (await api.get("/user/assessment")).data;
export const createAssessment = async (payload) => (await api.post("/user/assessment", createFormData(payload), { headers: { "Content-Type": "multipart/form-data" } })).data;
export const createSymptomLog = async (payload) => (await api.post("/user/symptoms", payload)).data;
export const getNearbyHospitals = async () => (await api.get("/user/hospitals")).data;
export const getAppointments = async () => (await api.get("/user/appointments")).data;
export const createAppointment = async (payload) => (await api.post("/user/appointments", payload)).data;
export const getMedications = async () => (await api.get("/user/medications")).data;
export const createMedication = async (payload) => (await api.post("/user/medications", createFormData(payload), { headers: { "Content-Type": "multipart/form-data" } })).data;
export const getReports = async () => (await api.get("/user/reports")).data;
export const createReport = async (payload) => (await api.post("/user/reports", createFormData(payload), { headers: { "Content-Type": "multipart/form-data" } })).data;
export const listInsuranceRequests = async () => (await api.get("/user/insurance")).data;
export const createInsuranceRequest = async (payload) => (await api.post("/user/insurance", payload)).data;
export const sendChatMessage = async (message) => (await api.post("/user/chatbot", { message })).data;
export const transcribeVoiceAudio = async (audioBlob) => {
  const formData = new FormData();
  formData.append("audio", audioBlob, "voice-input.webm");
  return (await api.post("/user/voice/transcribe", formData, { headers: { "Content-Type": "multipart/form-data" } })).data;
};
export const synthesizeSpeechAudio = async (text) => (await api.post("/user/voice/speak", { text }, { responseType: "blob" })).data;
export const getAdminDashboard = async () => (await api.get("/admin/dashboard")).data;
export const getAdminUsers = async () => (await api.get("/admin/users")).data;
export const getAdminUserDetail = async (userId) => (await api.get(`/admin/users/${userId}`)).data;
export const getAdminAssessments = async () => (await api.get("/admin/assessments")).data;
export const updateUserBlockStatus = async (userId, isBlocked) => (await api.patch("/admin/users", { user_id: userId, is_blocked: isBlocked })).data;
export const getAdminAppointments = async () => (await api.get("/admin/appointments")).data;
export const updateAdminAppointment = async (appointmentId, status) => (await api.patch("/admin/appointments", { appointment_id: appointmentId, status })).data;
export const getAdminSymptoms = async () => (await api.get("/admin/symptoms")).data;
export const getAdminMedications = async () => (await api.get("/admin/medications")).data;
export const getAdminReports = async () => (await api.get("/admin/reports")).data;
export const getAdminInsurance = async () => (await api.get("/admin/insurance")).data;
export const getAdminLogs = async () => (await api.get("/admin/logs")).data;
export const getAdminAnalytics = async () => (await api.get("/admin/analytics")).data;
export const getAdminAlerts = async () => (await api.get("/admin/alerts")).data;
export const getAdminSystemControl = async () => (await api.get("/admin/system-control")).data;
export const updateAdminSystemControl = async (payload) => (await api.patch("/admin/system-control", payload)).data;

export default api;

