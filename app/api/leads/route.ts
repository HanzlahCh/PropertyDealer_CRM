import { NextRequest } from "next/server";
import dbConnect from "@/app/_lib/db";
import Lead from "@/models/Lead";
import User from "@/models/User";
import { getSession } from "@/app/_lib/session";
import { LeadCreateSchema } from "@/app/_lib/definitions";
import { sendEmail } from "@/app/_lib/email";
import { newLeadEmailTemplate } from "@/app/_lib/email-templates";
import { logActivity } from "@/app/_lib/activity-logger";

// GET /api/leads — list leads (admin: all, agent: assigned only)
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = req.nextUrl;
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const source = searchParams.get("source");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    // Build query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};

    // Agents can only see their own leads
    if (session.role === "agent") {
      query.assignedTo = session.userId;
    }

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (source) query.source = source;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { propertyInterest: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Lead.countDocuments(query);
    const leads = await Lead.find(query)
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return Response.json({
      leads,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get leads error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}

// POST /api/leads — create a new lead
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = LeadCreateSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await dbConnect();

    const lead = new Lead(parsed.data);
    await lead.save(); // triggers pre-save scoring

    await lead.populate("assignedTo", "name email");

    // Fire-and-forget: log activity + email
    logActivity({
      leadId: String(lead._id),
      userId: session.userId,
      action: "created",
      details: { name: lead.name, budget: lead.budget },
    }).catch(() => {});
    notifyAdmins(parsed.data).catch(() => {});

    return Response.json(
      { message: "Lead created successfully", lead },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create lead error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }

  // Fire-and-forget: email admin about new lead
  async function notifyAdmins(leadData: typeof parsed.data) {
    try {
      const admins = await User.find({ role: "admin" }).select("email").lean();
      for (const admin of admins) {
        await sendEmail({
          to: admin.email,
          subject: `New Lead: ${leadData.name}`,
          html: newLeadEmailTemplate(leadData),
        });
      }
    } catch (e) {
      console.error("Admin notification failed:", e);
    }
  }
}
