const mongoose = require("mongoose");

// SLA deadlines per priority (in hours)
const SLA_HOURS = { High: 24, Medium: 72, Low: 168 };

const complaintSchema = new mongoose.Schema({

    category: String,
    location: String,
    details: String,
    image: String,
    coordinates: {
        lat: Number,
        lng: Number
    },
    status: {
        type: String,
        default: "Pending"
    },
    priority: {
        type: String,
        enum: ["High", "Medium", "Low"],
        default: "High"
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false
    },

    // ── SLA fields ────────────────────────────────────────────────────────────
    slaDeadline: {
        type: Date,
        default: null
    },
    isEscalated: {
        type: Boolean,
        default: false
    },
    resolvedAt: {
        type: Date,
        default: null
    },
    // ── Duplicate detection ───────────────────────────────────────────────────
    upvotes: {
        type: Number,
        default: 0
    },
    upvotedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],

    feedback: {
        rating: Number,
        comment: String,
        submittedAt: Date
    }

}, { timestamps: true });

// ── Called right after priority is assigned ───────────────────────────────────
complaintSchema.methods.setSLA = function () {
    const hours = SLA_HOURS[this.priority] || 72;
    this.slaDeadline = new Date(Date.now() + hours * 3600 * 1000);
};

// ── Returns seconds remaining (0 if breached or resolved) ────────────────────
complaintSchema.methods.slaRemainingSeconds = function () {
    if (this.resolvedAt || !this.slaDeadline) return 0;
    return Math.max(0, Math.floor((this.slaDeadline - Date.now()) / 1000));
};

// ── Returns: "ok" | "urgent" | "breached" | "resolved" ───────────────────────
complaintSchema.methods.slaStatus = function () {
    if (this.resolvedAt) return "resolved";
    if (!this.slaDeadline) return "ok";
    if (Date.now() > this.slaDeadline) return "breached";
    const totalSec = (SLA_HOURS[this.priority] || 72) * 3600;
    const rem = this.slaRemainingSeconds();
    if (rem / totalSec < 0.2) return "urgent";
    return "ok";
};

// ── Virtual: SLA hours for this priority ─────────────────────────────────────
complaintSchema.virtual("slaTotalHours").get(function () {
    return SLA_HOURS[this.priority] || 72;
});

module.exports = mongoose.model("Complaint", complaintSchema);
module.exports.SLA_HOURS = SLA_HOURS;