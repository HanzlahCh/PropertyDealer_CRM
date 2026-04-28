import { verifySession } from "@/app/_lib/dal";
import dbConnect from "@/app/_lib/db";
import Lead from "@/models/Lead";
import Link from "next/link";
import { notFound } from "next/navigation";
import DeleteLeadButton from "./DeleteButton";

function formatBudget(amount: number): string {
  if (amount >= 10_000_000) return `${(amount / 10_000_000).toFixed(1)} Crore`;
  if (amount >= 100_000) return `${(amount / 100_000).toFixed(1)} Lac`;
  return amount.toLocaleString();
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await verifySession();
  const { id } = await params;
  await dbConnect();

  const lead = await Lead.findById(id)
    .populate("assignedTo", "name email")
    .lean();

  if (!lead) notFound();

  // Agent can only view assigned leads
  if (
    session.role === "agent" &&
    String(lead.assignedTo?._id || lead.assignedTo) !== session.userId
  ) {
    notFound();
  }

  const assignedAgent = lead.assignedTo as { _id: unknown; name: string; email: string } | null;

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <Link href="/leads" className="text-sm text-muted hover:text-accent mb-2 inline-block">
            ← Back to Leads
          </Link>
          <h1 className="text-2xl font-bold">{lead.name}</h1>
          <p className="text-muted text-sm">{lead.email}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/leads/${id}/edit`} className="btn-primary">
            Edit Lead
          </Link>
          {session.role === "admin" && (
            <DeleteLeadButton leadId={id} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Details card */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Lead Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted">Phone</div>
                <div className="font-medium">{lead.phone || "—"}</div>
              </div>
              <div>
                <div className="text-sm text-muted">Property Interest</div>
                <div className="font-medium">{lead.propertyInterest}</div>
              </div>
              <div>
                <div className="text-sm text-muted">Budget</div>
                <div className="font-medium">PKR {formatBudget(lead.budget)}</div>
              </div>
              <div>
                <div className="text-sm text-muted">Source</div>
                <div className="font-medium">{lead.source}</div>
              </div>
              <div>
                <div className="text-sm text-muted">Created</div>
                <div className="font-medium">
                  {new Date(lead.createdAt).toLocaleDateString("en-PK", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted">Last Activity</div>
                <div className="font-medium">
                  {new Date(lead.lastActivityAt).toLocaleDateString("en-PK", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Notes</h2>
            <p className="text-muted text-sm whitespace-pre-wrap">
              {lead.notes || "No notes yet."}
            </p>
          </div>

          {/* Timeline placeholder — branch 8 */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Activity Timeline</h2>
            <p className="text-muted text-sm">Timeline will be added in a future update.</p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Priority */}
          <div className="card">
            <h3 className="text-sm font-semibold mb-3">Status & Scoring</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Status</span>
                <span className="badge badge-new">{lead.status}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Priority</span>
                <span
                  className={`badge ${
                    lead.priority === "High"
                      ? "badge-high"
                      : lead.priority === "Medium"
                      ? "badge-medium"
                      : "badge-low"
                  }`}
                >
                  {lead.priority}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Score</span>
                <span className="font-bold">{lead.score}</span>
              </div>
            </div>
          </div>

          {/* Assigned agent */}
          <div className="card">
            <h3 className="text-sm font-semibold mb-3">Assigned Agent</h3>
            {assignedAgent ? (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20 text-accent font-bold">
                  {assignedAgent.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-sm">{assignedAgent.name}</div>
                  <div className="text-xs text-muted">{assignedAgent.email}</div>
                </div>
              </div>
            ) : (
              <p className="text-muted text-sm">Unassigned</p>
            )}
          </div>

          {/* WhatsApp placeholder — branch 7 */}
          {lead.phone && (
            <a
              href={`https://wa.me/${lead.phone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full"
            >
              💬 Chat on WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
