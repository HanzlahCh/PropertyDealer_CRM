"use client";

import Link from "next/link";

interface Lead {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  propertyInterest: string;
  budget: number;
  status: string;
  priority: string;
  source: string;
  score: number;
  assignedTo?: { _id: string; name: string; email: string } | null;
  createdAt: string;
}

interface LeadTableProps {
  leads: Lead[];
  role: "admin" | "agent";
}

const statusColors: Record<string, string> = {
  New: "badge-new",
  Contacted: "bg-yellow-500/15 text-yellow-400",
  Qualified: "bg-purple-500/15 text-purple-400",
  Negotiation: "bg-orange-500/15 text-orange-400",
  "Closed-Won": "bg-green-500/15 text-green-400",
  "Closed-Lost": "bg-red-500/15 text-red-400",
};

function formatBudget(amount: number): string {
  if (amount >= 10_000_000) return `${(amount / 10_000_000).toFixed(1)} Cr`;
  if (amount >= 100_000) return `${(amount / 100_000).toFixed(1)} Lac`;
  return `${amount.toLocaleString()}`;
}

export default function LeadTable({ leads, role }: LeadTableProps) {
  if (leads.length === 0) {
    return (
      <div className="card text-center py-16">
        <div className="text-5xl mb-4">📋</div>
        <h3 className="text-lg font-semibold mb-2">No leads found</h3>
        <p className="text-muted text-sm">
          Try adjusting your filters or create a new lead.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-surface">
            <th className="px-4 py-3 text-left font-medium text-muted">Name</th>
            <th className="px-4 py-3 text-left font-medium text-muted">Property</th>
            <th className="px-4 py-3 text-left font-medium text-muted">Budget</th>
            <th className="px-4 py-3 text-left font-medium text-muted">Status</th>
            <th className="px-4 py-3 text-left font-medium text-muted">Priority</th>
            <th className="px-4 py-3 text-left font-medium text-muted">Source</th>
            {role === "admin" && (
              <th className="px-4 py-3 text-left font-medium text-muted">Agent</th>
            )}
            <th className="px-4 py-3 text-left font-medium text-muted">Date</th>
            <th className="px-4 py-3 text-right font-medium text-muted">Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr
              key={lead._id}
              className="border-b border-white/5 hover:bg-white/[.02] transition-colors"
            >
              <td className="px-4 py-3">
                <div className="font-medium">{lead.name}</div>
                <div className="text-xs text-muted">{lead.email}</div>
              </td>
              <td className="px-4 py-3 text-muted">{lead.propertyInterest}</td>
              <td className="px-4 py-3 font-medium">PKR {formatBudget(lead.budget)}</td>
              <td className="px-4 py-3">
                <span className={`badge ${statusColors[lead.status] || "badge-new"}`}>
                  {lead.status}
                </span>
              </td>
              <td className="px-4 py-3">
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
              </td>
              <td className="px-4 py-3 text-muted">{lead.source}</td>
              {role === "admin" && (
                <td className="px-4 py-3 text-muted">
                  {lead.assignedTo?.name || "Unassigned"}
                </td>
              )}
              <td className="px-4 py-3 text-muted">
                {new Date(lead.createdAt).toLocaleDateString("en-PK", {
                  day: "numeric",
                  month: "short",
                })}
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/leads/${lead._id}`}
                  className="text-accent hover:underline text-xs font-medium"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
