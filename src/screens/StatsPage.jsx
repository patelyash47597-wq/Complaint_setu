import { useEffect, useRef, useState } from "react";

const COLORS = {
    navy: "#0a1628", sky: "#1e6bff", gold: "#f0b429", mint: "#00c48c",
    rose: "#ff4d6d", surface: "#f4f6fb", card: "#ffffff", border: "#e2e8f4",
    text: "#0a1628", muted: "#6b7a99", purple: "#7f77dd",
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
  .sp-fade { animation: spFadeUp 0.45s ease both; }
  .sp-fade:nth-child(1){animation-delay:.05s}
  .sp-fade:nth-child(2){animation-delay:.10s}
  .sp-fade:nth-child(3){animation-delay:.15s}
  .sp-fade:nth-child(4){animation-delay:.20s}
  @keyframes spFadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  .sp-card { transition: transform .2s, box-shadow .2s; }
  .sp-card:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(10,22,40,.1); }
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

const MetricCard = ({ label, value, color, sub, delay = 0 }) => (
    <div className="sp-card sp-fade" style={{
        background: COLORS.card, border: `1px solid ${COLORS.border}`,
        borderRadius: 16, padding: "22px 24px", position: "relative",
        overflow: "hidden", animationDelay: `${delay}s`
    }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: color }} />
        <p style={{ fontSize: 32, fontWeight: 600, fontFamily: "'DM Sans',sans-serif", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.5px", lineHeight: 1, color, margin: "0 0 6px" }}>{value}</p>
        <p style={{ fontSize: 12, color: COLORS.muted, textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 4px" }}>{label}</p>
        {sub && <p style={{ fontSize: 11, color: COLORS.muted, margin: 0 }}>{sub}</p>}
    </div>
);

const BarRow = ({ label, value, max, color }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <span style={{ fontSize: 12, color: COLORS.text, width: 120, flexShrink: 0 }}>{label}</span>
        <div style={{ flex: 1, background: COLORS.surface, borderRadius: 99, height: 8, overflow: "hidden" }}>
            <div style={{ width: `${Math.round((value / max) * 100)}%`, height: "100%", background: color, borderRadius: 99, transition: "width 1s ease" }} />
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.text, width: 28, textAlign: "right" }}>{value}</span>
    </div>
);

export default function StatsPage({ complaints = [], activeNav, setActiveNav }) {
    const trendRef = useRef(null);
    const donutRef = useRef(null);
    const [chartsLoaded, setChartsLoaded] = useState(false);

    const total      = complaints.length;
    const pending    = complaints.filter(c => (c.status || "").toLowerCase() === "pending").length;
    const inProgress = complaints.filter(c => (c.status || "").toLowerCase() === "in progress").length;
    const resolved   = complaints.filter(c => (c.status || "").toLowerCase() === "resolved").length;
    const rejected   = complaints.filter(c => (c.status || "").toLowerCase() === "rejected").length;

    const byCat = {};
    complaints.forEach(c => { if (c.category) byCat[c.category] = (byCat[c.category] || 0) + 1; });
    const catEntries = Object.entries(byCat).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const catMax = catEntries[0]?.[1] || 1;
    const catColors = [COLORS.sky, COLORS.gold, COLORS.mint, COLORS.rose, COLORS.purple];

    const byPriority = { High: 0, Medium: 0, Low: 0 };
    complaints.forEach(c => { if (c.priority && byPriority[c.priority] !== undefined) byPriority[c.priority]++; });
    const priorityTotal = byPriority.High + byPriority.Medium + byPriority.Low || 1;

    const recentActivity = [...complaints]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 4);

    const monthLabels = [];
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        monthLabels.push(d.toLocaleString("default", { month: "short" }));
        monthlyData.push(complaints.filter(c => {
            const cd = new Date(c.createdAt);
            return cd.getFullYear() === d.getFullYear() && cd.getMonth() === d.getMonth();
        }).length);
    }

    useEffect(() => {
        if (window.Chart) { setChartsLoaded(true); return; }
        const s = document.createElement("script");
        s.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js";
        s.onload = () => setChartsLoaded(true);
        document.head.appendChild(s);
    }, []);

    useEffect(() => {
        if (!chartsLoaded || !window.Chart) return;

        if (trendRef.current) {
            const ex = window.Chart.getChart(trendRef.current);
            if (ex) ex.destroy();
            new window.Chart(trendRef.current, {
                type: "bar",
                data: {
                    labels: monthLabels,
                    datasets: [{ label: "Complaints", data: monthlyData, backgroundColor: "#e6f1fb", borderColor: COLORS.sky, borderWidth: 2, borderRadius: 6 }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { grid: { display: false }, ticks: { font: { size: 11 }, color: COLORS.muted } },
                        y: { grid: { color: COLORS.surface }, ticks: { font: { size: 11 }, color: COLORS.muted } }
                    }
                }
            });
        }

        if (donutRef.current) {
            const ex2 = window.Chart.getChart(donutRef.current);
            if (ex2) ex2.destroy();
            new window.Chart(donutRef.current, {
                type: "doughnut",
                data: {
                    labels: ["Pending", "In Progress", "Resolved", "Rejected"],
                    datasets: [{ data: [pending, inProgress, resolved, rejected], backgroundColor: [COLORS.sky, COLORS.gold, COLORS.mint, COLORS.rose], borderWidth: 0, hoverOffset: 4 }]
                },
                options: { responsive: true, maintainAspectRatio: false, cutout: "70%", plugins: { legend: { display: false } } }
            });
        }
    }, [chartsLoaded, total, pending, inProgress, resolved, rejected]);

    const actDotColor = (s = "") => {
        const sl = s.toLowerCase();
        if (sl === "resolved") return COLORS.mint;
        if (sl === "pending") return COLORS.gold;
        if (sl === "in progress") return COLORS.sky;
        return COLORS.rose;
    };

    const fmtTime = (iso) => {
        if (!iso) return "";
        const diff = Date.now() - new Date(iso).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };

    return (
        <>
            <style>{CSS}</style>
            <div style={{ background: COLORS.surface, minHeight: "100vh", fontFamily: "'DM Sans',sans-serif", paddingBottom: 80 }}>

                <div style={{ padding: "24px 24px 0" }}>
                    <h1 style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 26, color: COLORS.navy, margin: "0 0 4px" }}>Analytics & Stats</h1>
                    <p style={{ fontSize: 13, color: COLORS.muted, margin: "0 0 24px" }}>Overview of complaint trends and performance metrics</p>
                </div>

                {/* Metric cards */}
                <div style={{ padding: "0 24px", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
                    <MetricCard label="Total Complaints" value={total}      color={COLORS.sky}    sub="all time"        delay={0.05} />
                    <MetricCard label="Pending"          value={pending}    color="#b45309"        sub="needs attention" delay={0.10} />
                    <MetricCard label="Resolved"         value={resolved}   color={COLORS.mint}   sub="completed"       delay={0.15} />
                    <MetricCard label="In Progress"      value={inProgress} color={COLORS.purple} sub="being handled"   delay={0.20} />
                </div>

                {/* Trend + Donut */}
                <div style={{ padding: "0 24px", display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 20 }}>
                    <div className="sp-fade" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 24 }}>
                        <p style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 15, color: COLORS.navy, margin: "0 0 4px" }}>Monthly complaints trend</p>
                        <p style={{ fontSize: 12, color: COLORS.muted, margin: "0 0 20px" }}>Last 6 months — real data</p>
                        <div style={{ position: "relative", height: 220 }}>
                            <canvas ref={trendRef} role="img" aria-label="Monthly complaint bar chart">Monthly complaints.</canvas>
                        </div>
                    </div>

                    <div className="sp-fade" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 24 }}>
                        <p style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 15, color: COLORS.navy, margin: "0 0 4px" }}>Status breakdown</p>
                        <p style={{ fontSize: 12, color: COLORS.muted, margin: "0 0 16px" }}>Current distribution</p>
                        <div style={{ position: "relative", height: 160 }}>
                            <canvas ref={donutRef} role="img" aria-label="Status donut chart">Status breakdown.</canvas>
                        </div>
                        <div style={{ marginTop: 16 }}>
                            {[["Pending", COLORS.sky, pending], ["In Progress", COLORS.gold, inProgress], ["Resolved", COLORS.mint, resolved], ["Rejected", COLORS.rose, rejected]].map(([lbl, col, count]) => (
                                <div key={lbl} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                    <span style={{ width: 10, height: 10, borderRadius: 2, background: col, flexShrink: 0 }} />
                                    <span style={{ fontSize: 12, color: COLORS.text, flex: 1 }}>{lbl}</span>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.navy }}>{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Category bars + Priority + Activity */}
                <div style={{ padding: "0 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                    <div className="sp-fade" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 24 }}>
                        <p style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 15, color: COLORS.navy, margin: "0 0 4px" }}>Complaints by category</p>
                        <p style={{ fontSize: 12, color: COLORS.muted, margin: "0 0 20px" }}>Volume per department</p>
                        {catEntries.length > 0
                            ? catEntries.map(([cat, count], i) => <BarRow key={cat} label={cat} value={count} max={catMax} color={catColors[i % catColors.length]} />)
                            : <p style={{ fontSize: 13, color: COLORS.muted, textAlign: "center", padding: "20px 0" }}>No data yet</p>
                        }
                    </div>

                    <div className="sp-fade" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 24 }}>
                        <p style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 15, color: COLORS.navy, margin: "0 0 4px" }}>Priority distribution</p>
                        <p style={{ fontSize: 12, color: COLORS.muted, margin: "0 0 16px" }}>By urgency level</p>

                        {[
                            { label: "High",   count: byPriority.High,   color: COLORS.rose, bg: "#ffe4e6", tc: "#9f1239" },
                            { label: "Medium", count: byPriority.Medium, color: COLORS.gold, bg: "#fff7e0", tc: "#b45309" },
                            { label: "Low",    count: byPriority.Low,    color: COLORS.mint, bg: "#d1fae5", tc: "#065f46" },
                        ].map(({ label, count, color, bg, tc }) => {
                            const pct = Math.round((count / priorityTotal) * 100);
                            return (
                                <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${COLORS.surface}` }}>
                                    <span style={{ fontSize: 13, color: COLORS.text }}>{label}</span>
                                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        <div style={{ width: 100, background: COLORS.surface, borderRadius: 99, height: 6, overflow: "hidden" }}>
                                            <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 99 }} />
                                        </div>
                                        <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 99, background: bg, color: tc, minWidth: 42, textAlign: "center" }}>{count}</span>
                                    </div>
                                </div>
                            );
                        })}

                        <p style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 15, color: COLORS.navy, margin: "20px 0 4px" }}>Recent activity</p>
                        <p style={{ fontSize: 12, color: COLORS.muted, margin: "0 0 12px" }}>Latest updates</p>

                        {recentActivity.length > 0
                            ? recentActivity.map(item => (
                                <div key={item._id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: `1px solid ${COLORS.surface}` }}>
                                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: actDotColor(item.status), display: "inline-block", flexShrink: 0 }} />
                                    <span style={{ fontSize: 13, color: COLORS.text, flex: 1 }}>{item.category} · {item.status || "Pending"}</span>
                                    <span style={{ fontSize: 11, color: COLORS.muted }}>{fmtTime(item.createdAt)}</span>
                                </div>
                            ))
                            : <p style={{ fontSize: 13, color: COLORS.muted, textAlign: "center", padding: "20px 0" }}>No recent activity</p>
                        }
                    </div>
                </div>
            </div>

            {/* ✅ Bottom nav always visible */}
            <BottomNav activeNav={activeNav} setActiveNav={setActiveNav} />
        </>
    );
}
