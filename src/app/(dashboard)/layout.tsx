"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { LanguageSelector } from "@/components/i18n/LanguageSelector";
import {
  Users,
  BookOpen,
  ClipboardList,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  UserCheck,
  Shield,
} from "lucide-react";

// Navigation items with translation keys
const navigationItems = [
  { key: "dashboard", href: "/dashboard", icon: Home },
  { key: "students", href: "/students", icon: Users },
  { key: "groups", href: "/groups", icon: UserCheck },
  { key: "tasks", href: "/tasks", icon: BookOpen },
  { key: "assessments", href: "/assessments", icon: ClipboardList },
  { key: "attendance", href: "/attendance", icon: Calendar },
  { key: "analytics", href: "/analytics", icon: BarChart3 },
  { key: "settings", href: "/settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t } = useTranslation("navigation");

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="min-h-screen bg-gray-100 lg:grid lg:grid-cols-[256px_1fr]">
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
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 shadow-xl transform transition-transform lg:relative lg:translate-x-0 lg:w-full",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="grid grid-rows-[auto_1fr_auto_auto] h-screen">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
            <h1 className="text-xl font-bold text-white">School MS</h1>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-white hover:bg-blue-800"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation - scrollable area */}
          <div className="overflow-y-auto">
            <nav className="space-y-0.5 px-2 py-3" data-testid="navigation">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                const itemName = t(item.key, item.key.split(".").pop());

                // Check if user has permission to view this route
                if (
                  item.key === "navigation.settings" &&
                  session?.user?.role !== "ADMIN"
                ) {
                  return null;
                }

                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-blue-50 text-blue-700 border-l-4 border-blue-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:translate-x-1",
                    )}
                    data-testid={`nav-${item.key.split(".").pop()}`}
                  >
                    <Icon
                      className={cn("h-5 w-5", isActive && "text-blue-700")}
                    />
                    {itemName}
                  </Link>
                );
              })}

              {/* CMS Access for Admins */}
              {session?.user?.role === "ADMIN" && (
                <div className="pt-2 mt-2 border-t border-gray-200">
                  <Link
                    href="/cms"
                    className="flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 hover:translate-x-1"
                    data-testid="nav-cms"
                  >
                    <Shield className="h-5 w-5" />
                    CMS
                  </Link>
                </div>
              )}
            </nav>
          </div>

          {/* Language Selector - always visible at bottom */}
          <div className="border-t border-gray-200 p-3">
            <LanguageSelector variant="select" showLabel={false} />
          </div>

          {/* User info - always visible at bottom */}
          <div className="border-t border-gray-200 p-3 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session?.user?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {session?.user?.email}
                </p>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                  {session?.user?.role?.toLowerCase()}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                title={t("auth.logout", "Logout")}
                className="hover:bg-red-100 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col min-w-0 lg:min-h-screen">
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
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">
              {(() => {
                const currentItem = navigationItems.find(
                  (item) => item.href === pathname,
                );
                return currentItem
                  ? t(currentItem.key, currentItem.key.split(".").pop())
                  : t("navigation.dashboard", "Dashboard");
              })()}
            </h2>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-3 lg:p-4 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
