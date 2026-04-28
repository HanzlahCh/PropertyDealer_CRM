"use client";

import { useEffect, useState } from "react";

interface ActivityItem {
  id: string;
  action: string;
  details: Record<string, unknown>;
  timestamp: string;
  user: { id: string; name: string; role: string } | null;
}

interface TimelineProps {
  leadId: string;
}

const actionLabels: Record<string, string> = {
  created: "Lead created",
  status_updated: "Status changed",
  assigned: "Lead assigned",
  reassigned: "Lead reassigned",
  notes_updated: "Notes updated",
  follow_up_set: "Follow-up scheduled",
  updated: "Lead updated",
};

const actionIcons: Record<string, string> = {
  created: "🆕",
  status_updated: "🔄",
  assigned: "👤",
  reassigned: "🔀",
  notes_updated: "📝",
  follow_up_set: "📅",
  updated: "✏️",
};

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
  });
}

export default function Timeline({ leadId }: TimelineProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTimeline() {
      try {
        const res = await fetch(`/api/leads/${leadId}/timeline`);
        if (res.ok) {
          const data = await res.json();
          setActivities(data.activities);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchTimeline();
  }, [leadId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <p className="text-muted text-sm py-4">No activity recorded yet.</p>
    );
  }

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-4 top-2 bottom-2 w-px bg-white/10" />

      <div className="space-y-0">
        {activities.map((activity) => {
          const detailStr = formatDetails(activity.action, activity.details);
          return (
            <div key={activity.id} className="relative flex gap-4 py-3">
              {/* Icon dot */}
              <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface border border-white/10 text-sm">
                {actionIcons[activity.action] || "•"}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-medium">
                    {actionLabels[activity.action] || activity.action}
                  </span>
                  <span className="text-xs text-muted whitespace-nowrap">
                    {timeAgo(activity.timestamp)}
                  </span>
                </div>
                {detailStr && (
                  <p className="text-xs text-muted mt-0.5">{detailStr}</p>
                )}
                {activity.user && (
                  <p className="text-xs text-muted mt-0.5">
                    by {activity.user.name}{" "}
                    <span className="capitalize">({activity.user.role})</span>
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatDetails(
  action: string,
  details: Record<string, unknown>
): string {
  switch (action) {
    case "status_updated":
      return `${details.from || "—"} → ${details.to || "—"}`;
    case "assigned":
    case "reassigned":
      return details.agentName
        ? `Assigned to ${details.agentName}`
        : "";
    case "follow_up_set":
      return details.date
        ? `Scheduled for ${new Date(details.date as string).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}`
        : "";
    default:
      return "";
  }
}
