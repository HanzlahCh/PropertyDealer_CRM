import { verifySession } from "@/app/_lib/dal";
import AgentDashboard from "@/app/_components/AgentDashboard";
import { redirect } from "next/navigation";

export default async function LeadsHomePage() {
  const session = await verifySession();

  // Admins see the leads table directly, agents get a dashboard first
  if (session.role === "admin") {
    redirect("/admin");
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Welcome Back</h1>
        <p className="text-muted text-sm mt-1">
          Here&apos;s your agent dashboard overview
        </p>
      </div>
      <AgentDashboard />
    </div>
  );
}
