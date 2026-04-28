import { NextRequest } from "next/server";
import dbConnect from "@/app/_lib/db";
import Lead from "@/models/Lead";
import User from "@/models/User";
import { getSession } from "@/app/_lib/session";
import { sendEmail } from "@/app/_lib/email";
import { leadAssignedEmailTemplate } from "@/app/_lib/email-templates";
import { logActivity } from "@/app/_lib/activity-logger";

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

    // Fire-and-forget email to assigned agent
    const agent = await User.findById(agentId).select("name email").lean();
    if (agent) {
      sendEmail({
        to: agent.email,
        subject: `Lead Assigned: ${lead.name}`,
        html: leadAssignedEmailTemplate({
          agentName: agent.name,
          leadName: lead.name,
          leadEmail: lead.email,
          propertyInterest: lead.propertyInterest,
          budget: lead.budget,
          leadId: id,
        }),
      }).catch(() => {});

      // Log activity
      logActivity({
        leadId: id,
        userId: session.userId,
        action: "assigned",
        details: { agentName: agent.name, agentId },
      }).catch(() => {});
    }

    return Response.json({ message: "Lead assigned successfully", lead });
  } catch (error) {
    console.error("Assign lead error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
