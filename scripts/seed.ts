/**
 * Seed script — creates default users and sample leads.
 *
 * Usage:  npm run seed
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/property_crm";

const sampleLeads = [
  {
    name: "Ahmed Khan",
    email: "ahmed.khan@example.com",
    phone: "923001234567",
    propertyInterest: "5 Marla House, DHA Phase 6",
    budget: 25000000,
    status: "New",
    source: "Facebook",
    notes: "Looking for a corner plot house near park.",
  },
  {
    name: "Fatima Malik",
    email: "fatima.malik@example.com",
    phone: "923009876543",
    propertyInterest: "3 Bed Apartment, Gulberg",
    budget: 15000000,
    status: "Contacted",
    source: "Walk-in",
    notes: "Wants furnished apartment with parking.",
  },
  {
    name: "Usman Ali",
    email: "usman.ali@example.com",
    phone: "923217654321",
    propertyInterest: "10 Marla Plot, Bahria Town",
    budget: 8000000,
    status: "Qualified",
    source: "Website",
    notes: "Investment purpose. Looking for quick possession.",
  },
  {
    name: "Sara Ahmed",
    email: "sara.ahmed@example.com",
    phone: "923331122334",
    propertyInterest: "1 Kanal House, Model Town",
    budget: 45000000,
    status: "Negotiation",
    source: "Referral",
    notes: "Premium client. Referred by Imran sb.",
  },
  {
    name: "Hassan Raza",
    email: "hassan.raza@example.com",
    phone: "923454455667",
    propertyInterest: "Commercial Shop, Liberty Market",
    budget: 35000000,
    status: "New",
    source: "Facebook",
    notes: "Looking for ground floor shop with good frontage.",
  },
  {
    name: "Ayesha Siddiqui",
    email: "ayesha.s@example.com",
    phone: "923112233445",
    propertyInterest: "2 Bed Flat, Johar Town",
    budget: 6000000,
    status: "Contacted",
    source: "Website",
    notes: "First-time buyer. Needs guidance.",
  },
  {
    name: "Bilal Hussain",
    email: "bilal.h@example.com",
    phone: "923007788990",
    propertyInterest: "8 Marla House, Wapda Town",
    budget: 18000000,
    status: "Closed-Won",
    source: "Referral",
    notes: "Deal closed at 17.5M. Happy customer.",
  },
  {
    name: "Zainab Noor",
    email: "zainab.noor@example.com",
    phone: "923339988776",
    propertyInterest: "5 Marla Plot, LDA Avenue",
    budget: 5000000,
    status: "Closed-Lost",
    source: "Other",
    notes: "Lost to competitor. Price was too high.",
  },
];

function calculateScore(budget: number, source: string, phone: string, notes: string, propertyInterest: string) {
  let score = 0;
  const SOURCE_BONUS: Record<string, number> = { Referral: 10, "Walk-in": 8, Website: 5, Facebook: 3, Other: 0 };
  if (budget > 20_000_000) score = 85;
  else if (budget >= 10_000_000) score = 55;
  else if (budget >= 5_000_000) score = 35;
  else score = 15;
  score += SOURCE_BONUS[source] || 0;
  if (phone && phone.length > 5) score += 2;
  if (notes && notes.length > 10) score += 2;
  if (propertyInterest && propertyInterest.length > 5) score += 1;
  score = Math.min(100, score);
  let priority: string;
  if (score >= 70) priority = "High";
  else if (score >= 40) priority = "Medium";
  else priority = "Low";
  return { score, priority };
}

async function seed() {
  console.log("🌱 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);

  const db = mongoose.connection.db;
  if (!db) throw new Error("DB connection failed");

  const usersCol = db.collection("users");
  const leadsCol = db.collection("leads");

  // ── Users ──
  const existingAdmin = await usersCol.findOne({ role: "admin" });
  let adminId: mongoose.Types.ObjectId;
  let agentId: mongoose.Types.ObjectId;

  if (existingAdmin) {
    console.log("✅ Admin already exists:", existingAdmin.email);
    adminId = existingAdmin._id as mongoose.Types.ObjectId;
  } else {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const result = await usersCol.insertOne({
      name: "Admin User",
      email: "admin@crm.com",
      password: hashedPassword,
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    adminId = result.insertedId as unknown as mongoose.Types.ObjectId;
    console.log("✅ Admin created:  admin@crm.com / admin123");
  }

  const existingAgent = await usersCol.findOne({ role: "agent" });
  if (existingAgent) {
    console.log("✅ Agent already exists:", existingAgent.email);
    agentId = existingAgent._id as mongoose.Types.ObjectId;
  } else {
    const agentPassword = await bcrypt.hash("agent123", 10);
    const result = await usersCol.insertOne({
      name: "Ali Agent",
      email: "agent@crm.com",
      password: agentPassword,
      role: "agent",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    agentId = result.insertedId as unknown as mongoose.Types.ObjectId;
    console.log("✅ Agent created:  agent@crm.com / agent123");
  }

  // ── Leads ──
  const existingLeads = await leadsCol.countDocuments();
  if (existingLeads > 0) {
    console.log(`✅ ${existingLeads} leads already exist. Skipping lead seeding.`);
  } else {
    const leadsToInsert = sampleLeads.map((lead, i) => {
      const { score, priority } = calculateScore(lead.budget, lead.source, lead.phone, lead.notes, lead.propertyInterest);
      const daysAgo = (sampleLeads.length - i) * 3;
      const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
      return {
        ...lead,
        assignedTo: i % 2 === 0 ? agentId : null,
        score,
        priority,
        followUpDate: i < 4 ? new Date(Date.now() + (i - 1) * 24 * 60 * 60 * 1000) : null,
        lastActivityAt: createdAt,
        createdAt,
        updatedAt: createdAt,
      };
    });

    await leadsCol.insertMany(leadsToInsert);
    console.log(`✅ ${leadsToInsert.length} sample leads created.`);
  }

  // ── Activities ──
  const activitiesCol = db.collection("activities");
  const existingActivities = await activitiesCol.countDocuments();
  if (existingActivities === 0) {
    const leads = await leadsCol.find().toArray();
    const activities = leads.map((lead) => ({
      leadId: lead._id,
      userId: adminId,
      action: "created",
      details: { name: lead.name, budget: lead.budget },
      timestamp: lead.createdAt,
    }));
    await activitiesCol.insertMany(activities);
    console.log(`✅ ${activities.length} activity records created.`);
  }

  await mongoose.disconnect();
  console.log("\n🌱 Seed complete!");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
