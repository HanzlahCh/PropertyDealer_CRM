"use client";

import { useEffect, useState } from "react";
import FollowUpWidget from "@/app/_components/FollowUpWidget";

interface AgentStats {
  totalLeads: number;
  newLeads: number;
  contactedLeads: number;
  closedWon: number;
  highPriority: number;
  overdueFollowUps: number;
}

export default function AgentDashboard() {
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/leads?limit=1000");
        if (res.ok) {
          const data = await res.json();
          const leads = data.leads || [];
          setStats({
            totalLeads: leads.length,
            newLeads: leads.filter((l: { status: string }) => l.status === "New").length,
            contactedLeads: leads.filter((l: { status: string }) => l.status === "Contacted").length,
            closedWon: leads.filter((l: { status: string }) => l.status === "Closed-Won").length,
            highPriority: leads.filter((l: { priority: string }) => l.priority === "High").length,
            overdueFollowUps: leads.filter(
              (l: { followUpDate: string; status: string }) =>
                l.followUpDate &&
                new Date(l.followUpDate) < new Date(new Date().toDateString()) &&
                !["Closed-Won", "Closed-Lost"].includes(l.status)
            ).length,
          });
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="text-sm text-muted">My Leads</div>
          <div className="text-3xl font-bold mt-1">{stats?.totalLeads || 0}</div>
        </div>
        <div className="card">
          <div className="text-sm text-muted">New</div>
          <div className="text-3xl font-bold mt-1 text-blue-400">{stats?.newLeads || 0}</div>
        </div>
        <div className="card">
          <div className="text-sm text-muted">Closed Deals</div>
          <div className="text-3xl font-bold mt-1 text-green-400">{stats?.closedWon || 0}</div>
        </div>
        <div className="card">
          <div className="text-sm text-muted">High Priority</div>
          <div className="text-3xl font-bold mt-1 text-orange-400">{stats?.highPriority || 0}</div>
          {(stats?.overdueFollowUps || 0) > 0 && (
            <div className="text-xs text-danger mt-2">
              ⚠️ {stats?.overdueFollowUps} overdue follow-ups
            </div>
          )}
        </div>
      </div>

      {/* Follow-ups */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">📅 My Follow-ups</h2>
        <FollowUpWidget limit={10} />
      </div>
    </div>
  );
}
