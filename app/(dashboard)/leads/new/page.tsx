import { verifySession } from "@/app/_lib/dal";
import dbConnect from "@/app/_lib/db";
import User from "@/models/User";
import LeadForm from "@/app/_components/LeadForm";
import { createLeadAction } from "@/app/actions/leads";

export default async function NewLeadPage() {
  const session = await verifySession();
  await dbConnect();

  // Fetch agents for assignment dropdown (admin only)
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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Create New Lead</h1>
        <p className="text-muted text-sm mt-1">
          Add a new prospect to your pipeline
        </p>
      </div>

      <div className="card max-w-4xl">
        <LeadForm
          agents={agents}
          action={createLeadAction}
          submitLabel="Create Lead"
        />
      </div>
    </div>
  );
}
