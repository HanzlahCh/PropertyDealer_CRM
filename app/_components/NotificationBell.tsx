"use client";

import { useState, useEffect, useRef } from "react";

interface Notification {
  id: string;
  leadName: string;
  status: string;
  priority: string;
  timestamp: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const lastChecked = useRef<string>(new Date().toISOString());
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Polling — fetch notifications every 30 seconds
  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await fetch(
          `/api/notifications?since=${encodeURIComponent(lastChecked.current)}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.notifications.length > 0) {
            setNotifications(data.notifications);
            setUnreadCount(data.count);
          }
        }
      } catch {
        // silently fail
      }
    }

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleOpen() {
    setOpen(!open);
    if (!open) {
      setUnreadCount(0);
      lastChecked.current = new Date().toISOString();
    }
  }

  function timeAgo(timestamp: string): string {
    const diff = Date.now() - new Date(timestamp).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleOpen}
        className="relative rounded-lg p-2 text-muted hover:bg-white/5 transition-colors"
        aria-label="Notifications"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-white/10 bg-surface shadow-xl z-50">
          <div className="border-b border-white/10 px-4 py-3">
            <h3 className="text-sm font-semibold">Notifications</h3>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-muted">
                No recent notifications
              </div>
            ) : (
              notifications.map((n) => (
                <a
                  key={n.id}
                  href={`/leads/${n.id}`}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-white/[.03] transition-colors border-b border-white/5 last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {n.leadName}
                    </div>
                    <div className="text-xs text-muted">
                      Status: {n.status} · {n.priority} priority
                    </div>
                  </div>
                  <div className="text-[11px] text-muted whitespace-nowrap">
                    {timeAgo(n.timestamp)}
                  </div>
                </a>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
