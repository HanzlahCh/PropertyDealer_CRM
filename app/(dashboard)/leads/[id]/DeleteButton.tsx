"use client";

import { deleteLeadAction } from "@/app/actions/leads";
import { useState } from "react";

export default function DeleteLeadButton({ leadId }: { leadId: string }) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="flex gap-2">
        <button
          onClick={async () => {
            await deleteLeadAction(leadId);
          }}
          className="rounded-lg px-3 py-2 text-sm font-medium bg-danger text-white hover:opacity-90 transition"
        >
          Confirm Delete
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="btn-secondary text-sm"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="btn-secondary text-danger border-danger/20 hover:bg-danger/10"
    >
      Delete
    </button>
  );
}
