import { NextRequest } from "next/server";
import dbConnect from "@/app/_lib/db";
import User from "@/models/User";
import { getSession } from "@/app/_lib/session";

// GET /api/agents — list all agents (admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (session.role !== "admin") {
      return Response.json({ message: "Forbidden" }, { status: 403 });
    }

    await dbConnect();

    // Get all agents with their lead counts
    const agents = await User.find({ role: "agent" })
      .select("name email role createdAt")
      .sort({ createdAt: -1 })
      .lean();

    // Format for response
    const formatted = agents.map((agent) => ({
      id: String(agent._id),
      name: agent.name,
      email: agent.email,
      role: agent.role,
      createdAt: agent.createdAt,
    }));

    return Response.json({ agents: formatted });
  } catch (error) {
    console.error("Get agents error:", error);
    return Response.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
