import { verifySession } from "@/app/_lib/dal";

export default async function LeadsPage() {
  const session = await verifySession();

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {session.role === "admin" ? "All Leads" : "My Leads"}
          </h1>
          <p className="text-muted text-sm mt-1">
            {session.role === "admin"
              ? "View and manage all leads across your team"
              : "View and manage your assigned leads"}
          </p>
        </div>
      </div>

      {/* Placeholder — full lead table will be built in branch 4 */}
      <div className="card text-center py-16">
        <div className="text-5xl mb-4">📋</div>
        <h3 className="text-lg font-semibold mb-2">Lead Management</h3>
        <p className="text-muted text-sm max-w-md mx-auto">
          The full leads table with filters, search, and CRUD operations will be
          implemented in the next feature branch.
        </p>
      </div>
    </div>
  );
}
