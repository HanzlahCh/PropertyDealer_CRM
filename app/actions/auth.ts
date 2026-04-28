"use server";

import { redirect } from "next/navigation";
import { deleteSession } from "@/app/_lib/session";
import type { FormState } from "@/app/_lib/definitions";

// ── Signup action ──
export async function signupAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const body = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    role: (formData.get("role") as string) || "agent",
  };

  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    return {
      errors: data.errors,
      message: data.message || "Signup failed",
    };
  }

  redirect("/admin");
}

// ── Login action ──
export async function loginAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const body = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    return {
      errors: data.errors,
      message: data.message || "Login failed",
    };
  }

  redirect("/admin");
}

// ── Logout action ──
export async function logoutAction() {
  await deleteSession();
  redirect("/login");
}
