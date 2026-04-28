import { requireAdmin } from "@/app/_lib/dal";
import dbConnect from "@/app/_lib/db";
import User from "@/models/User";
import Lead from "@/models/Lead";

export default async function AgentsPage() {
  await requireAdmin();
  await dbConnect();

  const agents = await User.find({ role: "agent" })
    .select("name email createdAt")
    .sort({ createdAt: -1 })
    .lean();

  // Get lead counts per agent
  const leadCounts = await Lead.aggregate([
    { $match: { assignedTo: { $ne: null } } },
    {
      $group: {
        _id: "$assignedTo",
        total: { $sum: 1 },
        closed: {
          $sum: { $cond: [{ $eq: ["$status", "Closed-Won"] }, 1, 0] },
        },
      },
    },
  ]);

  const countMap: Record<string, { total: number; closed: number }> = {};
  for (const lc of leadCounts) {
    countMap[String(lc._id)] = { total: lc.total, closed: lc.closed };
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Agents</h1>
          <p className="text-muted text-sm mt-1">
            Manage your team of property agents
          </p>
        </div>
        <div className="text-sm text-muted">
          {agents.length} agent{agents.length !== 1 ? "s" : ""}
        </div>
      </div>

      {agents.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-4xl mb-3">👤</div>
          <h3 className="text-lg font-semibold mb-1">No agents yet</h3>
          <p className="text-muted text-sm">
            Agents can be created from the signup page with the &quot;Agent&quot; role.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => {
            const stats = countMap[String(agent._id)] || { total: 0, closed: 0 };
            const convRate = stats.total > 0 ? Math.round((stats.closed / stats.total) * 100) : 0;
            return (
              <div key={String(agent._id)} className="card">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/20 text-accent text-lg font-bold">
                    {agent.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{agent.name}</div>
                    <div className="text-sm text-muted truncate">
                      {agent.email}
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">Joined</span>
                    <span>
                      {new Date(agent.createdAt).toLocaleDateString("en-PK", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-muted">Assigned Leads</span>
                    <span className="badge badge-new">{stats.total}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-muted">Closed Deals</span>
                    <span className="font-medium text-green-400">{stats.closed}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-muted">Conversion</span>
                    <span className={`font-bold ${convRate >= 50 ? "text-green-400" : convRate >= 25 ? "text-yellow-400" : "text-muted"}`}>
                      {convRate}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
