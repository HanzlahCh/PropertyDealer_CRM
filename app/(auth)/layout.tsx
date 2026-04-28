import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Property Dealer CRM — Sign In",
  description: "Sign in or create an account to manage your leads",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-accent p-12">
        <div>
          <h1 className="text-3xl font-bold text-white">
            🏠 Property Dealer CRM
          </h1>
          <p className="mt-2 text-indigo-200 text-sm">
            Manage leads · Track agents · Close deals
          </p>
        </div>
        <div className="space-y-6">
          <blockquote className="border-l-2 border-white/30 pl-4 text-indigo-100 italic">
            &ldquo;This CRM helped us close 40% more deals in our first
            quarter.&rdquo;
          </blockquote>
          <div className="text-sm text-indigo-200">
            — Ahmed Khan, Senior Property Dealer
          </div>
        </div>
        <div className="text-xs text-indigo-300">
          &copy; {new Date().getFullYear()} Property Dealer CRM. All rights
          reserved.
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
