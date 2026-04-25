const express = require("express");
const router = express.Router();
const multer = require("multer");
const Complaint = require("../models/Complaint");
const { SLA_HOURS } = require("../models/Complaint");
const transporter = require("../utils/mailer");
const axios = require("axios");
const mongoose = require("mongoose");
const auth = require("../middleware/auth");
const FormData = require("form-data");
const fs = require("fs");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage: storage });

// ── GET /duplicates — Check for similar complaints in the same area ───────────
// Called client-side before submission (debounced); no auth required.
// Query params: text, location, category (optional)
router.get("/duplicates", async (req, res) => {
    try {
        const { text, location, category } = req.query;
        if (!text || !location) {
            return res.status(400).json({ message: "text and location are required" });
        }

        // Fetch recent open complaints (last 90 days) in the rough area.
        // We pull text + location to the ML service and let cosine similarity decide.
        const since = new Date(Date.now() - 90 * 24 * 3600 * 1000);
        const query = {
            createdAt: { $gte: since },
            status: { $ne: "Resolved" }
        };
        if (category) query.category = category;

        const recent = await Complaint.find(query, "details location upvotes upvotedBy")
            .sort({ createdAt: -1 })
            .limit(200)
            .lean();

        if (!recent.length) return res.json({ duplicates: [] });

        const candidates = recent.map(c => ({
            id: c._id.toString(),
            text: c.details || "",
            location: c.location || "",
            upvotes: c.upvotes || 0,
        }));

        // Delegate similarity scoring to ML service
        const mlRes = await axios.post("http://127.0.0.1:8000/find-duplicates", {
            text,
            location,
            candidates,
            threshold: 0.55
        }, { timeout: 5000 });

        res.json({ duplicates: mlRes.data.duplicates || [] });
    } catch (err) {
        console.error("Duplicate check error:", err.message);
        // Fail silently — never block submission
        res.json({ duplicates: [] });
    }
});

// ── POST /:id/upvote — Upvote an existing complaint ───────────────────────────
router.post("/:id/upvote", auth, async (req, res) => {
    try {
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).json({ message: "Invalid Complaint ID" });

        const userId = req.user?._id;
        const complaint = await Complaint.findById(id);
        if (!complaint) return res.status(404).json({ message: "Complaint not found" });

        // Idempotent — one upvote per user
        const alreadyVoted = complaint.upvotedBy.some(uid => uid.toString() === userId);
        if (alreadyVoted) {
            return res.json({ upvotes: complaint.upvotes, alreadyVoted: true });
        }

        complaint.upvotes += 1;
        complaint.upvotedBy.push(userId);
        await complaint.save();

        res.json({ upvotes: complaint.upvotes, alreadyVoted: false });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error upvoting complaint" });
    }
});

