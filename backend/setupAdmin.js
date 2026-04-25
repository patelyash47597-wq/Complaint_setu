const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

async function setupAdmin() {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const mongoUri = process.env.MONGO_URI;

    // --- Validate required env vars ---
    if (!adminEmail || !adminPassword || !mongoUri) {
        console.error("❌ ADMIN_EMAIL, ADMIN_PASSWORD, and MONGO_URI must be set in .env");
        process.exit(1);
    }

    // --- Basic password strength check ---
    if (adminPassword.length < 12) {
        console.error("❌ ADMIN_PASSWORD must be at least 12 characters long.");
        process.exit(1);
    }

    // --- Basic email format check ---
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(adminEmail)) {
        console.error("❌ ADMIN_EMAIL is not a valid email address.");
        process.exit(1);
    }

    try {
        await mongoose.connect(mongoUri);
        console.log("✅ Connected to MongoDB");

        const normalizedEmail = adminEmail.toLowerCase().trim();
        let admin = await User.findOne({ email: normalizedEmail });

        if (admin) {
            // pre-save hook will hash the password
            admin.password = adminPassword;
            admin.role = "admin";
            await admin.save();
            console.log("✅ Admin updated");
        } else {
            await User.create({
                name: "Admin Dashboard",
                email: normalizedEmail,
                password: adminPassword, // pre-save hook hashes it
                role: "admin",
            });
            console.log("✅ Admin created");
        }

        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error.message);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
    }
}

setupAdmin();