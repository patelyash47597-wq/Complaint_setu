import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { apiUrl } from "../utils/api";

// ─── Icons (inline SVG to avoid dependency) ─────────────────────────────────
const Icon = ({ d, size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d={d} />
    </svg>
);

const icons = {
    bank: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
    person: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
    mail: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6",
    phone: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 17z",
    lock: "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z M7 11V7a5 5 0 0 1 10 0v4",
    eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
    eyeOff: "M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94 M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19 M1 1l22 22",
    arrowLeft: "M19 12H5 M12 19l-7-7 7-7",
    shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    speed: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
    chat: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
    check: "M20 6L9 17l-5-5",
    google: "M21.35 11.1H12.18v2.84h5.3c-.24 1.25-.94 2.31-2 3.02v2.51h3.23c1.89-1.74 2.98-4.3 2.98-7.36 0-.68-.06-1.33-.14-2.01z M12.18 22c2.65 0 4.87-.88 6.5-2.39l-3.23-2.51c-.88.6-2 .96-3.27.96-2.51 0-4.64-1.7-5.4-3.98H3.48v2.59A9.82 9.82 0 0 0 12.18 22z M6.78 14.08A5.9 5.9 0 0 1 6.47 12c0-.72.13-1.42.31-2.08V7.33H3.48A9.82 9.82 0 0 0 2.36 12c0 1.57.38 3.06 1.12 4.37l3.3-2.29z M12.18 5.94c1.41 0 2.68.49 3.68 1.44l2.75-2.75C16.95 3.12 14.73 2.18 12.18 2.18A9.82 9.82 0 0 0 3.48 7.33l3.3 2.59c.76-2.28 2.89-3.98 5.4-3.98z",
    digilocker: "M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5",
};

// ─── Google Button ───────────────────────────────────────────────────────────
const SocialBtn = ({ icon, label, onClick }) => (
    <button onClick={onClick} style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        gap: 10, padding: "11px 16px", borderRadius: 10,
        border: "1.5px solid #e2e8f0", background: "#fff",
        cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#1e293b",
        fontFamily: "inherit", transition: "background 0.15s, border-color 0.15s",
    }}
        onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
        onMouseLeave={e => e.currentTarget.style.background = "#fff"}
    >
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <path d={icons[icon]} fill={icon === "google" ? undefined : "currentColor"} stroke={icon === "google" ? "none" : "currentColor"} />
            {icon === "google" && <>
                <path d="M21.35 11.1H12.18v2.84h5.3c-.24 1.25-.94 2.31-2 3.02v2.51h3.23c1.89-1.74 2.98-4.3 2.98-7.36 0-.68-.06-1.33-.14-2.01z" fill="#4285F4" />
                <path d="M12.18 22c2.65 0 4.87-.88 6.5-2.39l-3.23-2.51c-.88.6-2 .96-3.27.96-2.51 0-4.64-1.7-5.4-3.98H3.48v2.59A9.82 9.82 0 0 0 12.18 22z" fill="#34A853" />
                <path d="M6.78 14.08A5.9 5.9 0 0 1 6.47 12c0-.72.13-1.42.31-2.08V7.33H3.48A9.82 9.82 0 0 0 2.36 12c0 1.57.38 3.06 1.12 4.37l3.3-2.29z" fill="#FBBC05" />
                <path d="M12.18 5.94c1.41 0 2.68.49 3.68 1.44l2.75-2.75C16.95 3.12 14.73 2.18 12.18 2.18A9.82 9.82 0 0 0 3.48 7.33l3.3 2.59c.76-2.28 2.89-3.98 5.4-3.98z" fill="#EA4335" />
            </>}
            {icon === "digilocker" && (
                <path d="M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5" stroke="#1a56db" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            )}
        </svg>
        {label}
    </button>
);

