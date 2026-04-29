import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/app/_lib/session";
import dbConnect from "@/app/_lib/db";
import User from "@/models/User";

// ── Verify that a valid session exists ──
export const verifySession = cache(async () => {
  const session = await getSession();

  if (!session?.userId) {
    redirect("/login");
  }

  return {
    isAuth: true,
    userId: session.userId,
    role: session.role,
  };
});

// ── Get the current user from DB ──
export const getUser = cache(async () => {
  const session = await verifySession();
  if (!session) return null;

  try {
    await dbConnect();
    const user = await User.findById(session.userId)
      .select("name email phone role createdAt")
      .lean();

    if (!user) return null;

    return {
      id: String(user._id),
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      role: user.role,
      createdAt: user.createdAt,
    };
  } catch {
    console.error("Failed to fetch user");
    return null;
  }
});

// ── Authorization helpers ──
export async function requireAuth() {
  return verifySession();
}

export async function requireAdmin() {
  const session = await verifySession();
  if (session.role !== "admin") {
    redirect("/agent");
  }
  return session;
}
