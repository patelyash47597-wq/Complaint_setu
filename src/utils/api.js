const rawBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, "");

export const apiUrl = (endpoint) => {
    if (typeof endpoint !== "string") return endpoint;
    if (endpoint.startsWith("http")) return endpoint;
    const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    return `${API_BASE_URL}${normalizedEndpoint}`;
};
