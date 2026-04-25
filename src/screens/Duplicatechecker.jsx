/**
 * DuplicateChecker.jsx
 * ─────────────────────
 * Drop this component into RegisterComplaint.jsx.
 * It debounces the complaint details input and hits /check-duplicate
 * as the user types. If duplicates are found it shows a card allowing
 * upvote-and-exit or dismiss-and-continue.
 *
 * Usage in RegisterComplaint.jsx:
 *
 *   import DuplicateChecker from "./DuplicateChecker";
 *
 *   // Inside the form, right after the <textarea> for details:
 *   <DuplicateChecker
 *     details={details}
 *     category={category}
 *     location={location}
 *     onUpvotedAndExit={(id) => navigate(`/track/${id}`)}
 *   />
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// ── Similarity badge ──────────────────────────────────────────────────────────
const SimilarityBadge = ({ score, level }) => {
    const pct = Math.round(score * 100);
    const cfg = level === "definite"
        ? { bg: "#fff0f3", border: "#fecdd3", text: "#9f1239", label: "Strong match" }
        : { bg: "#fff7ed", border: "#fed7aa", text: "#9a3412", label: "Possible match" };

    return (
        <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: cfg.bg, border: `1px solid ${cfg.border}`,
            borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 600,
            color: cfg.text
        }}>
            <span style={{
                width: 6, height: 6, borderRadius: "50%",
                background: cfg.text, display: "inline-block"
            }} />
            {cfg.label} · {pct}%
        </div>
    );
};

// ── Single duplicate card ─────────────────────────────────────────────────────
const DuplicateCard = ({ match, onUpvote, upvoting }) => (
    <div style={{
        background: "#fff", border: "1px solid #e2e8f4",
        borderRadius: 12, padding: "14px 16px",
        transition: "box-shadow .2s",
    }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{
                        fontSize: 10, background: "#f1f5f9", color: "#475569",
                        padding: "2px 8px", borderRadius: 6, fontWeight: 500
                    }}>
                        {match.category}
                    </span>
                    <span style={{ fontSize: 10, color: "#94a3b8" }}>📍 {match.location}</span>
                </div>
                <p style={{ fontSize: 13, color: "#0a1628", margin: 0, lineHeight: 1.5 }}>
                    {match.details}
                </p>
            </div>
            <SimilarityBadge score={match.similarity} level={match.match_level} />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {/* Upvote counter */}
                <span style={{ fontSize: 12, color: "#6b7a99", display: "flex", alignItems: "center", gap: 4 }}>
                    <span>👍</span>
                    <span>{match.upvotes} upvote{match.upvotes !== 1 ? "s" : ""}</span>
                </span>
                {/* Status pill */}
                <span style={{
                    fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20,
                    background: match.status === "In Progress" ? "#dbeafe" : "#fff7e0",
                    color: match.status === "In Progress" ? "#1d4ed8" : "#b45309"
                }}>
                    {match.status}
                </span>
            </div>

            {/* Upvote button */}
            <button
                onClick={() => onUpvote(match.id)}
                disabled={upvoting === match.id}
                style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                    border: "1.5px solid #1e6bff",
                    background: upvoting === match.id ? "#eff6ff" : "#fff",
                    color: "#1e6bff",
                    cursor: upvoting === match.id ? "default" : "pointer",
                    transition: "all .15s",
                    opacity: upvoting === match.id ? 0.7 : 1
                }}
            >
                {upvoting === match.id ? "Upvoting…" : "👍 This is my issue too"}
            </button>
        </div>
    </div>
);

