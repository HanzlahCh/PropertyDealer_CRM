import { NextRequest } from "next/server";
import dbConnect from "@/app/_lib/db";
import Lead from "@/models/Lead";
import { getSession } from "@/app/_lib/session";

// GET /api/follow-ups — get leads with upcoming/overdue follow-ups
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = req.nextUrl;
    const filter = searchParams.get("filter") || "all"; // all | today | overdue | upcoming

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {
      followUpDate: { $ne: null },
      status: { $nin: ["Closed-Won", "Closed-Lost"] },
    };

    if (session.role === "agent") {
      query.assignedTo = session.userId;
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    if (filter === "today") {
      query.followUpDate = { $gte: todayStart, $lt: todayEnd };
    } else if (filter === "overdue") {
      query.followUpDate = { $lt: todayStart };
    } else if (filter === "upcoming") {
      query.followUpDate = { $gte: todayEnd };
    }

    const leads = await Lead.find(query)
      .populate("assignedTo", "name email")
      .select("name email phone propertyInterest budget status priority followUpDate assignedTo")
      .sort({ followUpDate: 1 })
      .limit(50)
      .lean();

    const formatted = leads.map((l) => {
      const agent = l.assignedTo as unknown as { _id: unknown; name: string } | null;
      return {
        _id: String(l._id),
        name: l.name,
        email: l.email,
        propertyInterest: l.propertyInterest,
        status: l.status,
        priority: l.priority,
        followUpDate: l.followUpDate,
        agentName: agent?.name || "Unassigned",
        isOverdue: l.followUpDate ? new Date(l.followUpDate) < todayStart : false,
        isToday: l.followUpDate
          ? new Date(l.followUpDate) >= todayStart && new Date(l.followUpDate) < todayEnd
          : false,
      };
    });

    return Response.json({ followUps: formatted, count: formatted.length });
  } catch (error) {
    console.error("Follow-ups error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
