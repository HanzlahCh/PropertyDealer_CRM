"use client";

import { useActionState } from "react";
import { updateProfileAction } from "@/app/actions/profile";

interface ProfileFormProps {
  user: {
    name: string;
    email: string;
    phone: string;
    role: string;
    createdAt: string;
  };
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const [state, action, pending] = useActionState(updateProfileAction, undefined);

  const isSuccess = state?.message?.startsWith("✅");

  return (
    <form action={action} className="space-y-6">
      {state?.message && (
        <div
          className={`rounded-lg px-4 py-3 text-sm ${
            isSuccess
              ? "bg-green-500/10 border border-green-500/20 text-green-400"
              : "bg-danger/10 border border-danger/20 text-danger"
          }`}
        >
          {state.message}
        </div>
      )}

      {/* Name */}
      <div>
        <label htmlFor="profile-name" className="label">
          Full Name
        </label>
        <input
          id="profile-name"
          name="name"
          type="text"
          defaultValue={user.name}
          className="input-field"
          required
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="profile-email" className="label">
          Email Address
        </label>
        <input
          id="profile-email"
          name="email"
          type="email"
          defaultValue={user.email}
          className="input-field"
          required
        />
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="profile-phone" className="label">
          Phone Number
        </label>
        <input
          id="profile-phone"
          name="phone"
          type="text"
          defaultValue={user.phone}
          placeholder="923001234567"
          className="input-field"
        />
      </div>

      {/* Role & Member since — read only */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="label">Role</span>
          <div className="mt-1">
            <span className="badge badge-new capitalize">{user.role}</span>
          </div>
        </div>
        <div>
          <span className="label">Member Since</span>
          <div className="text-sm font-medium mt-1">
            {new Date(user.createdAt).toLocaleDateString("en-PK", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-white/10 pt-6">
        <h3 className="text-sm font-semibold mb-4 text-muted">
          Change Password <span className="font-normal">(optional)</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="profile-current-pw" className="label">
              Current Password
            </label>
            <input
              id="profile-current-pw"
              name="currentPassword"
              type="password"
              placeholder="••••••••"
              className="input-field"
            />
          </div>
          <div>
            <label htmlFor="profile-new-pw" className="label">
              New Password
            </label>
            <input
              id="profile-new-pw"
              name="newPassword"
              type="password"
              placeholder="••••••••"
              className="input-field"
            />
          </div>
        </div>
      </div>

      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
