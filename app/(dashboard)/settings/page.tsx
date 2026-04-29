import { getUser } from "@/app/_lib/dal";
import { redirect } from "next/navigation";
import ProfileForm from "@/app/_components/ProfileForm";

export default async function SettingsPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted text-sm mt-1">
          Manage your account and profile
        </p>
      </div>

      <div className="card max-w-2xl">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/20 text-accent text-xl font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-semibold">{user.name}</h2>
            <p className="text-sm text-muted">{user.email}</p>
          </div>
        </div>

        <ProfileForm
          user={{
            name: user.name,
            email: user.email,
            phone: user.phone || "",
            role: user.role,
            createdAt: user.createdAt.toISOString(),
          }}
        />
      </div>
    </div>
  );
}
