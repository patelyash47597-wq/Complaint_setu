const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");

const BCRYPT_ROUNDS = 12; // Increased from 10 for better resistance

function isHashed(password) {
    // Robust check: bcryptjs hashes start with $2a$ or $2b$
    return /^\$2[ab]\$\d{2}\$/.test(password);
}

async function hashExistingPasswords() {
    if (!process.env.MONGO_URI) {
        console.error("❌ MONGO_URI is not set.");
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        const users = await User.find({}).select("+password"); // ensure password field is fetched

        for (const user of users) {
            if (!user.password) {
                console.warn(`⚠️  No password found for user: ${user.email}, skipping.`);
                continue;
            }

            if (isHashed(user.password)) {
                console.log(`✅ Already hashed: ${user.email}`);
                continue;
            }

            console.log(`🔒 Hashing password for: ${user.email}`);
            const hashedPassword = await bcrypt.hash(user.password, BCRYPT_ROUNDS);

            // Bypass pre-save hook to avoid double-hashing
            await User.updateOne({ _id: user._id }, { $set: { password: hashedPassword } });
            console.log(`✅ Hashed: ${user.email}`);
        }

        console.log("✅ All passwords checked and hashed if necessary.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error.message);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
    }
}

hashExistingPasswords();