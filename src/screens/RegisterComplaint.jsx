import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function LocationMarker({ setCoords }) {
    const [position, setPosition] = useState(null);

    useMapEvents({
        click(e) {
            setPosition(e.latlng);
            setCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
        },
    });

    return position ? <Marker position={position} /> : null;
}

// ── SLA preview shown right after submit ─────────────────────────────────────
const SLA_HOURS = { High: 24, Medium: 72, Low: 168 };

const SLAConfirmation = ({ priority, slaDeadline }) => {
    const hours = SLA_HOURS[priority] || 72;
    const color = priority === "High" ? "#ff4d6d" : priority === "Medium" ? "#f0b429" : "#00c48c";
    const bgColor = priority === "High" ? "#fff0f3" : priority === "Medium" ? "#fff7e0" : "#d1fae5";
    const textColor = priority === "High" ? "#9f1239" : priority === "Medium" ? "#b45309" : "#065f46";

    return (
        <div style={{
            background: bgColor, border: `1.5px solid ${color}`,
            borderRadius: 12, padding: "14px 16px", marginTop: 16
        }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: textColor, marginBottom: 8, letterSpacing: "0.3px" }}>
                ⏱ SLA ASSIGNED
            </p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <p style={{ fontSize: 13, color: textColor, margin: 0 }}>
                        <strong>{priority} priority</strong> — must resolve within <strong>{hours} hours</strong>
                    </p>
                    {slaDeadline && (
                        <p style={{ fontSize: 11, color: textColor, margin: "4px 0 0", opacity: 0.85 }}>
                            Deadline: {new Date(slaDeadline).toLocaleString("en-IN", {
                                day: "2-digit", month: "short", year: "numeric",
                                hour: "2-digit", minute: "2-digit"
                            })}
                        </p>
                    )}
                </div>
                <div style={{
                    background: color, color: "#fff",
                    borderRadius: 8, padding: "4px 10px",
                    fontSize: 12, fontWeight: 700
                }}>
                    {hours}h SLA
                </div>
            </div>
        </div>
    );
};

