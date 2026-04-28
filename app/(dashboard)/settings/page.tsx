import { getUser } from "@/app/_lib/dal";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted text-sm mt-1">
          Manage your account settings
        </p>
      </div>

      <div className="card max-w-2xl">
        <h2 className="text-lg font-semibold mb-6">Profile Information</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-white/10">
            <span className="text-sm text-muted">Name</span>
            <span className="text-sm font-medium">{user.name}</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-white/10">
            <span className="text-sm text-muted">Email</span>
            <span className="text-sm font-medium">{user.email}</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-white/10">
            <span className="text-sm text-muted">Role</span>
            <span className="badge badge-new capitalize">{user.role}</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-muted">Member since</span>
            <span className="text-sm font-medium">
              {new Date(user.createdAt).toLocaleDateString("en-PK", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
