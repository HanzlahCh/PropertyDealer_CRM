import { NextRequest } from "next/server";
import dbConnect from "@/app/_lib/db";
import Lead from "@/models/Lead";
import { getSession } from "@/app/_lib/session";
import { LeadUpdateSchema } from "@/app/_lib/definitions";

// GET /api/leads/[id]
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

    const lead = await Lead.findById(id)
      .populate("assignedTo", "name email")
      .lean();

    if (!lead) {
      return Response.json({ message: "Lead not found" }, { status: 404 });
    }

    // Agents can only view their assigned leads
    if (
      session.role === "agent" &&
      String(lead.assignedTo?._id || lead.assignedTo) !== session.userId
    ) {
      return Response.json({ message: "Forbidden" }, { status: 403 });
    }

    return Response.json({ lead });
  } catch (error) {
    console.error("Get lead error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/leads/[id]
export async function PUT(
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
    const parsed = LeadUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await dbConnect();

    const lead = await Lead.findById(id);
    if (!lead) {
      return Response.json({ message: "Lead not found" }, { status: 404 });
    }

    // Update fields
    Object.assign(lead, parsed.data);
    lead.lastActivityAt = new Date();
    await lead.save(); // triggers scoring recalculation

    await lead.populate("assignedTo", "name email");

    return Response.json({ message: "Lead updated", lead });
  } catch (error) {
    console.error("Update lead error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/leads/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Only admins can delete
    if (session.role !== "admin") {
      return Response.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    await dbConnect();

    const lead = await Lead.findByIdAndDelete(id);
    if (!lead) {
      return Response.json({ message: "Lead not found" }, { status: 404 });
    }

    return Response.json({ message: "Lead deleted" });
  } catch (error) {
    console.error("Delete lead error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
