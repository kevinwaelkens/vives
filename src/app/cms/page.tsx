"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Shield,
  Database,
  Activity,
  TrendingUp,
  CheckCircle,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";

export default function CMSDashboard() {
  const { t } = useTranslation("cms");

  // Mock data - replace with actual API calls
  const stats = {
    totalUsers: 45,
    activeUsers: 42,
    adminUsers: 3,
    tutorUsers: 15,
    recentActivity: 127,
    systemHealth: "healthy",
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-lg p-6 text-white">
        <div className="flex items-center space-x-3">
          <Shield className="h-10 w-10 text-emerald-400" />
          <div>
            <h1 className="text-2xl font-bold">
              {t("dashboard.welcome_title")}
            </h1>
            <p className="text-slate-300">{t("dashboard.welcome_subtitle")}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.total_users")}
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeUsers} {t("dashboard.active")}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.administrators")}
            </CardTitle>
            <Shield className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.adminUsers}</div>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.system_administrators")}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.tutors")}
            </CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tutorUsers}</div>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.active_tutors")}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.system_health")}
            </CardTitle>
            <Activity className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-green-600">
                {t("dashboard.healthy")}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.all_systems_operational")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <span>{t("user_management")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Create, edit, and manage system users and their roles.
            </p>
            <Link href="/cms/users">
              <Button className="w-full">{t("dashboard.manage_users")}</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-green-500" />
              <span>{t("dashboard.database_operations")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Backup, restore, and manage database operations.
            </p>
            <Link href="/cms/database">
              <Button variant="outline" className="w-full">
                {t("dashboard.database_tools")}
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <span>{t("analytics.title")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              View system usage statistics and performance metrics.
            </p>
            <Link href="/cms/analytics">
              <Button variant="outline" className="w-full">
                {t("dashboard.view_analytics")}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>{t("dashboard.recent_activity")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {t("dashboard.new_user_created")}
                </p>
                <p className="text-xs text-muted-foreground">
                  john.doe@example.com - 2 {t("dashboard.minutes_ago")}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {t("dashboard.user_role_updated")}
                </p>
                <p className="text-xs text-muted-foreground">
                  jane.smith@example.com {t("dashboard.promoted_to_tutor")} - 15{" "}
                  {t("dashboard.minutes_ago")}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {t("dashboard.system_backup_completed")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("dashboard.database_backup_successful")} - 1{" "}
                  {t("dashboard.hour_ago")}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
