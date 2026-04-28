"use client";

import { useActionState } from "react";
import { signupAction } from "@/app/actions/auth";
import Link from "next/link";

export default function SignupPage() {
  const [state, action, pending] = useActionState(signupAction, undefined);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1">Create an account</h2>
      <p className="text-muted text-sm mb-8">
        Start managing your property leads today
      </p>

      {state?.message && (
        <div className="mb-4 rounded-lg bg-danger/10 border border-danger/20 px-4 py-3 text-sm text-danger">
          {state.message}
        </div>
      )}

      <form action={action} className="space-y-5">
        {/* Name */}
        <div>
          <label htmlFor="signup-name" className="label">
            Full Name
          </label>
          <input
            id="signup-name"
            name="name"
            type="text"
            placeholder="Ahmed Khan"
            className="input-field"
            required
          />
          {state?.errors?.name && (
            <p className="mt-1 text-xs text-danger">{state.errors.name[0]}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="signup-email" className="label">
            Email Address
          </label>
          <input
            id="signup-email"
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
          <label htmlFor="signup-password" className="label">
            Password
          </label>
          <input
            id="signup-password"
            name="password"
            type="password"
            placeholder="••••••••"
            className="input-field"
            required
          />
          {state?.errors?.password && (
            <ul className="mt-1 space-y-0.5">
              {state.errors.password.map((e) => (
                <li key={e} className="text-xs text-danger">
                  • {e}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Role */}
        <div>
          <label htmlFor="signup-role" className="label">
            Role
          </label>
          <select id="signup-role" name="role" className="input-field">
            <option value="agent">Agent</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <button type="submit" disabled={pending} className="btn-primary w-full">
          {pending ? "Creating account..." : "Sign Up"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
