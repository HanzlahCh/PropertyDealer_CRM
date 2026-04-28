"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions/auth";
import Link from "next/link";

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction, undefined);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1">Welcome back</h2>
      <p className="text-muted text-sm mb-8">
        Sign in to your Property Dealer CRM account
      </p>

      {state?.message && (
        <div className="mb-4 rounded-lg bg-danger/10 border border-danger/20 px-4 py-3 text-sm text-danger">
          {state.message}
        </div>
      )}

      <form action={action} className="space-y-5">
        {/* Email */}
        <div>
          <label htmlFor="login-email" className="label">
            Email Address
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            placeholder="ahmed@example.com"
            className="input-field"
            required
          />
          {state?.errors?.email && (
            <p className="mt-1 text-xs text-danger">{state.errors.email[0]}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="login-password" className="label">
            Password
          </label>
          <input
            id="login-password"
            name="password"
            type="password"
            placeholder="••••••••"
            className="input-field"
            required
          />
          {state?.errors?.password && (
            <p className="mt-1 text-xs text-danger">
              {state.errors.password[0]}
            </p>
          )}
        </div>

        <button type="submit" disabled={pending} className="btn-primary w-full">
          {pending ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-medium text-accent hover:underline"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
