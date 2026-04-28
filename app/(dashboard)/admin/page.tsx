import { requireAdmin } from "@/app/_lib/dal";
import FollowUpWidget from "@/app/_components/FollowUpWidget";
import AnalyticsDashboard from "@/app/_components/AnalyticsDashboard";

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

      {/* Analytics — stats, charts, agent performance */}
      <AnalyticsDashboard />

      {/* Follow-ups widget */}
      <div className="mt-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">📅 Upcoming Follow-ups</h2>
          <FollowUpWidget limit={8} />
        </div>
      </div>
    </div>
  );
}
