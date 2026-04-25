import { useState } from "react";

const COLORS = {
    navy: "#0a1628", sky: "#1e6bff", gold: "#f0b429", mint: "#00c48c",
    rose: "#ff4d6d", surface: "#f4f6fb", card: "#ffffff", border: "#e2e8f4",
    text: "#0a1628", muted: "#6b7a99", purple: "#7f77dd",
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
  .dp-fade { animation: dpFadeUp 0.45s ease both; }
  .dp-fade:nth-child(1){animation-delay:.05s}
  .dp-fade:nth-child(2){animation-delay:.10s}
  .dp-fade:nth-child(3){animation-delay:.15s}
  .dp-fade:nth-child(4){animation-delay:.20s}
  .dp-fade:nth-child(5){animation-delay:.25s}
  .dp-fade:nth-child(6){animation-delay:.30s}
  @keyframes dpFadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  .dp-card { transition: transform .2s, box-shadow .2s; }
  .dp-card:hover { transform: translateY(-3px); box-shadow: 0 10px 32px rgba(10,22,40,.1); }
  .dp-add:hover { background: #eff6ff !important; border-color: #1e6bff !important; }
  .dp-pulse { animation: dpPulse 2s infinite; }
  @keyframes dpPulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
  .dp-modal-backdrop { animation: dpFadeIn .2s ease; }
  @keyframes dpFadeIn { from{opacity:0} to{opacity:1} }
`;

const NAV_ITEMS = [
    { icon: "📋", label: "Complaints" },
    { icon: "🏛️", label: "Departments" },
    { icon: "📊", label: "Stats" },
    { icon: "⚙️", label: "Settings" },
];

const BottomNav = ({ activeNav, setActiveNav }) => (
    <nav style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "rgba(255,255,255,.92)", backdropFilter: "blur(16px)",
        borderTop: "1px solid #e2e8f4", display: "flex",
        justifyContent: "space-around", padding: "8px 0 12px",
        boxShadow: "0 -4px 20px rgba(10,22,40,.08)", zIndex: 50
    }}>
        {NAV_ITEMS.map(({ icon, label }) => {
            const active = activeNav === label;
            return (
                <button key={label} onClick={() => setActiveNav(label)} style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    gap: 3, background: "none", border: "none", padding: "4px 16px",
                    color: active ? "#1e6bff" : "#6b7a99", cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif"
                }}>
                    <span style={{ fontSize: active ? 20 : 18, transition: "font-size .15s" }}>{icon}</span>
                    <span style={{ fontSize: 10, fontWeight: active ? 600 : 400, letterSpacing: ".3px" }}>{label}</span>
                    {active && <span style={{ width: 16, height: 2, borderRadius: 2, background: "#1e6bff" }} />}
                </button>
            );
        })}
    </nav>
);

const DEPARTMENTS = [
    {
        id: 1, name: "Water Supply", icon: "💧", iconBg: "#e6f1fb",
        description: "Handles water distribution, leakage, and quality complaints across the city.",
        accentColor: COLORS.sky, barColor: COLORS.mint,
        total: 82, pending: 28, inProgress: 12, resolved: 54, rejected: 2,
        officer: { name: "Rahul Kumar", role: "Department Head", initials: "RK", avatarBg: "#e6f1fb", avatarColor: COLORS.sky },
    },
    {
        id: 2, name: "Electricity Board", icon: "⚡", iconBg: "#fff7e0",
        description: "Manages power outages, meter issues, and street lighting complaints.",
        accentColor: COLORS.gold, barColor: COLORS.gold,
        total: 54, pending: 18, inProgress: 8, resolved: 36, rejected: 4,
        officer: { name: "Priya Sharma", role: "Department Head", initials: "PS", avatarBg: "#fff7e0", avatarColor: "#b45309" },
    },
    {
        id: 3, name: "Roads & Infrastructure", icon: "🛣️", iconBg: "#f4f6fb",
        description: "Oversees pothole repairs, road damage, and construction-related issues.",
        accentColor: COLORS.purple, barColor: COLORS.purple,
        total: 65, pending: 31, inProgress: 15, resolved: 34, rejected: 5,
        officer: { name: "Amit Joshi", role: "Department Head", initials: "AJ", avatarBg: "#f4f6fb", avatarColor: COLORS.muted },
    },
    {
        id: 4, name: "Sanitation", icon: "🗑️", iconBg: "#d1fae5",
        description: "Responsible for waste collection, garbage dumps, and cleanliness drives.",
        accentColor: COLORS.mint, barColor: COLORS.mint,
        total: 38, pending: 8, inProgress: 4, resolved: 30, rejected: 1,
        officer: { name: "Neha Patel", role: "Department Head", initials: "NP", avatarBg: "#d1fae5", avatarColor: "#065f46" },
    },
    {
        id: 5, name: "Street Lighting", icon: "💡", iconBg: "#ffe4e6",
        description: "Handles broken streetlights, dark zones, and public lighting maintenance.",
        accentColor: COLORS.rose, barColor: COLORS.sky,
        total: 22, pending: 4, inProgress: 2, resolved: 18, rejected: 0,
        officer: { name: "Vikram Tiwari", role: "Department Head", initials: "VT", avatarBg: "#ffe4e6", avatarColor: "#9f1239" },
    },
];

const StatChip = ({ label, value, color }) => (
    <div style={{ background: COLORS.surface, borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
        <p style={{ fontSize: 20, fontWeight: 600, fontFamily: "'DM Sans',sans-serif", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.3px", lineHeight: 1, color, margin: "0 0 3px" }}>{value}</p>
        <p style={{ fontSize: 10, color: COLORS.muted, textTransform: "uppercase", letterSpacing: "0.3px", margin: 0 }}>{label}</p>
    </div>
);

const DeptModal = ({ dept, onClose }) => {
    const resRate = Math.round((dept.resolved / dept.total) * 100);
    return (
        <div className="dp-modal-backdrop" onClick={onClose} style={{
            position: "fixed", inset: 0, background: "rgba(10,22,40,.5)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
            backdropFilter: "blur(4px)"
        }}>
            <div onClick={e => e.stopPropagation()} style={{
                background: COLORS.card, borderRadius: 20, width: "90%", maxWidth: 480,
                boxShadow: "0 20px 60px rgba(10,22,40,.25)", overflow: "hidden"
            }}>
                <div style={{ height: 5, background: dept.accentColor }} />
                <div style={{ padding: 28 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                        <div style={{ width: 52, height: 52, borderRadius: 14, background: dept.iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
                            {dept.icon}
                        </div>
                        <div>
                            <p style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 20, color: COLORS.navy, margin: "0 0 3px" }}>{dept.name}</p>
                            <p style={{ fontSize: 12, color: COLORS.muted, margin: 0 }}>{dept.description}</p>
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 20 }}>
                        <StatChip label="Total"    value={dept.total}      color={COLORS.sky} />
                        <StatChip label="Pending"  value={dept.pending}    color="#b45309" />
                        <StatChip label="Progress" value={dept.inProgress} color={COLORS.purple} />
                        <StatChip label="Resolved" value={dept.resolved}   color={COLORS.mint} />
                    </div>

                    <div style={{ marginBottom: 20 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                            <span style={{ fontSize: 13, color: COLORS.muted }}>Resolution rate</span>
                            <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.navy }}>{resRate}%</span>
                        </div>
                        <div style={{ background: COLORS.surface, borderRadius: 99, height: 8, overflow: "hidden" }}>
                            <div style={{ width: `${resRate}%`, height: "100%", background: dept.barColor, borderRadius: 99, transition: "width 0.8s ease" }} />
                        </div>
                    </div>

                    <div style={{ background: COLORS.surface, borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                        <div style={{ width: 40, height: 40, borderRadius: "50%", background: dept.officer.avatarBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, color: dept.officer.avatarColor, flexShrink: 0 }}>
                            {dept.officer.initials}
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 14, fontWeight: 500, color: COLORS.navy, margin: "0 0 2px" }}>{dept.officer.name}</p>
                            <p style={{ fontSize: 12, color: COLORS.muted, margin: 0 }}>{dept.officer.role}</p>
                        </div>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: "#065f46", background: "#d1fae5", padding: "4px 10px", borderRadius: 99 }}>
                            <span className="dp-pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.mint, display: "inline-block" }} />
                            Active
                        </span>
                    </div>

                    <button onClick={onClose} style={{ width: "100%", padding: "12px 0", borderRadius: 12, border: "none", background: COLORS.navy, color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

const DeptCard = ({ dept, onView }) => {
    const resRate = Math.round((dept.resolved / dept.total) * 100);
    return (
        <div className="dp-card dp-fade" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 24, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: dept.accentColor }} />

            <div style={{ width: 48, height: 48, borderRadius: 14, background: dept.iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 14 }}>
                {dept.icon}
            </div>

            <p style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 16, color: COLORS.navy, margin: "0 0 6px" }}>{dept.name}</p>
            <p style={{ fontSize: 12, color: COLORS.muted, margin: "0 0 16px", lineHeight: 1.5 }}>{dept.description}</p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 16 }}>
                <StatChip label="Total"    value={dept.total}    color={COLORS.sky} />
                <StatChip label="Pending"  value={dept.pending}  color="#b45309" />
                <StatChip label="Resolved" value={dept.resolved} color={COLORS.mint} />
            </div>

            <div style={{ background: COLORS.surface, borderRadius: 99, height: 6, overflow: "hidden", marginBottom: 6 }}>
                <div style={{ width: `${resRate}%`, height: "100%", background: dept.barColor, borderRadius: 99 }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: COLORS.muted, marginBottom: 16 }}>
                <span>Resolution rate</span>
                <span style={{ fontWeight: 600, color: COLORS.navy }}>{resRate}%</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 14, borderTop: `1px solid ${COLORS.surface}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: dept.officer.avatarBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: dept.officer.avatarColor }}>
                        {dept.officer.initials}
                    </div>
                    <div>
                        <p style={{ fontSize: 12, fontWeight: 500, color: COLORS.navy, margin: 0 }}>{dept.officer.name}</p>
                        <p style={{ fontSize: 10, color: COLORS.muted, margin: 0 }}>{dept.officer.role}</p>
                    </div>
                </div>
                <button onClick={() => onView(dept)} style={{ padding: "7px 14px", borderRadius: 10, border: `1.5px solid ${COLORS.sky}`, background: "#eff6ff", color: COLORS.sky, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                    View Details
                </button>
            </div>
        </div>
    );
};

