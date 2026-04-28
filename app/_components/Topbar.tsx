"use client";

import { useRouter } from "next/navigation";

interface TopbarProps {
  userName: string;
  role: "admin" | "agent";
}

export default function Topbar({ userName, role }: TopbarProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-white/10 bg-surface px-6">
      {/* Left — Page context */}
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold">
          Property Dealer CRM
        </h1>
      </div>

      {/* Right — User actions */}
      <div className="flex items-center gap-4">
        {/* Notification bell placeholder — will be implemented in branch 6 */}
        <button
          className="relative rounded-lg p-2 text-muted hover:bg-white/5 transition-colors"
          aria-label="Notifications"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          </svg>
        </button>

        {/* User info + role badge */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-medium">{userName}</div>
            <div className="text-xs text-muted capitalize">{role}</div>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-white text-sm font-bold">
            {userName.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="rounded-lg px-3 py-2 text-sm text-muted hover:bg-white/5 hover:text-danger transition-colors"
          aria-label="Logout"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </header>
  );
}
