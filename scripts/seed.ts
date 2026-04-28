/**
 * Seed script — creates a default admin user if none exists.
 *
 * Usage:  npx tsx scripts/seed.ts
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/property_crm";

async function seed() {
  console.log("🌱 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);

  const db = mongoose.connection.db;
  if (!db) throw new Error("DB connection failed");

  const usersCol = db.collection("users");

  // Check if admin exists
  const existingAdmin = await usersCol.findOne({ role: "admin" });
  if (existingAdmin) {
    console.log("✅ Admin user already exists:", existingAdmin.email);
    await mongoose.disconnect();
    return;
  }

  // Create default admin
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const result = await usersCol.insertOne({
    name: "Admin User",
    email: "admin@crm.com",
    password: hashedPassword,
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log("✅ Default admin created:");
  console.log("   Email:    admin@crm.com");
  console.log("   Password: admin123");
  console.log("   ID:      ", result.insertedId.toString());

  // Create a sample agent
  const agentPassword = await bcrypt.hash("agent123", 10);
  const agentResult = await usersCol.insertOne({
    name: "Ali Agent",
    email: "agent@crm.com",
    password: agentPassword,
    role: "agent",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log("\n✅ Sample agent created:");
  console.log("   Email:    agent@crm.com");
  console.log("   Password: agent123");
  console.log("   ID:      ", agentResult.insertedId.toString());

  await mongoose.disconnect();
  console.log("\n🌱 Seed complete!");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