export default function DepartmentsPage({ activeNav, setActiveNav }) {
    const [selected, setSelected] = useState(null);

    const totalAssigned = DEPARTMENTS.reduce((s, d) => s + d.total, 0);
    const totalResolved = DEPARTMENTS.reduce((s, d) => s + d.resolved, 0);
    const avgResRate = Math.round((totalResolved / totalAssigned) * 100);

    return (
        <>
            <style>{CSS}</style>
            <div style={{ background: COLORS.surface, minHeight: "100vh", fontFamily: "'DM Sans',sans-serif", paddingBottom: 80 }}>

                <div style={{ padding: "24px 24px 0" }}>
                    <h1 style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 26, color: COLORS.navy, margin: "0 0 4px" }}>Departments</h1>
                    <p style={{ fontSize: 13, color: COLORS.muted, margin: "0 0 24px" }}>Manage city departments and their complaint workloads</p>
                </div>

                {/* Summary row */}
                <div style={{ padding: "0 24px", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 }}>
                    {[
                        { label: "Total Departments", value: DEPARTMENTS.length, color: COLORS.sky },
                        { label: "Total Assigned",    value: totalAssigned,       color: "#b45309" },
                        { label: "Avg. Resolution",   value: `${avgResRate}%`,    color: COLORS.mint },
                        { label: "Active Officers",   value: DEPARTMENTS.length,  color: COLORS.purple },
                    ].map(({ label, value, color }) => (
                        <div key={label} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "18px 20px" }}>
                            <p style={{ fontSize: 30, fontWeight: 600, fontFamily: "'DM Sans',sans-serif", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.5px", lineHeight: 1, color, margin: "0 0 6px" }}>{value}</p>
                            <p style={{ fontSize: 12, color: COLORS.muted, textTransform: "uppercase", letterSpacing: "0.5px", margin: 0 }}>{label}</p>
                        </div>
                    ))}
                </div>

                {/* Department grid */}
                <div style={{ padding: "0 24px", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
                    {DEPARTMENTS.map(dept => (
                        <DeptCard key={dept.id} dept={dept} onView={setSelected} />
                    ))}

                    <div className="dp-add dp-fade" style={{ background: "#fafbfd", border: "1.5px dashed #c7d2e8", borderRadius: 16, padding: 24, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 280, cursor: "pointer", transition: "all .2s" }}>
                        <div style={{ width: 48, height: 48, borderRadius: 14, background: "#e6f1fb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: COLORS.sky, marginBottom: 14 }}>+</div>
                        <p style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 15, color: COLORS.sky, margin: "0 0 6px" }}>Add Department</p>
                        <p style={{ fontSize: 12, color: COLORS.muted, textAlign: "center", maxWidth: 160, lineHeight: 1.5, margin: 0 }}>Create a new department to assign complaints</p>
                    </div>
                </div>

                {selected && <DeptModal dept={selected} onClose={() => setSelected(null)} />}
            </div>

            {/* ✅ Bottom nav always visible */}
            <BottomNav activeNav={activeNav} setActiveNav={setActiveNav} />
        </>
    );
}
