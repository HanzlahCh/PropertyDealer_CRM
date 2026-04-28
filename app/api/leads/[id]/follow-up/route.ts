import { NextRequest } from "next/server";
import dbConnect from "@/app/_lib/db";
import Lead from "@/models/Lead";
import { getSession } from "@/app/_lib/session";
import { logActivity } from "@/app/_lib/activity-logger";

// POST /api/leads/[id]/follow-up — set or update follow-up date
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { followUpDate } = body;

    if (!followUpDate) {
      return Response.json({ message: "Follow-up date is required" }, { status: 400 });
    }

    await dbConnect();

    const lead = await Lead.findById(id);
    if (!lead) {
      return Response.json({ message: "Lead not found" }, { status: 404 });
    }

    // Agents can only update their own leads
    if (session.role === "agent" && String(lead.assignedTo) !== session.userId) {
      return Response.json({ message: "Forbidden" }, { status: 403 });
    }

    lead.followUpDate = new Date(followUpDate);
    lead.lastActivityAt = new Date();
    await lead.save();

    logActivity({
      leadId: id,
      userId: session.userId,
      action: "follow_up_set",
      details: { date: followUpDate },
    }).catch(() => {});

    return Response.json({ message: "Follow-up date set", lead });
  } catch (error) {
    console.error("Set follow-up error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/leads/[id]/follow-up — clear follow-up date
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();

    const lead = await Lead.findById(id);
    if (!lead) {
      return Response.json({ message: "Lead not found" }, { status: 404 });
    }

    lead.followUpDate = null;
    lead.lastActivityAt = new Date();
    await lead.save();

    return Response.json({ message: "Follow-up cleared" });
  } catch (error) {
    console.error("Clear follow-up error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
