"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import dbConnect from "@/app/_lib/db";
import User from "@/models/User";
import {
  SignupFormSchema,
  LoginFormSchema,
} from "@/app/_lib/definitions";
import { createSession, deleteSession } from "@/app/_lib/session";
import type { FormState } from "@/app/_lib/definitions";

// ── Signup action ──
export async function signupAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    role: (formData.get("role") as string) || "agent",
  };

  const parsed = SignupFormSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "Validation failed",
    };
  }

  await dbConnect();

  // Check if user already exists
  const existing = await User.findOne({ email: parsed.data.email });
  if (existing) {
    return { message: "An account with this email already exists" };
  }

  // Hash password and create user
  const hashedPassword = await bcrypt.hash(parsed.data.password, 10);
  const user = await User.create({
    name: parsed.data.name,
    email: parsed.data.email,
    password: hashedPassword,
    role: parsed.data.role,
  });

  // Create session cookie (this sets it on the actual browser response)
  await createSession(String(user._id), user.role);

  const destination = user.role === "admin" ? "/admin" : "/agent";
  redirect(destination);
}

// ── Login action ──
export async function loginAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = LoginFormSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "Validation failed",
    };
  }

  await dbConnect();

  const user = await User.findOne({ email: parsed.data.email });
  if (!user) {
    return { message: "Invalid email or password" };
  }

  const isValid = await bcrypt.compare(parsed.data.password, user.password);
  if (!isValid) {
    return { message: "Invalid email or password" };
  }

  // Create session cookie directly on the browser response
  await createSession(String(user._id), user.role);

  const destination = user.role === "admin" ? "/admin" : "/agent";
  redirect(destination);
}

// ── Logout action ──
export async function logoutAction() {
  await deleteSession();
  redirect("/login");
}
