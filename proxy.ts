import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/app/_lib/session";
import { cookies } from "next/headers";

// Routes that require NO authentication
const publicRoutes = ["/login", "/signup"];

// Routes restricted to admin role only
const adminRoutes = ["/admin"];

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Skip API routes and static assets
  if (
    path.startsWith("/api") ||
    path.startsWith("/_next") ||
    path.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  // Decrypt session from cookie
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);
  const isAuthenticated = !!session?.userId;

  // ── Public routes ──
  const isPublicRoute = publicRoutes.some(
    (route) => path === route || path.startsWith(route + "/")
  );

  // If user is authenticated and trying to visit login/signup, redirect to dashboard
  if (isPublicRoute && isAuthenticated) {
    const destination = session?.role === "admin" ? "/admin" : "/agent";
    return NextResponse.redirect(new URL(destination, req.nextUrl));
  }

  // If route is public, allow through
  if (isPublicRoute || path === "/") {
    return NextResponse.next();
  }

  // ── Protected routes — require authentication ──
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // ── Admin-only routes ──
  const isAdminRoute = adminRoutes.some(
    (route) => path === route || path.startsWith(route + "/")
  );

  if (isAdminRoute && session?.role !== "admin") {
    return NextResponse.redirect(new URL("/agent", req.nextUrl));
  }

  return NextResponse.next();
}

// Run proxy on all routes except static assets
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
