"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/app/_lib/dal";
import dbConnect from "@/app/_lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import type { FormState } from "@/app/_lib/definitions";

export async function updateProfileAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await verifySession();

  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const phone = (formData.get("phone") as string)?.trim() || "";
  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;

  if (!name || name.length < 2) {
    return { message: "Name must be at least 2 characters" };
  }
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return { message: "Please enter a valid email" };
  }

  await dbConnect();

  const user = await User.findById(session.userId);
  if (!user) {
    return { message: "User not found" };
  }

  // Check if email is taken by another user
  if (email !== user.email) {
    const existing = await User.findOne({ email });
    if (existing) {
      return { message: "This email is already used by another account" };
    }
  }

  // Update basic fields
  user.name = name;
  user.email = email;
  user.phone = phone;

  // Password change (optional)
  if (newPassword) {
    if (!currentPassword) {
      return { message: "Enter your current password to set a new one" };
    }
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return { message: "Current password is incorrect" };
    }
    if (newPassword.length < 6) {
      return { message: "New password must be at least 6 characters" };
    }
    user.password = await bcrypt.hash(newPassword, 10);
  }

  await user.save();

  revalidatePath("/settings");
  return { message: "✅ Profile updated successfully" };
}
