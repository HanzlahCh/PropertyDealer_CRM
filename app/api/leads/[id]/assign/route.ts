import { NextRequest } from "next/server";
import dbConnect from "@/app/_lib/db";
import Lead from "@/models/Lead";
import { getSession } from "@/app/_lib/session";

// POST /api/leads/[id]/assign — assign/reassign lead to an agent
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (session.role !== "admin") {
      return Response.json({ message: "Only admins can assign leads" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { agentId } = body;

    if (!agentId) {
      return Response.json({ message: "Agent ID is required" }, { status: 400 });
    }

    await dbConnect();

    const lead = await Lead.findById(id);
    if (!lead) {
      return Response.json({ message: "Lead not found" }, { status: 404 });
    }

    lead.assignedTo = agentId;
    lead.lastActivityAt = new Date();
    await lead.save();

    await lead.populate("assignedTo", "name email");

    return Response.json({ message: "Lead assigned successfully", lead });
  } catch (error) {
    console.error("Assign lead error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
