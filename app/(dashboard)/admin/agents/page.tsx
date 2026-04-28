import { requireAdmin } from "@/app/_lib/dal";
import dbConnect from "@/app/_lib/db";
import User from "@/models/User";

export default async function AgentsPage() {
  await requireAdmin();
  await dbConnect();

  const agents = await User.find({ role: "agent" })
    .select("name email createdAt")
    .sort({ createdAt: -1 })
    .lean();

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
          {agents.map((agent) => (
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
                {/* Lead count will be added in branch 4 (lead management) */}
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-muted">Assigned Leads</span>
                  <span className="badge badge-new">—</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
