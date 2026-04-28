"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { FormState } from "@/app/_lib/definitions";

// ── Create lead ──
export async function createLeadAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const body = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    propertyInterest: formData.get("propertyInterest") as string,
    budget: Number(formData.get("budget")),
    status: formData.get("status") as string,
    notes: formData.get("notes") as string,
    source: formData.get("source") as string,
    assignedTo: formData.get("assignedTo") as string || undefined,
  };

  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    return { errors: data.errors, message: data.message || "Failed to create lead" };
  }

  revalidatePath("/leads");
  redirect("/leads");
}

// ── Update lead ──
export async function updateLeadAction(
  leadId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const body: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (value !== "" && value !== null) {
      body[key] = key === "budget" ? Number(value) : value;
    }
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/leads/${leadId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    return { errors: data.errors, message: data.message || "Failed to update lead" };
  }

  revalidatePath("/leads");
  revalidatePath(`/leads/${leadId}`);
  redirect(`/leads/${leadId}`);
}

// ── Delete lead ──
export async function deleteLeadAction(leadId: string): Promise<FormState> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/leads/${leadId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const data = await res.json();
    return { message: data.message || "Failed to delete lead" };
  }

  revalidatePath("/leads");
  redirect("/leads");
}
