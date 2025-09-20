"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  BarChart3,
  Database,
  FileText,
  ArrowLeft,
} from "lucide-react";

const cmsNavigation = [
  { name: "User Management", href: "/cms/users", icon: Users },
  { name: "System Settings", href: "/cms/system-settings", icon: Settings },
  { name: "Analytics", href: "/cms/analytics", icon: BarChart3 },
  { name: "Database", href: "/cms/database", icon: Database },
  { name: "Audit Logs", href: "/cms/logs", icon: FileText },
];

export default function CMSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
  };

  // Handle loading state
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect non-admins
  if (session.user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">You need admin privileges to access the CMS.</p>
          <Link href="/dashboard">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setSidebarOpen(false);
            }
          }}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-700 shadow-xl transform transition-transform lg:relative lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          {/* CMS Logo */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-emerald-400" />
              <div>
                <h1 className="text-lg font-bold text-white">CMS</h1>
                <p className="text-xs text-slate-300">Content Management</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-white hover:bg-slate-800"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Back to App Link */}
          <div className="px-2 py-3 border-b border-slate-700">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to App
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-0.5 px-2 py-3" data-testid="cms-navigation">
            {cmsNavigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-emerald-600 text-white border-l-4 border-emerald-400"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white hover:translate-x-1",
                  )}
                  data-testid={`cms-nav-${item.name.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <Icon
                    className={cn("h-5 w-5", isActive && "text-white")}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Admin User info */}
          <div className="border-t border-slate-700 p-3 bg-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {session?.user?.name}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {session?.user?.email}
                </p>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-600 text-white mt-1">
                  <Shield className="h-3 w-3 mr-1" />
                  Admin
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                title="Sign out"
                className="hover:bg-red-600 hover:text-white transition-colors text-slate-400"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-white px-4 shadow-sm lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {cmsNavigation.find((item) => item.href === pathname)?.name ||
                "CMS Dashboard"}
            </h2>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                <Shield className="h-3 w-3 mr-1" />
                CMS Mode
              </span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-3 lg:p-4 overflow-auto bg-slate-50">{children}</main>
      </div>
    </div>
  );
}
