"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const statuses = [
  { value: "New", label: "New", color: "bg-blue-500/15 text-blue-400" },
  { value: "Contacted", label: "Contacted", color: "bg-yellow-500/15 text-yellow-400" },
  { value: "Qualified", label: "Qualified", color: "bg-purple-500/15 text-purple-400" },
  { value: "Negotiation", label: "Negotiation", color: "bg-orange-500/15 text-orange-400" },
  { value: "Closed-Won", label: "Closed-Won", color: "bg-green-500/15 text-green-400" },
  { value: "Closed-Lost", label: "Closed-Lost", color: "bg-red-500/15 text-red-400" },
];

interface StatusUpdateButtonProps {
  leadId: string;
  currentStatus: string;
}

export default function StatusUpdateButton({
  leadId,
  currentStatus,
}: StatusUpdateButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const router = useRouter();

  async function handleStatusChange(newStatus: string) {
    if (newStatus === currentStatus) {
      setShowPicker(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        router.refresh();
        setShowPicker(false);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  if (!showPicker) {
    return (
      <button
        onClick={() => setShowPicker(true)}
        className="btn-secondary text-sm w-full"
      >
        🔄 Update Status
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-xs text-muted mb-1">Select new status:</div>
      <div className="grid grid-cols-2 gap-1.5">
        {statuses.map((s) => (
          <button
            key={s.value}
            onClick={() => handleStatusChange(s.value)}
            disabled={loading}
            className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${s.color} ${
              s.value === currentStatus
                ? "ring-2 ring-accent ring-offset-1 ring-offset-background"
                : "hover:opacity-80"
            }`}
          >
            {s.value === currentStatus ? `✓ ${s.label}` : s.label}
          </button>
        ))}
      </div>
      <button
        onClick={() => setShowPicker(false)}
        className="btn-secondary text-xs w-full mt-1"
      >
        Cancel
      </button>
    </div>
  );
}
