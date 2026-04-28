import { NextRequest } from "next/server";
import dbConnect from "@/app/_lib/db";
import Activity from "@/models/Activity";
import { getSession } from "@/app/_lib/session";

// GET /api/leads/[id]/timeline
export async function GET(
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

    const activities = await Activity.find({ leadId: id })
      .populate("userId", "name email role")
      .sort({ timestamp: -1 })
      .limit(50)
      .lean();

    const formatted = activities.map((a) => {
      const user = a.userId as unknown as { _id: unknown; name: string; email: string; role: string } | null;
      return {
        id: String(a._id),
        action: a.action,
        details: a.details,
        timestamp: a.timestamp,
        user: user
          ? { id: String(user._id), name: user.name, role: user.role }
          : null,
      };
    });

    return Response.json({ activities: formatted });
  } catch (error) {
    console.error("Timeline error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