// ── Main component ────────────────────────────────────────────────────────────
export default function DuplicateChecker({ details, category, location, onUpvotedAndExit }) {
    const [state, setState] = useState("idle");  // idle | checking | found | none | error
    const [matches, setMatches] = useState([]);
    const [dismissed, setDismissed] = useState(false);
    const [upvoting, setUpvoting] = useState(null);    // id of complaint being upvoted
    const [upvotedId, setUpvotedId] = useState(null);
    const debounceRef = useRef(null);
    const navigate = useNavigate();

    // ── Debounced duplicate check ─────────────────────────────────────────────
    const runCheck = useCallback(async (d, cat, loc) => {
        if (d.trim().length < 15) {
            setState("idle");
            return;
        }

        setState("checking");
        setDismissed(false);

        try {
            const res = await fetch("http://localhost:5000/api/complaints/check-duplicate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ details: d, category: cat, location: loc }),
            });
            const data = await res.json();

            if (data.match_count > 0) {
                setMatches(data.matches);
                setState("found");
            } else {
                setMatches([]);
                setState("none");
            }
        } catch {
            setState("error");
        }
    }, []);

    // Re-run when any of the three inputs change (debounced 800 ms)
    useEffect(() => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            runCheck(details, category, location);
        }, 800);
        return () => clearTimeout(debounceRef.current);
    }, [details, category, location, runCheck]);

    // ── Upvote handler ────────────────────────────────────────────────────────
    const handleUpvote = async (id) => {
        setUpvoting(id);
        try {
            const res = await fetch(`http://localhost:5000/api/complaints/${id}/upvote`, {
                method: "PATCH"
            });
            const data = await res.json();

            if (res.ok) {
                setUpvotedId(id);
                // Update local upvote count optimistically
                setMatches(prev => prev.map(m =>
                    m.id === id ? { ...m, upvotes: data.upvotes } : m
                ));
                // After 2s, redirect to that complaint's tracker
                setTimeout(() => {
                    if (onUpvotedAndExit) onUpvotedAndExit(id);
                    else navigate(`/track/${id}`);
                }, 2000);
            }
        } catch {
            alert("Error upvoting. Please try again.");
        } finally {
            setUpvoting(null);
        }
    };

    // ── Nothing to show ───────────────────────────────────────────────────────
    if (state === "idle" || dismissed) return null;

    return (
        <div style={{ marginTop: 4 }}>

            {/* Checking indicator */}
            {state === "checking" && (
                <div style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "10px 14px", background: "#f8fafc",
                    border: "1px solid #e2e8f4", borderRadius: 10,
                    fontSize: 12, color: "#6b7a99"
                }}>
                    <span style={{
                        width: 12, height: 12, borderRadius: "50%",
                        border: "2px solid #1e6bff", borderTopColor: "transparent",
                        animation: "spin 0.8s linear infinite",
                        display: "inline-block", flexShrink: 0
                    }} />
                    Checking for similar complaints…
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            )}

            {/* All clear */}
            {state === "none" && (
                <div style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "8px 14px", background: "#f0fdf4",
                    border: "1px solid #bbf7d0", borderRadius: 10,
                    fontSize: 12, color: "#166534"
                }}>
                    ✅ No similar complaints found — you're good to submit!
                </div>
            )}

            {/* Error (silent fail) */}
            {state === "error" && (
                <div style={{
                    padding: "8px 14px", background: "#f8fafc",
                    border: "1px solid #e2e8f4", borderRadius: 10,
                    fontSize: 12, color: "#94a3b8"
                }}>
                    Duplicate check unavailable — you can still submit.
                </div>
            )}

            {/* Duplicates found */}
            {state === "found" && matches.length > 0 && (
                <div style={{
                    background: "#fffbeb",
                    border: "1.5px solid #fde68a",
                    borderRadius: 14, padding: "16px",
                }}>
                    {/* Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                        <div>
                            <p style={{ fontSize: 13, fontWeight: 700, color: "#92400e", margin: "0 0 3px" }}>
                                ⚠ Similar complaint{matches.length > 1 ? "s" : ""} already exist
                                {upvotedId
                                    ? " — thanks for upvoting! Redirecting…"
                                    : matches.length === 1
                                        ? " — is this your issue too?"
                                        : ""}
                            </p>
                            <p style={{ fontSize: 12, color: "#b45309", margin: 0 }}>
                                {upvotedId
                                    ? "Your upvote helps prioritise this complaint faster."
                                    : "Upvoting an existing complaint is faster than filing a new one — it boosts its priority."}
                            </p>
                        </div>
                        {!upvotedId && (
                            <button
                                onClick={() => setDismissed(true)}
                                style={{
                                    background: "none", border: "none",
                                    fontSize: 16, color: "#b45309",
                                    cursor: "pointer", padding: "0 4px", flexShrink: 0
                                }}
                                title="Dismiss and file new complaint"
                            >✕</button>
                        )}
                    </div>

                    {/* Duplicate cards */}
                    <div style={{ display: "grid", gap: 10 }}>
                        {matches.map(match => (
                            <DuplicateCard
                                key={match.id}
                                match={match}
                                onUpvote={handleUpvote}
                                upvoting={upvoting}
                            />
                        ))}
                    </div>

                    {/* Footer: still want to submit? */}
                    {!upvotedId && (
                        <p style={{ fontSize: 11, color: "#b45309", margin: "12px 0 0", textAlign: "center" }}>
                            Not your issue?{" "}
                            <button
                                onClick={() => setDismissed(true)}
                                style={{
                                    background: "none", border: "none",
                                    color: "#1e6bff", fontSize: 11,
                                    fontWeight: 600, cursor: "pointer", padding: 0
                                }}
                            >
                                File a new complaint →
                            </button>
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}