const RegisterComplaint = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [category, setCategory] = useState("");
    const [location, setLocation] = useState("");
    const [details, setDetails] = useState("");
    const [file, setFile] = useState(null);
    const [coords, setCoords] = useState({ lat: null, lng: null });

    // SLA confirmation state (shown after submit)
    const [submittedSLA, setSubmittedSLA] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ── Duplicate detection ───────────────────────────────────────────────────
    const [duplicates, setDuplicates] = useState([]);
    const [showDuplicateModal, setShowDuplicateModal] = useState(false);
    const [upvotedIds, setUpvotedIds] = useState(new Set());
    const [upvotingId, setUpvotingId] = useState(null);
    const duplicateTimerRef = React.useRef(null);

    // Debounced duplicate check — fires 1.2s after the user stops typing details
    React.useEffect(() => {
        clearTimeout(duplicateTimerRef.current);
        if (!details.trim() || details.length < 20 || !location.trim()) return;

        duplicateTimerRef.current = setTimeout(async () => {
            try {
                const params = new URLSearchParams({ text: details, location });
                if (category) params.set("category", category);
                const token = localStorage.getItem("token");
                const res = await fetch(
                    `http://localhost:5000/api/complaints/duplicates?${params}`,
                    { headers: token ? { Authorization: `Bearer ${token}` } : {} }
                );
                const data = await res.json();
                if (data.duplicates?.length) {
                    setDuplicates(data.duplicates);
                    setShowDuplicateModal(true);
                } else {
                    setDuplicates([]);
                    setShowDuplicateModal(false);
                }
            } catch { /* silent fail */ }
        }, 1200);

        return () => clearTimeout(duplicateTimerRef.current);
    }, [details, location, category]);

    const handleUpvote = async (complaintId) => {
        if (upvotedIds.has(complaintId)) return;
        setUpvotingId(complaintId);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(
                `http://localhost:5000/api/complaints/${complaintId}/upvote`,
                { method: "POST", headers: { Authorization: `Bearer ${token}` } }
            );
            const data = await res.json();
            if (!data.alreadyVoted) {
                setUpvotedIds(prev => new Set([...prev, complaintId]));
                setDuplicates(prev =>
                    prev.map(d => d.id === complaintId
                        ? { ...d, upvotes: data.upvotes }
                        : d
                    )
                );
            }
        } catch { /* silent */ }
        setUpvotingId(null);
    };


    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setCoords({ lat: latitude, lng: longitude });

                try {
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
                    );
                    const data = await res.json();

                    const area =
                        data.address.suburb ||
                        data.address.village ||
                        data.address.town ||
                        data.address.city ||
                        "";

                    const city =
                        data.address.city ||
                        data.address.state_district ||
                        data.address.state ||
                        "";

                    setLocation(`${area}, ${city}`);
                } catch (err) {
                    console.error(err);
                    setLocation(`Lat: ${latitude}, Lng: ${longitude}`);
                }
            },
            (error) => {
                console.error(error);
                alert("Unable to retrieve your location");
            }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append("category", category);
        formData.append("location", location);
        formData.append("details", details);
        if (file) formData.append("file", file);
        formData.append("lat", coords.lat);
        formData.append("lng", coords.lng);

        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:5000/api/complaints", {
                method: "POST",
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                body: formData
            });

            const data = await res.json();

            if (data.complaintId) {
                // Show SLA confirmation for 3 seconds, then navigate
                setSubmittedSLA({
                    priority: data.priority,
                    slaDeadline: data.slaDeadline,
                    complaintId: data.complaintId
                });
                setTimeout(() => navigate(`/track/${data.complaintId}`), 3000);
            } else {
                alert(data.message || "Submitted");
            }

        } catch (error) {
            console.error(error);
            alert("Error submitting complaint");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col">

            {/* Navbar */}
            <header className="sticky top-0 z-50 border-b bg-white dark:bg-slate-900 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-3xl">
                        account_balance
                    </span>
                    <h1 className="font-bold text-lg">Complaint Setu</h1>
                </div>
                <div className="flex items-center gap-3">
                    <button className="p-2 rounded-full bg-slate-100 dark:bg-slate-800">
                        <span className="material-symbols-outlined">notifications</span>
                    </button>
                    <div className="w-9 h-9 bg-blue-100 text-blue-700 flex items-center justify-center rounded-full font-bold">
                        JD
                    </div>
                </div>
            </header>

            {/* Page Content */}
            <main className="flex flex-1 max-w-7xl mx-auto w-full gap-8 p-8">

                {/* Sidebar */}
                <aside className="w-60 flex flex-col gap-2">
                    <button className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg">
                        <span className="material-symbols-outlined text-sm">edit_note</span>
                        New Complaint
                    </button>
                    <div onClick={() => navigate('/')} className="flex items-center gap-3 text-slate-600 dark:text-slate-400 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                        <span className="material-symbols-outlined text-sm">home</span>
                        Dashboard
                    </div>
                    <div onClick={() => navigate('/my-complaints')} className="flex items-center gap-3 text-slate-600 dark:text-slate-400 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                        <span className="material-symbols-outlined text-sm">list_alt</span>
                        My Complaints
                    </div>
                    <div onClick={() => navigate('/login')} className="flex items-center gap-3 text-slate-600 dark:text-slate-400 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                        <span className="material-symbols-outlined text-sm">person</span>
                        Profile Settings
                    </div>
                    <div className="border-t my-3"></div>
                    <div
                        onClick={() => { logout(); navigate("/login"); }}
                        className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-sm">logout</span>
                        Logout
                    </div>
                </aside>

                {/* Complaint Form */}
                <div className="flex-1 max-w-xl">
                    <h1 className="text-2xl font-bold mb-1">Register a Complaint</h1>
                    <p className="text-sm text-slate-500 mb-6">
                        Provide accurate details to help resolve the issue efficiently.
                    </p>

                    <div className="bg-white dark:bg-slate-900 border rounded-xl shadow-sm">
                        <form className="p-6 space-y-5" onSubmit={handleSubmit}>

                            {/* Category */}
                            <div>
                                <label className="text-sm font-semibold">Select Category</label>
                                <select
                                    className="w-full mt-2 border rounded-lg px-3 py-2"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    required
                                >
                                    <option value="">Choose a category</option>
                                    <option>Water Issues</option>
                                    <option>Electricity</option>
                                    <option>Roads & Potholes</option>
                                    <option>Sanitation</option>
                                    <option>Street Lights</option>
                                </select>
                            </div>

                            {/* Location */}
                            <div>
                                <label className="text-sm font-semibold">Location</label>
                                <input
                                    type="text"
                                    placeholder="Enter area name or landmark"
                                    className="w-full mt-2 border rounded-lg px-3 py-2"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="text-xs text-blue-600 mt-2 flex items-center gap-1"
                                    onClick={handleUseCurrentLocation}
                                >
                                    <span className="material-symbols-outlined text-sm">my_location</span>
                                    Use Current Location
                                </button>
                            </div>

                            {/* Details */}
                            <div>
                                <label className="text-sm font-semibold">Complaint Details</label>
                                <textarea
                                    rows="4"
                                    placeholder="Describe the issue..."
                                    className="w-full mt-2 border rounded-lg px-3 py-2"
                                    value={details}
                                    onChange={(e) => setDetails(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Upload & Map */}
                            <div>
                                <label className="text-sm font-semibold">Upload Photo/Video</label>
                                <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center text-sm text-slate-500 relative">
                                    {file ? (
                                        <div>Selected File: <strong>{file.name}</strong></div>
                                    ) : (
                                        <div>
                                            Click below to upload
                                            <div className="text-xs mt-1">PNG, JPG or MP4 (MAX 10MB)</div>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/png,image/jpeg,video/mp4"
                                        className="mt-2"
                                        id="file-upload"
                                        onChange={handleFileChange}
                                    />
                                    {file && (
                                        <p className="text-sm text-green-600 mt-1">Selected: {file.name}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-semibold">Pin on Map</label>
                                <MapContainer
                                    center={coords.lat ? [coords.lat, coords.lng] : [23.2599, 77.4126]}
                                    zoom={13}
                                    style={{ height: "200px", width: "100%" }}
                                >
                                    <TileLayer
                                        attribution="&copy; OpenStreetMap contributors"
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    {coords.lat && <Marker position={[coords.lat, coords.lng]} />}
                                    <LocationMarker setCoords={setCoords} />
                                </MapContainer>
                            </div>

                            {/* ── Duplicate Complaints Modal ───────────────────────────────── */}
                            {showDuplicateModal && duplicates.length > 0 && (
                                <div style={{
                                    background: "#fffbeb",
                                    border: "1.5px solid #f59e0b",
                                    borderRadius: 12,
                                    padding: "16px 18px",
                                    marginBottom: 8
                                }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                        <p style={{ fontWeight: 700, fontSize: 13, color: "#92400e", margin: 0 }}>
                                            ⚠️ Similar complaints already exist in your area
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => setShowDuplicateModal(false)}
                                            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#92400e", lineHeight: 1 }}
                                        >✕</button>
                                    </div>
                                    <p style={{ fontSize: 12, color: "#b45309", margin: "6px 0 12px" }}>
                                        Upvoting an existing complaint prioritises it faster than filing a new one. You can still submit if your issue is different.
                                    </p>

                                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                        {duplicates.map(d => (
                                            <div key={d.id} style={{
                                                background: "#fff",
                                                border: "1px solid #fcd34d",
                                                borderRadius: 8,
                                                padding: "10px 12px",
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                gap: 12
                                            }}>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                        {d.text.length > 80 ? d.text.slice(0, 80) + "…" : d.text}
                                                    </p>
                                                    <p style={{ margin: "3px 0 0", fontSize: 11, color: "#64748b" }}>
                                                        📍 {d.location} &nbsp;·&nbsp;
                                                        <span style={{ color: "#f59e0b", fontWeight: 600 }}>
                                                            {Math.round(d.similarity * 100)}% similar
                                                        </span>
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    disabled={upvotedIds.has(d.id) || upvotingId === d.id}
                                                    onClick={() => handleUpvote(d.id)}
                                                    style={{
                                                        flexShrink: 0,
                                                        background: upvotedIds.has(d.id) ? "#d1fae5" : "#1e40af",
                                                        color: upvotedIds.has(d.id) ? "#065f46" : "#fff",
                                                        border: "none",
                                                        borderRadius: 8,
                                                        padding: "6px 12px",
                                                        fontSize: 12,
                                                        fontWeight: 700,
                                                        cursor: upvotedIds.has(d.id) ? "default" : "pointer",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 5,
                                                        minWidth: 70
                                                    }}
                                                >
                                                    {upvotingId === d.id
                                                        ? "…"
                                                        : upvotedIds.has(d.id)
                                                            ? `✓ ${d.upvotes}`
                                                            : `▲ ${d.upvotes}`}
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <p style={{ fontSize: 11, color: "#92400e", marginTop: 10, marginBottom: 0 }}>
                                        Your issue is different? Go ahead and submit below.
                                    </p>
                                </div>
                            )}

                            {/* SLA hint BEFORE submit */}
                            <div className="bg-slate-50 border rounded-lg px-4 py-3 text-sm text-slate-600">
                                <p className="font-semibold mb-1 text-slate-700">SLA Resolution Times</p>
                                <div className="flex gap-4 text-xs">
                                    <span style={{ color: "#ff4d6d" }}>🔴 High — 24h</span>
                                    <span style={{ color: "#f0b429" }}>🟡 Medium — 72h</span>
                                    <span style={{ color: "#00c48c" }}>🟢 Low — 7 days</span>
                                </div>
                                <p className="text-xs text-slate-400 mt-1">Priority is set automatically by our AI model.</p>
                            </div>

                            {/* SLA Confirmation after submit */}
                            {submittedSLA && (
                                <SLAConfirmation
                                    priority={submittedSLA.priority}
                                    slaDeadline={submittedSLA.slaDeadline}
                                />
                            )}

                            {/* Success redirect notice */}
                            {submittedSLA && (
                                <div className="text-center text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg py-3">
                                    ✅ Complaint submitted! Redirecting to tracker...
                                </div>
                            )}

                            {/* Buttons */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !!submittedSLA}
                                    className="flex-1 bg-blue-700 text-white py-3 rounded-lg font-semibold disabled:opacity-60"
                                >
                                    {isSubmitting ? "Submitting..." : submittedSLA ? "Submitted ✓" : "Submit Complaint"}
                                </button>
                                <button
                                    type="button"
                                    className="px-6 py-3 bg-slate-100 rounded-lg"
                                    onClick={() => {
                                        setCategory(""); setLocation(""); setDetails("");
                                        setFile(null); setSubmittedSLA(null);
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right Sidebar */}
                <aside className="w-72 flex flex-col gap-5">
                    <div className="bg-blue-50 border border-blue-200 p-5 rounded-xl">
                        <h3 className="font-semibold text-blue-700 mb-2">Helpful Tip</h3>
                        <p className="text-sm text-slate-600">
                            Adding a clear photo of the issue helps field workers identify
                            the exact location and nature of the problem.
                        </p>
                    </div>
                    <div className="bg-white border rounded-xl p-5">
                        <h3 className="font-semibold mb-3">SLA Timeline</h3>
                        <ul className="space-y-2 text-sm">
                            <li style={{ color: "#ff4d6d" }}>🔴 High priority — resolved within 24h</li>
                            <li style={{ color: "#f0b429" }}>🟡 Medium priority — resolved within 72h</li>
                            <li style={{ color: "#00c48c" }}>🟢 Low priority — resolved within 7 days</li>
                        </ul>
                        <p className="text-xs text-slate-400 mt-3">
                            Priority is assigned automatically by our AI classifier. Breached SLAs are escalated to the department head.
                        </p>
                    </div>
                    <div className="bg-white border rounded-xl p-5">
                        <h3 className="font-semibold mb-3">Typical Timeline</h3>
                        <ul className="space-y-2 text-sm">
                            <li>🟢 Submission — Instant</li>
                            <li>🔵 Verification — 24-48 Hours</li>
                            <li>⚪ Resolution — 3-5 Business Days</li>
                        </ul>
                    </div>
                </aside>
            </main>

            <footer className="text-center text-sm text-slate-500 border-t py-4">
                © 2024 Complaint Setu - Government Citizens Connect Portal
            </footer>
        </div>
    );
};

export default RegisterComplaint;