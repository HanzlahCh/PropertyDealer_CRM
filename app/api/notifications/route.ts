import { NextRequest } from "next/server";
import dbConnect from "@/app/_lib/db";
import Lead from "@/models/Lead";
import { getSession } from "@/app/_lib/session";

// GET /api/notifications — get recent lead changes for the current user
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = req.nextUrl;
    const since = searchParams.get("since");
    const sinceDate = since ? new Date(since) : new Date(Date.now() - 24 * 60 * 60 * 1000);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {
      lastActivityAt: { $gt: sinceDate },
    };

    // Agents only see notifications for their leads
    if (session.role === "agent") {
      query.assignedTo = session.userId;
    }

    const recentChanges = await Lead.find(query)
      .select("name status priority assignedTo lastActivityAt")
      .populate("assignedTo", "name")
      .sort({ lastActivityAt: -1 })
      .limit(20)
      .lean();

    const notifications = recentChanges.map((lead) => ({
      id: String(lead._id),
      leadName: lead.name,
      status: lead.status,
      priority: lead.priority,
      timestamp: lead.lastActivityAt,
    }));

    return Response.json({ notifications, count: notifications.length });
  } catch (error) {
    console.error("Notifications error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
