export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const apiUrl = (endpoint) => {
    if (typeof endpoint !== "string") return endpoint;
    return endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;
};
