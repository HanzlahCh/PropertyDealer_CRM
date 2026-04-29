import type { Metadata } from "next";
import AuthImageCarousel from "@/app/_components/AuthImageCarousel";

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
      {/* Left — image carousel */}
      <div className="hidden lg:block lg:w-1/2 relative">
        {/* Brand header floating on top */}
        <div className="absolute top-0 left-0 right-0 z-10 p-8">
          <h1 className="text-2xl font-bold text-white drop-shadow-lg">
            🏠 Property Dealer CRM
          </h1>
          <p className="mt-1 text-indigo-200/80 text-sm drop-shadow">
            Manage leads · Track agents · Close deals
          </p>
        </div>

        <AuthImageCarousel />

        {/* Footer floating on bottom-right */}
        <div className="absolute bottom-4 right-6 z-10">
          <span className="text-xs text-white/50">
            &copy; {new Date().getFullYear()} Property Dealer CRM
          </span>
        </div>
      </div>

      {/* Right — form panel */}
      <div className="flex flex-1 items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile-only branding */}
          <div className="lg:hidden mb-8 text-center">
            <h1 className="text-2xl font-bold text-accent">
              🏠 Property Dealer CRM
            </h1>
            <p className="text-muted text-sm mt-1">
              Manage leads · Track agents · Close deals
            </p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
