import { useEffect, useMemo, useState } from "react";
import AppIcon from "../components/AppIcon";
import PageHeader from "../components/PageHeader";
import { createAppointment, getAppointments, getNearbyHospitals } from "../services/api";

export default function UserAppointmentsPage() {
  const [items, setItems] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [locationLabel, setLocationLabel] = useState("Using your registered location...");
  const [hospitalError, setHospitalError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ hospital_name: "", hospital_address: "", appointment_date: "", appointment_time: "", notes: "" });

  const load = async () => setItems(await getAppointments());
  useEffect(() => { load(); }, []);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        setHospitalError("");
        const response = await getNearbyHospitals();
        const hospitalItems = response.hospitals || [];
        setHospitals(hospitalItems);
        setSelectedHospital(hospitalItems[0] || null);
        setLocationLabel(response.location ? `Hospitals near ${response.location}` : "Hospitals near your registered location");
        if (hospitalItems.length) {
          setForm((current) => ({
            ...current,
            hospital_name: current.hospital_name || hospitalItems[0].name,
            hospital_address: current.hospital_address || hospitalItems[0].address,
          }));
        } else {
          setHospitalError("No nearby hospitals were generated for your saved location. Update your location in profile and try again.");
        }
      } catch (error) {
        setHospitals([]);
        setSelectedHospital(null);
        setHospitalError(error.response?.data?.detail || "Unable to load nearby hospitals right now.");
      }
    };

    fetchHospitals();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");

    if (!form.hospital_name || !form.appointment_date || !form.appointment_time) {
      setSubmitError("Please choose a hospital and select both date and time before submitting.");
      return;
    }

    try {
      setSubmitting(true);
      await createAppointment(form);
      setSubmitSuccess("Appointment request sent successfully.");
      setForm({ hospital_name: "", hospital_address: "", appointment_date: "", appointment_time: "", notes: "" });
      load();
    } catch (error) {
      setSubmitError(error.response?.data?.detail || "Unable to send appointment request. Make sure the backend server is running.");
    } finally {
      setSubmitting(false);
    }
  };

  const mapLink = useMemo(() => {
    if (!selectedHospital?.location) {
      return null;
    }
    return `https://www.google.com/maps/search/?api=1&query=${selectedHospital.location.lat},${selectedHospital.location.lng}`;
  }, [selectedHospital]);

  return (
    <>
      <PageHeader badge="Smart Scheduling" title="Appointment Scheduling" description="Choose from nearby hospital recommendations based on the location saved in your registration profile." />
      <div className="panel glossy-card">
        <div className="section-title">
          <span>Nearby Hospitals</span>
          <span className="muted">{locationLabel}</span>
        </div>
        {hospitalError ? <p className="error-text">{hospitalError}</p> : null}
        <div className="hospital-rail">
          {hospitals.map((hospital) => (
            <button
              type="button"
              className={`hospital-card${selectedHospital?.place_id === hospital.place_id ? " selected" : ""}`}
              key={hospital.place_id || hospital.name}
              onClick={() => {
                setSelectedHospital(hospital);
                setForm({ ...form, hospital_name: hospital.name, hospital_address: hospital.address });
              }}
            >
              <div className="hospital-card-art">
                <AppIcon name="hospital" size={22} />
              </div>
              <strong>{hospital.name}</strong>
              <span>{hospital.address}</span>
              <div className="hospital-meta-row">
                <span><AppIcon name="location" size={14} /> {hospital.distance_km} km</span>
                <span><AppIcon name="star" size={14} /> {hospital.rating || "N/A"}</span>
              </div>
            </button>
          ))}
        </div>
        {!hospitalError && !hospitals.length ? <p className="muted">Generating nearby hospital recommendations...</p> : null}
      </div>
      <div className="premium-grid-two" style={{ marginTop: 18 }}>
        <div className="panel glossy-card">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="field"><label>Hospital</label><input value={form.hospital_name} onChange={(e) => setForm({ ...form, hospital_name: e.target.value })} /></div>
              <div className="field"><label>Address</label><input value={form.hospital_address} onChange={(e) => setForm({ ...form, hospital_address: e.target.value })} /></div>
              <div className="field"><label>Date</label><input type="date" value={form.appointment_date} onChange={(e) => setForm({ ...form, appointment_date: e.target.value })} /></div>
              <div className="field"><label>Time</label><input type="time" value={form.appointment_time} onChange={(e) => setForm({ ...form, appointment_time: e.target.value })} /></div>
            </div>
            <div className="field"><label>Notes</label><textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Share symptoms, doctor preference, or appointment purpose" /></div>
            {submitError ? <p className="error-text">{submitError}</p> : null}
            {submitSuccess ? <p className="success-text">{submitSuccess}</p> : null}
            <button className="btn btn-primary" type="submit" disabled={submitting}>{submitting ? "Sending..." : "Send Appointment Request"}</button>
          </form>
        </div>
        <div className="panel glossy-card hospital-preview-panel">
          <h3 className="section-title">Hospital Preview</h3>
          {selectedHospital ? (
            <div className="summary-list">
              <div className="summary-item">
                <strong>{selectedHospital.name}</strong>
                <div>{selectedHospital.address}</div>
                <div className="hospital-meta-row"><span><AppIcon name="location" size={14} /> {selectedHospital.distance_km} km away</span><span><AppIcon name="star" size={14} /> {selectedHospital.rating || "N/A"}</span></div>
              </div>
              <div className="map-preview-card">
                <div className="map-grid-art" />
                <div className="map-pin"><AppIcon name="location" size={18} /></div>
                <span>Lat {selectedHospital.location.lat}, Lng {selectedHospital.location.lng}</span>
              </div>
              {mapLink ? <a className="btn btn-secondary" href={mapLink} target="_blank" rel="noreferrer">Open Map View</a> : null}
            </div>
          ) : <p className="muted">Select a hospital to preview location details.</p>}
        </div>
      </div>
      <div className="panel glossy-card" style={{ marginTop: 18 }}>
        <h3 className="section-title">Current Requests</h3>
        <div className="summary-list">
          {items.length ? items.map((item) => (
            <div className="summary-item focus-item" key={item.id}>
              <div className="summary-icon"><AppIcon name="appointment" size={18} /></div>
              <div>
                <strong>{item.hospital_name}</strong>
                <div>{item.appointment_date} at {item.appointment_time}</div>
                <span className="pill">{item.status}</span>
              </div>
            </div>
          )) : <p className="muted">No appointment requests yet.</p>}
        </div>
      </div>
    </>
  );
}
