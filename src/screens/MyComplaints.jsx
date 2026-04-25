import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const statusColors = {
    "Pending": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-400", icon: "schedule" },
    "In Progress": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", dot: "bg-blue-500", icon: "sync" },
    "Resolved": { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500", icon: "check_circle" },
    "Rejected": { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", dot: "bg-rose-500", icon: "cancel" },
};

const priorityColors = {
    "High": { bg: "bg-rose-50", text: "text-rose-700" },
    "Medium": { bg: "bg-amber-50", text: "text-amber-700" },
    "Low": { bg: "bg-green-50", text: "text-green-700" },
};

const fmt = (iso) => new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

export default function MyComplaints() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState("All");
    const [copiedId, setCopiedId] = useState(null);

    useEffect(() => {
        fetchMyComplaints();
    }, []);

    const fetchMyComplaints = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:5000/api/complaints/user/my-complaints", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Failed to fetch complaints");
            const data = await res.json();
            setComplaints(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const copyId = (id) => {
        navigator.clipboard.writeText(id);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const filters = ["All", "Pending", "In Progress", "Resolved", "Rejected"];

    const filtered = filter === "All"
        ? complaints
        : complaints.filter(c => c.status === filter);

    const counts = {
        All: complaints.length,
        Pending: complaints.filter(c => c.status === "Pending").length,
        "In Progress": complaints.filter(c => c.status === "In Progress").length,
        Resolved: complaints.filter(c => c.status === "Resolved").length,
        Rejected: complaints.filter(c => c.status === "Rejected").length,
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col">

            {/* Header */}
            <header className="sticky top-0 z-50 border-b bg-white dark:bg-slate-900 px-6 py-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-3xl">account_balance</span>
                    <h1 className="font-bold text-lg">Complaint Setu</h1>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate("/register")}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm">add</span>
                        New Complaint
                    </button>
                    <div className="w-9 h-9 bg-blue-100 text-blue-700 flex items-center justify-center rounded-full font-bold text-sm">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                </div>
            </header>

            <main className="flex flex-1 max-w-5xl mx-auto w-full flex-col p-6 gap-6">

                {/* Page title */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">My Complaints</h2>
                        <p className="text-sm text-slate-500 mt-1">Track and manage all your submitted complaints</p>
                    </div>
                    <button
                        onClick={fetchMyComplaints}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm">refresh</span>
                        Refresh
                    </button>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: "Total", count: counts.All, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
                        { label: "Pending", count: counts.Pending, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
                        { label: "In Progress", count: counts["In Progress"], color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
                        { label: "Resolved", count: counts.Resolved, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
                    ].map(({ label, count, color, bg }) => (
                        <div key={label} className={`${bg} rounded-xl p-4 border border-slate-100 dark:border-slate-800`}>
                            <p className={`text-2xl font-bold ${color}`}>{count}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wide">{label}</p>
                        </div>
                    ))}
                </div>

                {/* Filter tabs */}
                <div className="flex gap-2 flex-wrap">
                    {filters.map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border ${filter === f
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                                }`}
                        >
                            {f} {counts[f] > 0 && <span className="ml-1 opacity-70">({counts[f]})</span>}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex flex-col gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 animate-pulse">
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-3"></div>
                                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-2/3"></div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700 flex items-center gap-3">
                        <span className="material-symbols-outlined">error</span>
                        <p>{error}</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center">
                        <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600">inbox</span>
                        <p className="text-lg font-semibold text-slate-500 dark:text-slate-400 mt-4">No complaints found</p>
                        <p className="text-sm text-slate-400 mt-1">
                            {filter === "All" ? "You haven't submitted any complaints yet." : `No ${filter} complaints.`}
                        </p>
                        {filter === "All" && (
                            <button
                                onClick={() => navigate("/register")}
                                className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                            >
                                Register Your First Complaint
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {filtered.map((c) => {
                            const sc = statusColors[c.status] || statusColors["Pending"];
                            const pc = priorityColors[c.priority] || priorityColors["Low"];
                            return (
                                <div
                                    key={c._id}
                                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
                                >
                                    <div className="flex items-start justify-between gap-4 flex-wrap">
                                        <div className="flex-1 min-w-0">

                                            {/* Category + Priority */}
                                            <div className="flex items-center gap-2 flex-wrap mb-2">
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{c.category}</h3>
                                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${pc.bg} ${pc.text}`}>
                                                    {c.priority} Priority
                                                </span>
                                            </div>

                                            {/* Complaint ID — easy to copy */}
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="text-xs text-slate-400 font-mono bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                                                    {c._id}
                                                </span>
                                                <button
                                                    onClick={() => copyId(c._id)}
                                                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 transition-colors"
                                                    title="Copy ID"
                                                >
                                                    <span className="material-symbols-outlined text-sm">
                                                        {copiedId === c._id ? "check" : "content_copy"}
                                                    </span>
                                                    {copiedId === c._id ? "Copied!" : "Copy"}
                                                </button>
                                            </div>

                                            {/* Location + Date */}
                                            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 flex-wrap">
                                                <span className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-sm">location_on</span>
                                                    {c.location || "Unknown"}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-sm">calendar_today</span>
                                                    {fmt(c.createdAt)}
                                                </span>
                                            </div>

                                            {/* Details preview */}
                                            {c.details && (
                                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">{c.details}</p>
                                            )}
                                        </div>

                                        {/* Right side — status + actions */}
                                        <div className="flex flex-col items-end gap-3 flex-shrink-0">
                                            <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${sc.bg} ${sc.text} ${sc.border}`}>
                                                <span className={`w-2 h-2 rounded-full ${sc.dot}`}></span>
                                                {c.status}
                                            </span>

                                            {/* Feedback badge if submitted */}
                                            {c.feedback?.rating && (
                                                <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-200">
                                                    <span className="material-symbols-outlined text-sm">star</span>
                                                    {c.feedback.rating}/5 rated
                                                </span>
                                            )}

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => navigate(`/track/${c._id}`)}
                                                    className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-sm">visibility</span>
                                                    Track
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            <footer className="text-center text-sm text-slate-500 border-t py-4">
                © 2024 Complaint Setu - Government Citizens Connect Portal
            </footer>
        </div>
    );
}