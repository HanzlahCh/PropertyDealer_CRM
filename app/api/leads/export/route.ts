import { NextRequest } from "next/server";
import dbConnect from "@/app/_lib/db";
import Lead from "@/models/Lead";
import { getSession } from "@/app/_lib/session";

// GET /api/leads/export — export leads as CSV
export async function GET(_req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};
    if (session.role === "agent") {
      query.assignedTo = session.userId;
    }

    const leads = await Lead.find(query)
      .populate("assignedTo", "name")
      .sort({ createdAt: -1 })
      .lean();

    // Build CSV
    const headers = [
      "Name",
      "Email",
      "Phone",
      "Property Interest",
      "Budget (PKR)",
      "Status",
      "Priority",
      "Score",
      "Source",
      "Assigned To",
      "Follow-up Date",
      "Created At",
    ];

    const rows = leads.map((l) => {
      const agent = l.assignedTo as unknown as { name: string } | null;
      return [
        escapeCsv(l.name),
        escapeCsv(l.email),
        escapeCsv(l.phone || ""),
        escapeCsv(l.propertyInterest),
        l.budget,
        l.status,
        l.priority,
        l.score,
        l.source,
        agent?.name || "Unassigned",
        l.followUpDate ? new Date(l.followUpDate).toISOString().split("T")[0] : "",
        new Date(l.createdAt).toISOString().split("T")[0],
      ].join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="leads_export_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
