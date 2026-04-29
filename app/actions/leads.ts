"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/app/_lib/dal";
import dbConnect from "@/app/_lib/db";
import Lead from "@/models/Lead";
import { LeadCreateSchema, LeadUpdateSchema } from "@/app/_lib/definitions";
import { logActivity } from "@/app/_lib/activity-logger";
import type { FormState } from "@/app/_lib/definitions";

// ── Create lead ──
export async function createLeadAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await verifySession();

  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    propertyInterest: formData.get("propertyInterest") as string,
    budget: Number(formData.get("budget")),
    status: formData.get("status") as string,
    notes: formData.get("notes") as string,
    source: formData.get("source") as string,
    assignedTo: (formData.get("assignedTo") as string) || undefined,
  };

  const parsed = LeadCreateSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "Validation failed",
    };
  }

  await dbConnect();

  const lead = new Lead(parsed.data);
  await lead.save();

  logActivity({
    leadId: String(lead._id),
    userId: session.userId,
    action: "created",
    details: { name: lead.name, budget: lead.budget },
  }).catch(() => {});

  revalidatePath("/leads");
  redirect("/leads");
}

// ── Update lead ──
export async function updateLeadAction(
  leadId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await verifySession();

  const raw: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (value !== "" && value !== null) {
      raw[key] = key === "budget" ? Number(value) : value;
    }
  }

  const parsed = LeadUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "Validation failed",
    };
  }

  await dbConnect();

  const lead = await Lead.findById(leadId);
  if (!lead) {
    return { message: "Lead not found" };
  }

  // Agents can only update their assigned leads
  if (session.role === "agent" && String(lead.assignedTo) !== session.userId) {
    return { message: "Forbidden" };
  }

  const oldStatus = lead.status;
  Object.assign(lead, parsed.data);
  lead.lastActivityAt = new Date();
  await lead.save();

  const action = parsed.data.status && parsed.data.status !== oldStatus ? "status_updated" : "updated";
  logActivity({
    leadId,
    userId: session.userId,
    action,
    details: action === "status_updated"
      ? { from: oldStatus, to: parsed.data.status }
      : { fields: Object.keys(parsed.data) },
  }).catch(() => {});

  revalidatePath("/leads");
  revalidatePath(`/leads/${leadId}`);
  redirect(`/leads/${leadId}`);
}

// ── Delete lead ──
export async function deleteLeadAction(leadId: string): Promise<FormState> {
  const session = await verifySession();

  if (session.role !== "admin") {
    return { message: "Only admins can delete leads" };
  }

  await dbConnect();

  const lead = await Lead.findByIdAndDelete(leadId);
  if (!lead) {
    return { message: "Lead not found" };
  }

  revalidatePath("/leads");
  redirect("/leads");
}
