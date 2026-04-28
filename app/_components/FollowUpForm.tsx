"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface FollowUpFormProps {
  leadId: string;
  currentDate?: string | null;
}

export default function FollowUpForm({ leadId, currentDate }: FollowUpFormProps) {
  const [date, setDate] = useState(
    currentDate ? new Date(currentDate).toISOString().split("T")[0] : ""
  );
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!date) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/leads/${leadId}/follow-up`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followUpDate: date }),
      });
      if (res.ok) {
        router.refresh();
        setShowForm(false);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  async function handleClear() {
    setLoading(true);
    try {
      const res = await fetch(`/api/leads/${leadId}/follow-up`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDate("");
        router.refresh();
        setShowForm(false);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="btn-secondary text-sm w-full"
      >
        {currentDate ? "📅 Reschedule" : "📅 Set Follow-up"}
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        min={new Date().toISOString().split("T")[0]}
        className="input-field text-sm"
        required
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading || !date}
          className="btn-primary text-sm flex-1"
        >
          {loading ? "Saving..." : "Save"}
        </button>
        {currentDate && (
          <button
            type="button"
            onClick={handleClear}
            disabled={loading}
            className="btn-secondary text-sm text-danger"
          >
            Clear
          </button>
        )}
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="btn-secondary text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
