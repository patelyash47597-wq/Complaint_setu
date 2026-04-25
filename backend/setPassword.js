const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const BCRYPT_ROUNDS = 12;

/**
 * Safely sets a hashed password for a specific user.
 * Usage: TARGET_EMAIL=user@example.com NEW_PASSWORD=yourPassword node setPassword.js
 */
async function setPassword() {
    const targetEmail = process.env.TARGET_EMAIL;
    const newPassword = process.env.NEW_PASSWORD;

    if (!targetEmail || !newPassword) {
        console.error("❌ TARGET_EMAIL and NEW_PASSWORD must be set as environment variables.");
        console.error("   Usage: TARGET_EMAIL=user@example.com NEW_PASSWORD=yourPassword node setPassword.js");
        process.exit(1);
    }

    if (newPassword.length < 12) {
        console.error("❌ NEW_PASSWORD must be at least 12 characters long.");
        process.exit(1);
    }

    if (!process.env.MONGO_URI) {
        console.error("❌ MONGO_URI is not set.");
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        // Dynamic import to avoid loading User model path issues
        const User = require("./models/User");

        const user = await User.findOne({ email: targetEmail.toLowerCase().trim() });
        if (!user) {
            console.error(`❌ User not found: ${targetEmail}`);
            process.exit(1);
        }

        const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

        // Bypass pre-save hooks intentionally to avoid double-hashing
        await User.updateOne(
            { _id: user._id },
            { $set: { password: hashedPassword } }
        );

        console.log(`✅ Password updated for: ${user.email}`);
        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error.message);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
    }
}

setPassword();