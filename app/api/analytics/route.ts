import { NextRequest } from "next/server";
import dbConnect from "@/app/_lib/db";
import Lead from "@/models/Lead";
import User from "@/models/User";
import { getSession } from "@/app/_lib/session";

// GET /api/analytics — aggregated CRM stats
export async function GET(_req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (session.role !== "admin") {
      return Response.json({ message: "Forbidden" }, { status: 403 });
    }

    await dbConnect();

    // Total counts
    const [totalLeads, totalAgents] = await Promise.all([
      Lead.countDocuments(),
      User.countDocuments({ role: "agent" }),
    ]);

    // Status breakdown
    const statusCounts = await Lead.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const statusMap: Record<string, number> = {};
    for (const s of statusCounts) {
      statusMap[s._id] = s.count;
    }

    // Priority breakdown
    const priorityCounts = await Lead.aggregate([
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ]);
    const priorityMap: Record<string, number> = {};
    for (const p of priorityCounts) {
      priorityMap[p._id] = p.count;
    }

    // Source breakdown
    const sourceCounts = await Lead.aggregate([
      { $group: { _id: "$source", count: { $sum: 1 } } },
    ]);
    const sourceMap: Record<string, number> = {};
    for (const s of sourceCounts) {
      sourceMap[s._id] = s.count;
    }

    // Agent performance — leads per agent
    const agentLeads = await Lead.aggregate([
      { $match: { assignedTo: { $ne: null } } },
      { $group: { _id: "$assignedTo", total: { $sum: 1 }, closed: { $sum: { $cond: [{ $eq: ["$status", "Closed-Won"] }, 1, 0] } } } },
      { $sort: { total: -1 } },
      { $limit: 10 },
    ]);

    // Lookup agent names
    const agentIds = agentLeads.map((a) => a._id);
    const agentDocs = await User.find({ _id: { $in: agentIds } })
      .select("name")
      .lean();
    const agentNameMap: Record<string, string> = {};
    for (const a of agentDocs) {
      agentNameMap[String(a._id)] = a.name;
    }

    const agentPerformance = agentLeads.map((a) => ({
      name: agentNameMap[String(a._id)] || "Unknown",
      total: a.total,
      closed: a.closed,
      conversionRate: a.total > 0 ? Math.round((a.closed / a.total) * 100) : 0,
    }));

    // Monthly trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrend = await Lead.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const months = monthlyTrend.map((m) => ({
      label: `${m._id.year}-${String(m._id.month).padStart(2, "0")}`,
      count: m.count,
    }));

    // Budget stats
    const budgetStats = await Lead.aggregate([
      {
        $group: {
          _id: null,
          avgBudget: { $avg: "$budget" },
          totalBudget: { $sum: "$budget" },
          maxBudget: { $max: "$budget" },
        },
      },
    ]);

    const budget = budgetStats[0] || { avgBudget: 0, totalBudget: 0, maxBudget: 0 };

    // Overdue follow-ups
    const overdueFollowUps = await Lead.countDocuments({
      followUpDate: { $lt: new Date(new Date().toDateString()) },
      status: { $nin: ["Closed-Won", "Closed-Lost"] },
    });

    return Response.json({
      summary: {
        totalLeads,
        totalAgents,
        closedWon: statusMap["Closed-Won"] || 0,
        closedLost: statusMap["Closed-Lost"] || 0,
        highPriority: priorityMap["High"] || 0,
        overdueFollowUps,
        avgBudget: Math.round(budget.avgBudget || 0),
        totalPipelineValue: Math.round(budget.totalBudget || 0),
      },
      statusBreakdown: statusMap,
      priorityBreakdown: priorityMap,
      sourceBreakdown: sourceMap,
      agentPerformance,
      monthlyTrend: months,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
