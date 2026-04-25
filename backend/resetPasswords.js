const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");

const BCRYPT_ROUNDS = 12;

async function resetPasswords() {
    // --- Password must be provided via environment variable, never hardcoded ---
    const resetPassword = process.env.RESET_PASSWORD;

    if (!resetPassword) {
        console.error("❌ RESET_PASSWORD environment variable is not set.");
        console.error("   Usage: RESET_PASSWORD=yourNewPassword node resetPasswords.js");
        process.exit(1);
    }

    if (resetPassword.length < 12) {
        console.error("❌ RESET_PASSWORD must be at least 12 characters long.");
        process.exit(1);
    }

    if (!process.env.MONGO_URI) {
        console.error("❌ MONGO_URI is not set.");
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        const users = await User.find({});
        const hashedPassword = await bcrypt.hash(resetPassword, BCRYPT_ROUNDS);

        for (const user of users) {
            await User.updateOne({ _id: user._id }, { $set: { password: hashedPassword } });
            console.log(`✅ Password reset for: ${user.email}`);
        }

        console.log("✅ All passwords have been reset.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error.message);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
    }
}

resetPasswords();