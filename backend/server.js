const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();

// --- Security Headers ---
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// --- CORS: restrict to your frontend origin ---
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : [];

app.use(cors({
    origin: (origin, callback) => {
        // Allow server-to-server or same-origin requests (no Origin header)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));

// --- Body size limit ---
app.use(express.json({ limit: "10kb" }));

// --- Rate limiting: global ---
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later." },
});
app.use(globalLimiter);

// --- Stricter limiter for auth routes ---
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { error: "Too many auth attempts, please try again later." },
});
app.use("/api/auth", authLimiter);

// --- Static files ---

const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- DB Connection ---
if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI is not set in environment variables.");
    process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => {
        console.error("❌ MongoDB connection error:", err.message);
        process.exit(1);
    });

// --- Routes ---
app.use("/api/complaints", require("./routes/complaintRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));

// --- 404 handler ---
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

// --- Global error handler ---
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err.message);
    res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});