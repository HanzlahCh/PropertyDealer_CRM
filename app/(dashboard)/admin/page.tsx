import { requireAdmin } from "@/app/_lib/dal";
import FollowUpWidget from "@/app/_components/FollowUpWidget";

export default async function AdminDashboardPage() {
  await requireAdmin();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted text-sm mt-1">
          Overview of your CRM performance and analytics
        </p>
      </div>

      {/* Stats cards — will be populated in branch 10 (analytics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <div className="text-sm text-muted">Total Leads</div>
          <div className="text-3xl font-bold mt-1">—</div>
          <div className="text-xs text-muted mt-2">Analytics coming soon</div>
        </div>
        <div className="card">
          <div className="text-sm text-muted">Active Agents</div>
          <div className="text-3xl font-bold mt-1">—</div>
          <div className="text-xs text-muted mt-2">Analytics coming soon</div>
        </div>
        <div className="card">
          <div className="text-sm text-muted">Closed Deals</div>
          <div className="text-3xl font-bold mt-1">—</div>
          <div className="text-xs text-muted mt-2">Analytics coming soon</div>
        </div>
        <div className="card">
          <div className="text-sm text-muted">High Priority</div>
          <div className="text-3xl font-bold mt-1">—</div>
          <div className="text-xs text-muted mt-2">Analytics coming soon</div>
        </div>
      </div>

      {/* Dashboard widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">📅 Upcoming Follow-ups</h2>
          <FollowUpWidget limit={8} />
        </div>
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Lead Distribution</h2>
          <p className="text-muted text-sm">Charts will be added in the analytics branch.</p>
        </div>
      </div>
    </div>
  );
}
