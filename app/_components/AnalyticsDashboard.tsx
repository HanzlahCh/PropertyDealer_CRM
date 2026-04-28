"use client";

import { useEffect, useState } from "react";
import BarChart from "@/app/_components/BarChart";
import DonutChart from "@/app/_components/DonutChart";

interface AnalyticsData {
  summary: {
    totalLeads: number;
    totalAgents: number;
    closedWon: number;
    closedLost: number;
    highPriority: number;
    overdueFollowUps: number;
    avgBudget: number;
    totalPipelineValue: number;
  };
  statusBreakdown: Record<string, number>;
  priorityBreakdown: Record<string, number>;
  sourceBreakdown: Record<string, number>;
  agentPerformance: {
    name: string;
    total: number;
    closed: number;
    conversionRate: number;
  }[];
  monthlyTrend: { label: string; count: number }[];
}

function formatPKR(amount: number): string {
  if (amount >= 10_000_000) return `${(amount / 10_000_000).toFixed(1)} Cr`;
  if (amount >= 100_000) return `${(amount / 100_000).toFixed(1)} Lac`;
  return amount.toLocaleString();
}

const statusColors: Record<string, string> = {
  New: "#6366f1",
  Contacted: "#eab308",
  Qualified: "#a855f7",
  Negotiation: "#f97316",
  "Closed-Won": "#22c55e",
  "Closed-Lost": "#ef4444",
};

const sourceColors: Record<string, string> = {
  Facebook: "#3b82f6",
  "Walk-in": "#22c55e",
  Website: "#a855f7",
  Referral: "#f97316",
  Other: "#6b7280",
};

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch("/api/analytics");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  if (!data) {
    return <p className="text-muted text-sm">Failed to load analytics.</p>;
  }

  const { summary, statusBreakdown, sourceBreakdown, agentPerformance, monthlyTrend } = data;

  const statusData = Object.entries(statusBreakdown).map(([label, value]) => ({
    label,
    value,
    color: statusColors[label] || "#6b7280",
  }));

  const sourceData = Object.entries(sourceBreakdown).map(([label, value]) => ({
    label,
    value,
    color: sourceColors[label] || "#6b7280",
  }));

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="text-sm text-muted">Total Leads</div>
          <div className="text-3xl font-bold mt-1">{summary.totalLeads}</div>
          <div className="text-xs text-muted mt-2">
            Pipeline: PKR {formatPKR(summary.totalPipelineValue)}
          </div>
        </div>
        <div className="card">
          <div className="text-sm text-muted">Active Agents</div>
          <div className="text-3xl font-bold mt-1">{summary.totalAgents}</div>
          <div className="text-xs text-muted mt-2">
            Avg budget: PKR {formatPKR(summary.avgBudget)}
          </div>
        </div>
        <div className="card">
          <div className="text-sm text-muted">Closed Deals</div>
          <div className="text-3xl font-bold mt-1 text-green-400">
            {summary.closedWon}
          </div>
          <div className="text-xs text-danger mt-2">
            Lost: {summary.closedLost}
          </div>
        </div>
        <div className="card">
          <div className="text-sm text-muted">High Priority</div>
          <div className="text-3xl font-bold mt-1 text-orange-400">
            {summary.highPriority}
          </div>
          <div className="text-xs text-danger mt-2">
            {summary.overdueFollowUps > 0
              ? `⚠️ ${summary.overdueFollowUps} overdue follow-ups`
              : "No overdue follow-ups"}
          </div>
        </div>
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <DonutChart data={statusData} title="Lead Status Distribution" />
        </div>
        <div className="card">
          <DonutChart data={sourceData} title="Lead Sources" size={140} />
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly trend */}
        <div className="card">
          <BarChart
            data={monthlyTrend.map((m) => ({
              label: m.label,
              value: m.count,
            }))}
            title="Monthly Lead Trend"
          />
        </div>

        {/* Agent performance */}
        <div className="card">
          <h3 className="text-sm font-semibold mb-4">Agent Performance</h3>
          {agentPerformance.length === 0 ? (
            <p className="text-muted text-sm">No agent data yet.</p>
          ) : (
            <div className="space-y-3">
              {agentPerformance.map((agent) => (
                <div
                  key={agent.name}
                  className="flex items-center gap-3 rounded-lg border border-white/5 px-3 py-2.5"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20 text-accent text-sm font-bold shrink-0">
                    {agent.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {agent.name}
                    </div>
                    <div className="text-xs text-muted">
                      {agent.total} leads · {agent.closed} closed
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div
                      className={`text-sm font-bold ${
                        agent.conversionRate >= 50
                          ? "text-green-400"
                          : agent.conversionRate >= 25
                          ? "text-yellow-400"
                          : "text-muted"
                      }`}
                    >
                      {agent.conversionRate}%
                    </div>
                    <div className="text-[10px] text-muted">conversion</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
