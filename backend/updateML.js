const mongoose = require("mongoose");
const axios = require("axios");
require("dotenv").config();

const Complaint = require("./models/Complaint");

const ML_API_URL = process.env.ML_API_URL || "http://127.0.0.1:8000/predict";
const VALID_PRIORITIES = ["low", "medium", "high", "critical"]; // adjust to match your ML model output

async function updateComplaintPriorities() {
    if (!process.env.MONGO_URI) {
        console.error("❌ MONGO_URI is not set.");
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        const complaints = await Complaint.find({});
        console.log(`📋 Found ${complaints.length} complaints to process.`);

        let successCount = 0;
        let failCount = 0;

        for (const complaint of complaints) {
            const text = (complaint.details || "").trim();

            if (!text) {
                console.warn(`⚠️  Complaint ${complaint._id} has no details, skipping.`);
                failCount++;
                continue;
            }

            try {
                const res = await axios.post(
                    ML_API_URL,
                    { text },
                    { timeout: 10000 } // 10s timeout per request
                );

                const priority = res.data?.priority;

                // Validate the ML response before saving
                if (!priority || !VALID_PRIORITIES.includes(priority)) {
                    console.warn(`⚠️  Invalid priority "${priority}" for complaint ${complaint._id}, skipping.`);
                    failCount++;
                    continue;
                }

                complaint.priority = priority;
                await complaint.save();
                successCount++;
                console.log(`✅ Updated complaint ${complaint._id} → priority: ${priority}`);
            } catch (mlErr) {
                console.error(`❌ ML request failed for complaint ${complaint._id}:`, mlErr.message);
                failCount++;
            }
        }

        console.log(`\n✅ Done. Success: ${successCount}, Failed/Skipped: ${failCount}`);
        process.exit(0);
    } catch (error) {
        console.error("❌ Fatal error:", error.message);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
    }
}

updateComplaintPriorities();