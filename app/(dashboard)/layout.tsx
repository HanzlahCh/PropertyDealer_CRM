import { getUser } from "@/app/_lib/dal";
import { redirect } from "next/navigation";
import Sidebar from "@/app/_components/Sidebar";
import Topbar from "@/app/_components/Topbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar role={user.role} userName={user.name} />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <Topbar userName={user.name} role={user.role} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
