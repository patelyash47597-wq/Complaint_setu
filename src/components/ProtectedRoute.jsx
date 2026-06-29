import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { apiUrl } from "../utils/api";

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { isAuthenticated, user, loading, login } = useAuth();
    const [showAdminLogin, setShowAdminLogin] = useState(false);
    const [adminEmail, setAdminEmail] = useState("");
    const [adminPassword, setAdminPassword] = useState("");
    const [adminLoginError, setAdminLoginError] = useState("");
    const [adminLoginLoading, setAdminLoginLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    const handleAdminLogin = async (e) => {
        e.preventDefault();
        setAdminLoginError("");
        setAdminLoginLoading(true);

        try {
            const res = await fetch(apiUrl("/api/auth/login"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: adminEmail, password: adminPassword })
            });

            const data = await res.json();

            if (!res.ok) {
                setAdminLoginError(data.message || "Invalid credentials");
                setAdminLoginLoading(false);
                return;
            }

            if (data.user.role !== "admin") {
                setAdminLoginError("This account is not an administrator account");
                setAdminLoginLoading(false);
                return;
            }

            login(data.user, data.token);
            setAdminLoginLoading(false);
            window.location.reload();
        } catch (error) {
            setAdminLoginError("Network error. Please try again.");
            setAdminLoginLoading(false);
        }
    };

    if (adminOnly && user?.role !== "admin") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-md w-full">
                    {!showAdminLogin ? (
                        <div className="p-8 text-center">
                            <div className="mb-6">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                                    <span style={{ fontSize: 32 }}>🔒</span>
                                </div>
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
                            <p className="text-slate-600 mb-2">
                                You don't have permission to access the Admin Dashboard.
                            </p>
                            <p className="text-sm text-slate-500 mb-6">
                                Only administrators can view this page.<br />
                                <span className="font-semibold">Current Role: {user?.role || "user"}</span>
                            </p>

                            <div className="space-y-3">
                                <button
                                    onClick={() => setShowAdminLogin(true)}
                                    className="w-full px-6 py-3 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 transition"
                                >
                                    Login as Admin
                                </button>
                                <a
                                    href="/"
                                    className="block px-6 py-3 bg-slate-200 text-slate-900 font-semibold rounded-lg hover:bg-slate-300 transition"
                                >
                                    Go to Dashboard
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div className="p-8">
                            <div className="mb-6">
                                <h1 className="text-2xl font-bold text-slate-900 mb-2">Admin Login</h1>
                                <p className="text-slate-600 text-sm">
                                    Enter your admin credentials to access the dashboard.
                                </p>
                            </div>

                            <form onSubmit={handleAdminLogin} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={adminEmail}
                                        onChange={(e) => setAdminEmail(e.target.value)}
                                        placeholder="Enter admin email"
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={adminPassword}
                                            onChange={(e) => setAdminPassword(e.target.value)}
                                            placeholder="Enter admin password"
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-700"
                                        >
                                            {showPassword ? "👁️" : "👁️‍🗨️"}
                                        </button>
                                    </div>
                                </div>

                                {adminLoginError && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-sm text-red-700">❌ {adminLoginError}</p>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={adminLoginLoading}
                                    className="w-full px-6 py-3 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {adminLoginLoading ? "Logging in..." : "Login"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAdminLogin(false);
                                        setAdminEmail("");
                                        setAdminPassword("");
                                        setAdminLoginError("");
                                    }}
                                    className="w-full px-6 py-2 bg-slate-200 text-slate-900 font-semibold rounded-lg hover:bg-slate-300 transition"
                                >
                                    Back
                                </button>
                            </form>

                            <p className="text-xs text-slate-500 text-center mt-4">
                                🔐 Your credentials are secure and encrypted.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;