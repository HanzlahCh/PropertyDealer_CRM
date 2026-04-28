"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface FollowUp {
  _id: string;
  name: string;
  propertyInterest: string;
  status: string;
  priority: string;
  followUpDate: string;
  agentName: string;
  isOverdue: boolean;
  isToday: boolean;
}

interface FollowUpWidgetProps {
  limit?: number;
}

export default function FollowUpWidget({ limit = 5 }: FollowUpWidgetProps) {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFollowUps() {
      setLoading(true);
      try {
        const res = await fetch(`/api/follow-ups?filter=${filter}`);
        if (res.ok) {
          const data = await res.json();
          setFollowUps(data.followUps.slice(0, limit));
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchFollowUps();
  }, [filter, limit]);

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-1 mb-4">
        {["all", "today", "overdue", "upcoming"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === f
                ? "bg-accent/10 text-accent"
                : "text-muted hover:bg-white/5"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      ) : followUps.length === 0 ? (
        <p className="text-muted text-sm py-4 text-center">
          No follow-ups {filter !== "all" ? `(${filter})` : "scheduled"}.
        </p>
      ) : (
        <div className="space-y-2">
          {followUps.map((fu) => (
            <Link
              key={fu._id}
              href={`/leads/${fu._id}`}
              className="flex items-center justify-between rounded-lg border border-white/5 px-3 py-2.5 hover:bg-white/[.03] transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate">{fu.name}</div>
                <div className="text-xs text-muted truncate">
                  {fu.propertyInterest}
                </div>
              </div>
              <div className="text-right shrink-0 ml-3">
                <div
                  className={`text-xs font-medium ${
                    fu.isOverdue
                      ? "text-danger"
                      : fu.isToday
                      ? "text-accent"
                      : "text-muted"
                  }`}
                >
                  {fu.isOverdue
                    ? "Overdue"
                    : fu.isToday
                    ? "Today"
                    : new Date(fu.followUpDate).toLocaleDateString("en-PK", {
                        day: "numeric",
                        month: "short",
                      })}
                </div>
                <div className="text-[11px] text-muted">{fu.agentName}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