// ─── Field ───────────────────────────────────────────────────────────────────
const Field = ({ icon, label, id, type = "text", placeholder, value, onChange, name, required, rightEl }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label htmlFor={id} style={{ fontSize: 13, fontWeight: 600, color: "#334155", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: "#64748b" }}><Icon d={icons[icon]} size={15} /></span>
            {label}
        </label>
        <div style={{ position: "relative" }}>
            <input
                id={id} name={name} type={type} placeholder={placeholder}
                value={value} onChange={onChange} required={required}
                style={{
                    width: "100%", height: 48, padding: "0 44px 0 16px", borderRadius: 10,
                    border: "1.5px solid #e2e8f0", background: "#f8fafc",
                    fontSize: 14, color: "#1e293b", outline: "none",
                    fontFamily: "inherit", boxSizing: "border-box",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onFocus={e => { e.target.style.borderColor = "#3b5bdb"; e.target.style.boxShadow = "0 0 0 3px rgba(59,91,219,0.12)"; }}
                onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
            />
            {rightEl && <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "#94a3b8" }}>{rightEl}</span>}
        </div>
    </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────
const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [showResetPassword, setShowResetPassword] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [formData, setFormData] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "", termsAccepted: false });
    const [resetData, setResetData] = useState({ email: "", resetToken: "", newPassword: "", confirmNewPassword: "" });
    const [message, setMessage] = useState({ type: "", text: "" });
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(p => ({ ...p, [name]: type === "checkbox" ? checked : value }));
        setMessage({ type: "", text: "" });
    };

    const handleResetChange = (e) => {
        const { name, value } = e.target;
        setResetData(p => ({ ...p, [name]: value }));
        setMessage({ type: "", text: "" });
    };

    // Handle forgot password request
    const handleForgotPassword = async (e) => {
        e.preventDefault();
        if (!resetData.email) {
            setMessage({ type: "error", text: "Please enter your email address." });
            return;
        }

        try {
            const res = await fetch(apiUrl("/api/auth/forgot-password"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: resetData.email })
            });
            const data = await res.json();

            if (!res.ok) {
                setMessage({ type: "error", text: data.message || "Something went wrong." });
                return;
            }

            setMessage({ type: "success", text: "✅ Reset token sent! Copy the token below and use it to reset your password." });
            setResetData(p => ({ ...p, resetToken: data.resetToken }));
            setShowResetPassword(true);
        } catch (error) {
            setMessage({ type: "error", text: "Network error. Please try again." });
            console.error(error);
        }
    };

    // Handle password reset
    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (!resetData.resetToken || !resetData.newPassword || !resetData.confirmNewPassword) {
            setMessage({ type: "error", text: "All fields are required." });
            return;
        }

        if (resetData.newPassword !== resetData.confirmNewPassword) {
            setMessage({ type: "error", text: "Passwords do not match." });
            return;
        }

        if (resetData.newPassword.length < 6) {
            setMessage({ type: "error", text: "Password must be at least 6 characters." });
            return;
        }

        try {
            const res = await fetch(apiUrl("/api/auth/reset-password"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    resetToken: resetData.resetToken,
                    newPassword: resetData.newPassword
                })
            });
            const data = await res.json();

            if (!res.ok) {
                setMessage({ type: "error", text: data.message || "Failed to reset password." });
                return;
            }

            setMessage({ type: "success", text: "✅ Password reset successful! Redirecting to login..." });
            setTimeout(() => {
                setIsForgotPassword(false);
                setShowResetPassword(false);
                setResetData({ email: "", resetToken: "", newPassword: "", confirmNewPassword: "" });
                setFormData({ ...formData, email: resetData.email });
                setIsLogin(true);
            }, 2000);
        } catch (error) {
            setMessage({ type: "error", text: "Network error. Please try again." });
            console.error(error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isLogin && !formData.termsAccepted) return setMessage({ type: "error", text: "Please accept the Terms of Service." });
        if (!isLogin && formData.password !== formData.confirmPassword) return setMessage({ type: "error", text: "Passwords do not match." });
        try {
            const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
            const payload = isLogin
                ? { email: formData.email, password: formData.password }
                : { name: formData.name, email: formData.email, phone: formData.phone, password: formData.password };
            const res = await fetch(apiUrl(endpoint), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
            const data = await res.json();
            if (!res.ok) return setMessage({ type: "error", text: data.message || "Something went wrong." });
            if (isLogin) {
                login(data.user, data.token);
                setMessage({ type: "success", text: "Login successful! Redirecting..." });
                setTimeout(() => navigate("/"), 800);
            } else {
                login(data.user, data.token);
                setMessage({ type: "success", text: "Account created! Redirecting to home..." });
                setTimeout(() => navigate("/"), 800);
            }
        } catch { setMessage({ type: "error", text: "Network error. Please try again." }); }
    };

    const blue = "#3b5bdb";

    return (
        <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Nunito', 'Segoe UI', sans-serif", display: "flex", flexDirection: "column" }}>
            {/* Google Font */}
            <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

            {/* Header */}
            <header style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "0 32px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 36, height: 36, background: blue, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ color: "#fff" }}><Icon d={icons.bank} size={18} /></span>
                    </div>
                    <span style={{ fontSize: 18, fontWeight: 800, color: "#1e293b", letterSpacing: "-0.3px" }}>Complaint Setu</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 13, color: "#64748b" }}>Already have an account?</span>
                    <button onClick={() => { setIsLogin(true); setMessage({ type: "", text: "" }); }} style={{
                        padding: "8px 20px", borderRadius: 8, border: "1.5px solid #e2e8f0",
                        background: "#fff", fontSize: 13, fontWeight: 700, color: "#1e293b",
                        cursor: "pointer", fontFamily: "inherit",
                    }}>Login</button>
                </div>
            </header>

            {/* Main */}
            <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px" }}>
                <div style={{
                    width: "100%", maxWidth: 960,
                    display: "grid", gridTemplateColumns: "1fr 1fr",
                    background: "#fff", borderRadius: 20,
                    boxShadow: "0 20px 60px rgba(0,0,0,0.10)",
                    overflow: "hidden", minHeight: 580,
                }}>

                    {/* ── Left: Form ── */}
                    <div style={{ padding: "48px 48px 40px", overflowY: "auto" }}>
                        {!isForgotPassword && isLogin && (
                            <button onClick={() => setIsLogin(false)} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#64748b", background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: 24, fontFamily: "inherit" }}>
                                <Icon d={icons.arrowLeft} size={14} /> Back to Home
                            </button>
                        )}

                        {isForgotPassword && (
                            <button onClick={() => { setIsForgotPassword(false); setShowResetPassword(false); setResetData({ email: "", resetToken: "", newPassword: "", confirmNewPassword: "" }); setMessage({ type: "", text: "" }); }} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#64748b", background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: 24, fontFamily: "inherit" }}>
                                <Icon d={icons.arrowLeft} size={14} /> Back to Login
                            </button>
                        )}

                        {!isForgotPassword ? (
                            <>
                                <h1 style={{ fontSize: 30, fontWeight: 900, color: "#1e293b", margin: "0 0 8px", letterSpacing: "-0.5px" }}>
                                    {isLogin ? "Welcome Back" : "Join Complaint Setu"}
                                </h1>
                                <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 28px", lineHeight: 1.6 }}>
                                    {isLogin
                                        ? "Please enter your credentials to access your portal."
                                        : "Create an account to start resolving your grievances efficiently and bridge the gap to solutions."}
                                </p>

                                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                    {!isLogin && (
                                        <Field icon="person" label="Full Name" id="name" name="name" placeholder="Enter your full name" value={formData.name} onChange={handleChange} required />
                                    )}

                                    <Field icon="mail" label="Email Address" id="email" name="email" type="email" placeholder="Enter your email address" value={formData.email} onChange={handleChange} required />

                                    {!isLogin && (
                                        <Field icon="phone" label="Phone Number" id="phone" name="phone" type="tel" placeholder="+91 00000 00000" value={formData.phone} onChange={handleChange} required />
                                    )}

                                    <Field
                                        icon="lock" label={isLogin ? "Password" : "Create Password"}
                                        id="password" name="password" type={showPass ? "text" : "password"}
                                        placeholder="Min. 8 characters" value={formData.password} onChange={handleChange} required
                                        rightEl={<span onClick={() => setShowPass(p => !p)}><Icon d={showPass ? icons.eyeOff : icons.eye} size={16} /></span>}
                                    />

                                    {!isLogin && (
                                        <Field
                                            icon="lock" label="Confirm Password"
                                            id="confirmPassword" name="confirmPassword" type={showConfirm ? "text" : "password"}
                                            placeholder="Repeat your password" value={formData.confirmPassword} onChange={handleChange} required
                                            rightEl={<span onClick={() => setShowConfirm(p => !p)}><Icon d={showConfirm ? icons.eyeOff : icons.eye} size={16} /></span>}
                                        />
                                    )}

                                    {isLogin && (
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#475569", cursor: "pointer" }}>
                                                <input type="checkbox" style={{ accentColor: blue }} /> Remember me
                                            </label>
                                            <a href="#" onClick={(e) => { e.preventDefault(); setIsForgotPassword(true); setResetData({ email: formData.email, resetToken: "", newPassword: "", confirmNewPassword: "" }); }} style={{ fontSize: 13, color: blue, fontWeight: 700, textDecoration: "none" }}>Forgot password?</a>
                                        </div>
                                    )}

                                    {!isLogin && (
                                        <label style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 12, color: "#64748b", cursor: "pointer", lineHeight: 1.5 }}>
                                            <input type="checkbox" name="termsAccepted" checked={formData.termsAccepted} onChange={handleChange} style={{ marginTop: 2, accentColor: blue }} />
                                            I agree to the <a href="#" style={{ color: blue, fontWeight: 700 }}>Terms of Service</a> and <a href="#" style={{ color: blue, fontWeight: 700 }}>Privacy Policy</a>. I consent to receive updates about my complaints.
                                        </label>
                                    )}

                                    {message.text && (
                                        <p style={{ fontSize: 13, margin: 0, color: message.type === "error" ? "#ef4444" : "#22c55e", fontWeight: 600 }}>
                                            {message.text}
                                        </p>
                                    )}

                                    <button type="submit" style={{
                                        width: "100%", height: 52, borderRadius: 12, border: "none",
                                        background: blue, color: "#fff", fontSize: 15, fontWeight: 800,
                                        cursor: "pointer", fontFamily: "inherit", marginTop: 4,
                                        boxShadow: `0 4px 20px rgba(59,91,219,0.35)`,
                                        transition: "opacity 0.15s, transform 0.1s",
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.opacity = "0.92"}
                                        onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                                        onMouseDown={e => e.currentTarget.style.transform = "scale(0.98)"}
                                        onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
                                    >
                                        {isLogin ? "Login to Account" : "Create Account"}
                                    </button>

                                    {isLogin && (
                                        <>
                                            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0" }}>
                                                <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
                                                <span style={{ fontSize: 12, color: "#94a3b8" }}>Or continue with</span>
                                                <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
                                            </div>
                                            <div style={{ display: "flex", gap: 12 }}>
                                                <SocialBtn icon="google" label="Google" onClick={() => { }} />
                                                <SocialBtn icon="digilocker" label="DigiLocker" onClick={() => { }} />
                                            </div>
                                        </>
                                    )}

                                    <p style={{ textAlign: "center", fontSize: 13, color: "#64748b", margin: 0 }}>
                                        {isLogin ? "Don't have an account yet? " : "Already using Complaint Setu? "}
                                        <span onClick={() => { setIsLogin(p => !p); setMessage({ type: "", text: "" }); }}
                                            style={{ color: blue, fontWeight: 800, cursor: "pointer" }}>
                                            {isLogin ? "Create an account" : "Log in here"}
                                        </span>
                                    </p>
                                </form>
                            </>
                        ) : (
                            <>
                                <h1 style={{ fontSize: 30, fontWeight: 900, color: "#1e293b", margin: "0 0 8px", letterSpacing: "-0.5px" }}>
                                    Reset Your Password
                                </h1>
                                <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 28px", lineHeight: 1.6 }}>
                                    Enter your email to receive a password reset token.
                                </p>

                                {!showResetPassword ? (
                                    <form onSubmit={handleForgotPassword} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                        <Field
                                            icon="mail" label="Email Address"
                                            id="forgotEmail" name="email" type="email"
                                            placeholder="Enter your registered email"
                                            value={resetData.email} onChange={handleResetChange} required
                                        />

                                        {message.text && (
                                            <p style={{
                                                fontSize: 13, margin: 0, padding: 12, borderRadius: 8,
                                                color: message.type === "error" ? "#7f1d1d" : "#155e75",
                                                background: message.type === "error" ? "#fee2e2" : "#cffafe",
                                                fontWeight: 600
                                            }}>
                                                {message.text}
                                            </p>
                                        )}

                                        <button type="submit" style={{
                                            width: "100%", height: 52, borderRadius: 12, border: "none",
                                            background: blue, color: "#fff", fontSize: 15, fontWeight: 800,
                                            cursor: "pointer", fontFamily: "inherit", marginTop: 4,
                                            boxShadow: `0 4px 20px rgba(59,91,219,0.35)`,
                                            transition: "opacity 0.15s, transform 0.1s",
                                        }}
                                            onMouseEnter={e => e.currentTarget.style.opacity = "0.92"}
                                            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                                            onMouseDown={e => e.currentTarget.style.transform = "scale(0.98)"}
                                            onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
                                        >
                                            Send Reset Link
                                        </button>
                                    </form>
                                ) : (
                                    <form onSubmit={handleResetPassword} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                        <div style={{ background: "#fef3c7", padding: 12, borderRadius: 8, borderLeft: "4px solid #f59e0b" }}>
                                            <p style={{ fontSize: 12, margin: 0, color: "#92400e", fontWeight: 600 }}>
                                                📋 Reset Token (copy & paste below):
                                            </p>
                                            <p style={{
                                                fontSize: 11, margin: "8px 0 0", padding: 8, background: "#fff",
                                                borderRadius: 4, wordBreak: "break-all", fontFamily: "monospace",
                                                color: "#1f2937", userSelect: "all"
                                            }}>
                                                {resetData.resetToken}
                                            </p>
                                        </div>

                                        <Field
                                            icon="lock" label="Reset Token"
                                            id="resetToken" name="resetToken" type="password"
                                            placeholder="Paste the token from above"
                                            value={resetData.resetToken} onChange={handleResetChange} required
                                        />

                                        <Field
                                            icon="lock" label="New Password"
                                            id="newPassword" name="newPassword" type={showPass ? "text" : "password"}
                                            placeholder="Enter new password"
                                            value={resetData.newPassword} onChange={handleResetChange} required
                                            rightEl={<span onClick={() => setShowPass(p => !p)}><Icon d={showPass ? icons.eyeOff : icons.eye} size={16} /></span>}
                                        />

                                        <Field
                                            icon="lock" label="Confirm New Password"
                                            id="confirmNewPassword" name="confirmNewPassword" type={showConfirm ? "text" : "password"}
                                            placeholder="Confirm new password"
                                            value={resetData.confirmNewPassword} onChange={handleResetChange} required
                                            rightEl={<span onClick={() => setShowConfirm(p => !p)}><Icon d={showConfirm ? icons.eyeOff : icons.eye} size={16} /></span>}
                                        />

                                        {message.text && (
                                            <p style={{
                                                fontSize: 13, margin: 0, padding: 12, borderRadius: 8,
                                                color: message.type === "error" ? "#7f1d1d" : "#155e75",
                                                background: message.type === "error" ? "#fee2e2" : "#cffafe",
                                                fontWeight: 600
                                            }}>
                                                {message.text}
                                            </p>
                                        )}

                                        <button type="submit" style={{
                                            width: "100%", height: 52, borderRadius: 12, border: "none",
                                            background: blue, color: "#fff", fontSize: 15, fontWeight: 800,
                                            cursor: "pointer", fontFamily: "inherit", marginTop: 4,
                                            boxShadow: `0 4px 20px rgba(59,91,219,0.35)`,
                                            transition: "opacity 0.15s, transform 0.1s",
                                        }}
                                            onMouseEnter={e => e.currentTarget.style.opacity = "0.92"}
                                            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                                            onMouseDown={e => e.currentTarget.style.transform = "scale(0.98)"}
                                            onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
                                        >
                                            Reset Password
                                        </button>
                                    </form>
                                )}
                            </>
                        )}
                    </div>

                    {/* ── Right: Blue Panel ── */}
                    <div style={{ background: blue, position: "relative", display: "flex", flexDirection: "column", justifyContent: "center", padding: "48px 44px", overflow: "hidden", color: "#fff" }}>
                        {/* Decorative circles */}
                        {[
                            { size: 300, top: -80, right: -80, opacity: 0.08 },
                            { size: 180, bottom: 60, left: -60, opacity: 0.06 },
                        ].map((c, i) => (
                            <div key={i} style={{
                                position: "absolute", width: c.size, height: c.size, borderRadius: "50%",
                                border: "1px solid rgba(255,255,255,0.5)",
                                top: c.top, right: c.right, bottom: c.bottom, left: c.left, opacity: c.opacity,
                            }} />
                        ))}

                        <div style={{ position: "relative", zIndex: 1 }}>
                            <div style={{ marginBottom: 20 }}>
                                <div style={{ width: 56, height: 56, borderRadius: 14, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Icon d={isForgotPassword ? icons.lock : icons.shield} size={28} />
                                </div>
                            </div>

                            <h2 style={{ fontSize: 26, fontWeight: 900, margin: "0 0 8px", lineHeight: 1.2, letterSpacing: "-0.3px" }}>
                                {isForgotPassword
                                    ? "Regain Access to Your Account"
                                    : isLogin ? "Empowering Citizens Through Transparency." : "Transparent Governance in your pocket"}
                            </h2>
                            <p style={{ fontSize: 13, opacity: 0.8, margin: "0 0 32px", lineHeight: 1.6 }}>
                                {isForgotPassword
                                    ? "We'll help you reset your password and get you back into your account securely."
                                    : isLogin
                                        ? "Access the unified portal for grievance redressal and government services. Your voice matters in building a better nation."
                                        : "Bridge the gap between the citizen and administration for a better tomorrow."}
                            </p>

                            {!isForgotPassword && [
                                { icon: icons.shield, text: isLogin ? "Secure Government Infrastructure" : "Fast-track grievance resolution" },
                                { icon: icons.speed, text: isLogin ? "Real-time Complaint Tracking" : "Real-time status tracking" },
                                { icon: icons.chat, text: "Direct communication with officials" },
                            ].map((item, i) => (
                                <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
                                    <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                        <Icon d={item.icon} size={17} />
                                    </div>
                                    <span style={{ fontSize: 14, fontWeight: 600, opacity: 0.95 }}>{item.text}</span>
                                </div>
                            ))}

                            {!isForgotPassword && isLogin && (
                                <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.2)" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                        <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800 }}>DA</div>
                                        <div>
                                            <p style={{ fontSize: 13, fontStyle: "italic", opacity: 0.85, margin: "0 0 4px", lineHeight: 1.5 }}>"Bridging the gap between the citizen and the administration for a better tomorrow."</p>
                                            <p style={{ fontSize: 11, fontWeight: 800, margin: 0, opacity: 0.7 }}>— District Administrator</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </main>

            <footer style={{ textAlign: "center", padding: "20px", fontSize: 12, color: "#94a3b8" }}>
                © 2024 Complaint Setu. All rights reserved. Managed by Department of Public Grievances.
            </footer>
        </div>
    );
};

export default AuthPage;