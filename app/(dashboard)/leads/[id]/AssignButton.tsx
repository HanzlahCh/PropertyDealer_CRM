"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Agent {
  id: string;
  name: string;
}

interface AssignLeadButtonProps {
  leadId: string;
  agents: Agent[];
  currentAgentId?: string;
}

export default function AssignLeadButton({
  leadId,
  agents,
  currentAgentId,
}: AssignLeadButtonProps) {
  const [selectedAgent, setSelectedAgent] = useState(currentAgentId || "");
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  async function handleAssign() {
    if (!selectedAgent) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/leads/${leadId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: selectedAgent }),
      });
      if (res.ok) {
        router.refresh();
        setShowDropdown(false);
      }
    } catch {
      // handle error silently
    } finally {
      setLoading(false);
    }
  }

  if (!showDropdown) {
    return (
      <button
        onClick={() => setShowDropdown(true)}
        className="btn-secondary text-sm w-full"
      >
        {currentAgentId ? "Reassign" : "Assign Agent"}
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <select
        value={selectedAgent}
        onChange={(e) => setSelectedAgent(e.target.value)}
        className="input-field text-sm"
      >
        <option value="">Select an agent...</option>
        {agents.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </select>
      <div className="flex gap-2">
        <button
          onClick={handleAssign}
          disabled={!selectedAgent || loading}
          className="btn-primary text-sm flex-1"
        >
          {loading ? "Assigning..." : "Confirm"}
        </button>
        <button
          onClick={() => setShowDropdown(false)}
          className="btn-secondary text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