// ── POST / — Create complaint ─────────────────────────────────────────────────
router.post("/", auth, upload.single("file"), async (req, res) => {
    try {
        const { category, location, details, lat, lng } = req.body;

        let priority = "Low";
        try {
            const mlRes = await axios.post("http://127.0.0.1:8000/predict", {
                text: details
            }, { timeout: 5000 });
            const mlPriority = mlRes.data?.priority;
            if (mlPriority) priority = mlPriority;
        } catch (err) {
            console.error("ML failed, using default priority. Reason:", err.message);
        }

        const image = req.file ? req.file.filename : null;

        const complaint = new Complaint({
            category,
            location,
            details,
            image,
            priority,
            userId: req.user?._id,
            coordinates: {
                lat: lat ? parseFloat(lat) : null,
                lng: lng ? parseFloat(lng) : null
            }
        });

        // ── Set SLA deadline based on ML priority ─────────────────────────────
        complaint.setSLA();

        await complaint.save();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.DEPARTMENT_EMAIL,
            subject: `New Complaint Registered — ${priority} Priority`,
            text: `
Complaint Details
Category: ${category}
Location: ${location}
Details: ${details}
Priority: ${priority}
SLA Deadline: ${complaint.slaDeadline?.toISOString()}
Complaint ID: ${complaint._id}
            `,
        };

        if (req.file) {
            mailOptions.attachments = [{
                filename: req.file.filename,
                path: req.file.path,
            }];
        }

        await transporter.sendMail(mailOptions);

        res.json({
            message: "Complaint submitted and email sent",
            complaintId: complaint._id,
            priority,
            slaDeadline: complaint.slaDeadline,
            slaTotalHours: SLA_HOURS[priority]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

// ── GET / — Get all complaints (admin) ────────────────────────────────────────
router.get("/", async (req, res) => {
    try {
        const status = req.query.status;
        const category = req.query.category;

        const query = {};
        if (status) query.status = status;
        if (category) query.category = category;

        const complaints = await Complaint.find(query).sort({ createdAt: -1 });

        // Attach live SLA fields to each complaint before sending
        const enriched = complaints.map(c => ({
            ...c.toObject(),
            slaRemainingSeconds: c.slaRemainingSeconds(),
            slaStatus: c.slaStatus(),
            slaTotalHours: SLA_HOURS[c.priority] || 72,
        }));

        res.json(enriched);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching complaints" });
    }
});

// ── GET /user/my-complaints — Get logged-in user's complaints ─────────────────
// ⚠️ MUST be before /:id route
router.get("/user/my-complaints", auth, async (req, res) => {
    try {
        const complaints = await Complaint.find({ userId: req.user.id })
            .sort({ createdAt: -1 });

        const enriched = complaints.map(c => ({
            ...c.toObject(),
            slaRemainingSeconds: c.slaRemainingSeconds(),
            slaStatus: c.slaStatus(),
            slaTotalHours: SLA_HOURS[c.priority] || 72,
        }));

        res.json(enriched);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching complaints" });
    }
});

// ── POST /:id/feedback — Submit feedback ──────────────────────────────────────
// ⚠️ MUST be before /:id route
router.post("/:id/feedback", async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const complaint = await Complaint.findByIdAndUpdate(
            req.params.id,
            { feedback: { rating, comment, submittedAt: new Date() } },
            { new: true }
        );
        if (!complaint)
            return res.status(404).json({ message: "Complaint not found" });
        res.json({ message: "Feedback submitted", complaint });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error submitting feedback" });
    }
});

// ── GET /:id/sla — Get live SLA data for a single complaint ──────────────────
// ⚠️ MUST be before /:id route
router.get("/:id/sla", async (req, res) => {
    try {
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).json({ message: "Invalid Complaint ID" });

        const c = await Complaint.findById(id);
        if (!c) return res.status(404).json({ message: "Complaint not found" });

        const totalSecs = (SLA_HOURS[c.priority] || 72) * 3600;
        const remSecs = c.slaRemainingSeconds();

        res.json({
            complaintId: c._id,
            priority: c.priority,
            slaDeadline: c.slaDeadline,
            remainingSeconds: remSecs,
            totalSeconds: totalSecs,
            percentLeft: totalSecs > 0 ? Math.round((remSecs / totalSecs) * 100) : 0,
            status: c.slaStatus(),   // ok | urgent | breached | resolved
            isEscalated: c.isEscalated,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// ── GET /:id — Get single complaint ──────────────────────────────────────────
router.get("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).json({ message: "Invalid Complaint ID" });

        const complaint = await Complaint.findById(id);
        if (!complaint)
            return res.status(404).json({ message: "Complaint not found" });

        res.json({
            ...complaint.toObject(),
            slaRemainingSeconds: complaint.slaRemainingSeconds(),
            slaStatus: complaint.slaStatus(),
            slaTotalHours: SLA_HOURS[complaint.priority] || 72,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// ── PATCH /:id — Update status (with email notification) ─────────────────────
router.patch("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).json({ message: "Invalid Complaint ID" });

        const { status } = req.body;
        if (!status)
            return res.status(400).json({ message: "Status is required" });

        // Mark resolvedAt when status flips to Resolved
        const update = { status };
        if (status === "Resolved") update.resolvedAt = new Date();

        const complaint = await Complaint.findByIdAndUpdate(id, update, { new: true });

        if (!complaint)
            return res.status(404).json({ message: "Complaint not found" });

        const statusColors = {
            "Pending": "#f0b429",
            "In Progress": "#1e6bff",
            "Resolved": "#00c48c",
            "Rejected": "#ff4d6d",
        };

        const statusMessages = {
            "Pending": "Your complaint has been received and is awaiting review.",
            "In Progress": "Good news! Your complaint is being actively worked on.",
            "Resolved": "Your complaint has been resolved. Thank you for your patience.",
            "Rejected": "Unfortunately, your complaint could not be processed at this time.",
        };

        const User = require("../models/User");
        const user = await User.findById(complaint.userId).catch(() => null);
        const citizenEmail = user?.email;

        if (citizenEmail) {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: citizenEmail,
                subject: `Complaint Update: ${status} — Complaint Setu`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background: #0a1628; padding: 24px; border-radius: 12px 12px 0 0;">
                            <h1 style="color: white; margin: 0; font-size: 22px;">🏛️ Complaint Setu</h1>
                            <p style="color: #6b7a99; margin: 4px 0 0;">Government Citizens Connect Portal</p>
                        </div>
                        <div style="background: #f4f6fb; padding: 32px; border-radius: 0 0 12px 12px;">
                            <h2 style="color: #0a1628; margin: 0 0 8px;">Complaint Status Updated</h2>
                            <p style="color: #6b7a99; margin: 0 0 24px;">Your complaint status has been updated.</p>
                            <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px; border-left: 4px solid ${statusColors[status] || '#1e6bff'};">
                                <p style="margin: 0 0 8px; font-size: 12px; color: #6b7a99; text-transform: uppercase; letter-spacing: 1px;">New Status</p>
                                <p style="margin: 0; font-size: 22px; font-weight: bold; color: ${statusColors[status] || '#1e6bff'};">${status}</p>
                            </div>
                            <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                                <p style="margin: 0 0 12px; font-weight: bold; color: #0a1628;">Complaint Details</p>
                                <table style="width: 100%; font-size: 14px;">
                                    <tr><td style="color: #6b7a99; padding: 4px 0;">Complaint ID</td><td style="color: #0a1628; font-weight: 600;">${complaint._id}</td></tr>
                                    <tr><td style="color: #6b7a99; padding: 4px 0;">Category</td><td style="color: #0a1628;">${complaint.category}</td></tr>
                                    <tr><td style="color: #6b7a99; padding: 4px 0;">Location</td><td style="color: #0a1628;">${complaint.location}</td></tr>
                                </table>
                            </div>
                            <p style="color: #6b7a99; font-size: 14px; margin-bottom: 20px;">${statusMessages[status] || ""}</p>
                            <a href="${process.env.FRONTEND_URL}/track/${complaint._id}"
                               style="display: inline-block; background: #1e6bff; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                                Track Your Complaint
                            </a>
                            <p style="color: #6b7a99; font-size: 12px; margin-top: 24px;">
                                This is an automated message from Complaint Setu. Please do not reply to this email.
                            </p>
                        </div>
                    </div>
                `
            });
        }

        res.json({
            message: "Status updated",
            complaint: {
                ...complaint.toObject(),
                slaRemainingSeconds: complaint.slaRemainingSeconds(),
                slaStatus: complaint.slaStatus(),
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating complaint status" });
    }
});

// ── PUT /:id — Update status (used by admin dashboard) ───────────────────────
// ── PUT /:id — Update status (used by admin dashboard) ───────────────────────
router.put("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).json({ message: "Invalid Complaint ID" });

        const { status } = req.body;
        if (!status)
            return res.status(400).json({ message: "Status is required" });

        const update = { status };
        if (status === "Resolved") update.resolvedAt = new Date();

        const updated = await Complaint.findByIdAndUpdate(id, update, { new: true });
        if (!updated)
            return res.status(404).json({ message: "Complaint not found" });

        // ── DEBUG: log every step ────────────────────────────────────────────
        console.log("=== PUT /:id STATUS UPDATE ===");
        console.log("Complaint ID  :", updated._id);
        console.log("New Status    :", status);
        console.log("userId on doc :", updated.userId);   // ← if null, no email possible

        const User = require("../models/User");
        const user = await User.findById(updated.userId).catch((e) => {
            console.log("User lookup ERROR:", e.message);
            return null;
        });

        console.log("User found    :", !!user);
        console.log("Citizen email :", user?.email);      // ← if undefined, check User model

        const citizenEmail = user?.email;

        if (!citizenEmail) {
            console.log("⚠️  No citizen email — skipping email send");
        } else {
            console.log("📧 Sending email to:", citizenEmail);
            try {
                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: citizenEmail,                     // ✅ citizen, not DEPARTMENT_EMAIL
                    subject: `Complaint Update: ${status} — Complaint Setu`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <div style="background: #0a1628; padding: 24px; border-radius: 12px 12px 0 0;">
                                <h1 style="color: white; margin: 0; font-size: 22px;">🏛️ Complaint Setu</h1>
                                <p style="color: #6b7a99; margin: 4px 0 0;">Government Citizens Connect Portal</p>
                            </div>
                            <div style="background: #f4f6fb; padding: 32px; border-radius: 0 0 12px 12px;">
                                <h2 style="color: #0a1628; margin: 0 0 8px;">Complaint Status Updated</h2>
                                <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px; border-left: 4px solid #1e6bff;">
                                    <p style="margin: 0 0 8px; font-size: 12px; color: #6b7a99; text-transform: uppercase;">New Status</p>
                                    <p style="margin: 0; font-size: 22px; font-weight: bold; color: #1e6bff;">${status}</p>
                                </div>
                                <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                                    <table style="width: 100%; font-size: 14px;">
                                        <tr><td style="color: #6b7a99; padding: 4px 0;">Complaint ID</td><td>${updated._id}</td></tr>
                                        <tr><td style="color: #6b7a99; padding: 4px 0;">Category</td><td>${updated.category}</td></tr>
                                        <tr><td style="color: #6b7a99; padding: 4px 0;">Location</td><td>${updated.location}</td></tr>
                                    </table>
                                </div>
                                <a href="${process.env.FRONTEND_URL}/track/${updated._id}"
                                   style="display:inline-block;background:#1e6bff;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
                                    Track Your Complaint
                                </a>
                            </div>
                        </div>
                    `
                });
                console.log("✅ Email sent successfully to", citizenEmail);
            } catch (mailErr) {
                console.log("❌ Email send FAILED:", mailErr.message);  // ← SMTP error shows here
            }
        }
        // ────────────────────────────────────────────────────────────────────

        res.json({
            ...updated.toObject(),
            slaRemainingSeconds: updated.slaRemainingSeconds(),
            slaStatus: updated.slaStatus(),
            slaTotalHours: SLA_HOURS[updated.priority] || 72,
        });
    } catch (error) {
        console.error("PUT /:id ERROR:", error);
        res.status(500).json({ message: "Error updating complaint" });
    }
});
module.exports = router;