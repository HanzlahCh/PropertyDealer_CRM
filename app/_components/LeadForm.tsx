"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";

interface Agent {
  id: string;
  name: string;
}

interface LeadFormProps {
  agents?: Agent[];
  initialData?: {
    name?: string;
    email?: string;
    phone?: string;
    propertyInterest?: string;
    budget?: number;
    status?: string;
    notes?: string;
    source?: string;
    assignedTo?: string;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action: (prevState: any, formData: FormData) => Promise<any>;
  submitLabel?: string;
}

export default function LeadForm({
  agents = [],
  initialData = {},
  action,
  submitLabel = "Create Lead",
}: LeadFormProps) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const router = useRouter();

  return (
    <div>
      {state?.message && (
        <div className="mb-4 rounded-lg bg-danger/10 border border-danger/20 px-4 py-3 text-sm text-danger">
          {state.message}
        </div>
      )}

      <form action={formAction} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Name */}
          <div>
            <label htmlFor="lead-name" className="label">Full Name</label>
            <input
              id="lead-name"
              name="name"
              type="text"
              defaultValue={initialData.name}
              placeholder="Client name"
              className="input-field"
              required
            />
            {state?.errors?.name && (
              <p className="mt-1 text-xs text-danger">{state.errors.name[0]}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="lead-email" className="label">Email</label>
            <input
              id="lead-email"
              name="email"
              type="email"
              defaultValue={initialData.email}
              placeholder="client@example.com"
              className="input-field"
              required
            />
            {state?.errors?.email && (
              <p className="mt-1 text-xs text-danger">{state.errors.email[0]}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="lead-phone" className="label">Phone (international format)</label>
            <input
              id="lead-phone"
              name="phone"
              type="text"
              defaultValue={initialData.phone}
              placeholder="923001234567"
              className="input-field"
            />
          </div>

          {/* Property Interest */}
          <div>
            <label htmlFor="lead-property" className="label">Property Interest</label>
            <input
              id="lead-property"
              name="propertyInterest"
              type="text"
              defaultValue={initialData.propertyInterest}
              placeholder="e.g. 3 Bed Apartment, DHA Phase 6"
              className="input-field"
              required
            />
            {state?.errors?.propertyInterest && (
              <p className="mt-1 text-xs text-danger">{state.errors.propertyInterest[0]}</p>
            )}
          </div>

          {/* Budget */}
          <div>
            <label htmlFor="lead-budget" className="label">Budget (PKR)</label>
            <input
              id="lead-budget"
              name="budget"
              type="number"
              defaultValue={initialData.budget}
              placeholder="15000000"
              className="input-field"
              required
              min={0}
            />
            {state?.errors?.budget && (
              <p className="mt-1 text-xs text-danger">{state.errors.budget[0]}</p>
            )}
          </div>

          {/* Source */}
          <div>
            <label htmlFor="lead-source" className="label">Lead Source</label>
            <select
              id="lead-source"
              name="source"
              defaultValue={initialData.source || "Other"}
              className="input-field"
            >
              <option value="Facebook">Facebook Ads</option>
              <option value="Walk-in">Walk-in</option>
              <option value="Website">Website</option>
              <option value="Referral">Referral</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label htmlFor="lead-status" className="label">Status</label>
            <select
              id="lead-status"
              name="status"
              defaultValue={initialData.status || "New"}
              className="input-field"
            >
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Negotiation">Negotiation</option>
              <option value="Closed-Won">Closed-Won</option>
              <option value="Closed-Lost">Closed-Lost</option>
            </select>
          </div>

          {/* Assign to agent */}
          {agents.length > 0 && (
            <div>
              <label htmlFor="lead-assigned" className="label">Assign to Agent</label>
              <select
                id="lead-assigned"
                name="assignedTo"
                defaultValue={initialData.assignedTo || ""}
                className="input-field"
              >
                <option value="">Unassigned</option>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="lead-notes" className="label">Notes</label>
          <textarea
            id="lead-notes"
            name="notes"
            defaultValue={initialData.notes}
            rows={3}
            placeholder="Additional notes about this lead..."
            className="input-field resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={pending} className="btn-primary">
            {pending ? "Saving..." : submitLabel}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
