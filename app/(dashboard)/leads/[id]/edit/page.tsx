import { verifySession } from "@/app/_lib/dal";
import dbConnect from "@/app/_lib/db";
import Lead from "@/models/Lead";
import User from "@/models/User";
import LeadForm from "@/app/_components/LeadForm";
import { updateLeadAction } from "@/app/actions/leads";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function EditLeadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await verifySession();
  const { id } = await params;
  await dbConnect();

  const lead = await Lead.findById(id).lean();
  if (!lead) notFound();

  // Agents can only edit their assigned leads
  if (
    session.role === "agent" &&
    String(lead.assignedTo) !== session.userId
  ) {
    notFound();
  }

  // Fetch agents for dropdown
  let agents: { id: string; name: string }[] = [];
  if (session.role === "admin") {
    const agentDocs = await User.find({ role: "agent" })
      .select("name")
      .lean();
    agents = agentDocs.map((a) => ({
      id: String(a._id),
      name: a.name,
    }));
  }

  const boundAction = updateLeadAction.bind(null, id);

  return (
    <div>
      <div className="mb-8">
        <Link
          href={`/leads/${id}`}
          className="text-sm text-muted hover:text-accent mb-2 inline-block"
        >
          ← Back to Lead
        </Link>
        <h1 className="text-2xl font-bold">Edit Lead</h1>
        <p className="text-muted text-sm mt-1">
          Update details for {lead.name}
        </p>
      </div>

      <div className="card max-w-4xl">
        <LeadForm
          agents={agents}
          initialData={{
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            propertyInterest: lead.propertyInterest,
            budget: lead.budget,
            status: lead.status,
            notes: lead.notes,
            source: lead.source,
            assignedTo: lead.assignedTo ? String(lead.assignedTo) : undefined,
          }}
          action={boundAction}
          submitLabel="Update Lead"
        />
      </div>
    </div>
  );
}
