import { verifySession } from "@/app/_lib/dal";
import dbConnect from "@/app/_lib/db";
import Lead from "@/models/Lead";
import LeadTable from "@/app/_components/LeadTable";
import Link from "next/link";

interface SearchParams {
  status?: string;
  priority?: string;
  source?: string;
  search?: string;
  page?: string;
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await verifySession();
  await dbConnect();

  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const limit = 20;

  // Build query
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = {};
  if (session.role === "agent") query.assignedTo = session.userId;
  if (params.status) query.status = params.status;
  if (params.priority) query.priority = params.priority;
  if (params.source) query.source = params.source;
  if (params.search) {
    query.$or = [
      { name: { $regex: params.search, $options: "i" } },
      { email: { $regex: params.search, $options: "i" } },
      { propertyInterest: { $regex: params.search, $options: "i" } },
    ];
  }

  const total = await Lead.countDocuments(query);
  const leads = await Lead.find(query)
    .populate("assignedTo", "name email")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const totalPages = Math.ceil(total / limit);

  // Serialize for client
  const serialized = leads.map((l) => {
    const agent = l.assignedTo as unknown as { _id: unknown; name: string; email: string } | null;
    return {
      ...l,
      _id: String(l._id),
      assignedTo: agent
        ? {
            _id: String(agent._id),
            name: agent.name,
            email: agent.email,
          }
        : null,
      createdAt: l.createdAt.toISOString(),
    };
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {session.role === "admin" ? "All Leads" : "My Leads"}
          </h1>
          <p className="text-muted text-sm mt-1">
            {total} lead{total !== 1 ? "s" : ""} found
          </p>
        </div>
        <Link href="/leads/new" className="btn-primary">
          + New Lead
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <form className="flex flex-wrap gap-3" method="GET">
          <input
            name="search"
            type="text"
            defaultValue={params.search}
            placeholder="Search leads..."
            className="input-field max-w-xs"
          />
          <select
            name="status"
            defaultValue={params.status || ""}
            className="input-field w-auto"
          >
            <option value="">All Status</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Negotiation">Negotiation</option>
            <option value="Closed-Won">Closed-Won</option>
            <option value="Closed-Lost">Closed-Lost</option>
          </select>
          <select
            name="priority"
            defaultValue={params.priority || ""}
            className="input-field w-auto"
          >
            <option value="">All Priority</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <select
            name="source"
            defaultValue={params.source || ""}
            className="input-field w-auto"
          >
            <option value="">All Sources</option>
            <option value="Facebook">Facebook</option>
            <option value="Walk-in">Walk-in</option>
            <option value="Website">Website</option>
            <option value="Referral">Referral</option>
            <option value="Other">Other</option>
          </select>
          <button type="submit" className="btn-primary">Filter</button>
          <Link href="/leads" className="btn-secondary">Clear</Link>
        </form>
      </div>

      {/* Table */}
      <LeadTable leads={serialized} role={session.role} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/leads?page=${page - 1}${params.status ? `&status=${params.status}` : ""}${params.priority ? `&priority=${params.priority}` : ""}`}
              className="btn-secondary text-xs"
            >
              ← Previous
            </Link>
          )}
          <span className="text-sm text-muted">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/leads?page=${page + 1}${params.status ? `&status=${params.status}` : ""}${params.priority ? `&priority=${params.priority}` : ""}`}
              className="btn-secondary text-xs"
            >
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
