"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, ClipboardCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "@/lib/i18n";

interface DashboardStats {
  totalStudents: number;
  totalGroups: number;
  totalTasks: number;
  pendingAssessments: number;
  todayAttendance: {
    present: number;
    absent: number;
    late: number;
    excused: number;
  };
}

export default function DashboardPage() {
  const { t } = useTranslation("dashboard", { useDynamic: true });
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      // This would be replaced with actual API call
      return {
        totalStudents: 156,
        totalGroups: 12,
        totalTasks: 45,
        pendingAssessments: 23,
        todayAttendance: {
          present: 142,
          absent: 8,
          late: 4,
          excused: 2,
        },
      } as DashboardStats;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">{t("loading")}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
        <p className="text-gray-600">{t("welcome")}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("stats.total_students")}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              {t("stats.active_students_enrolled")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("stats.total_groups")}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalGroups}</div>
            <p className="text-xs text-muted-foreground">
              {t("stats.active_class_groups")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("stats.active_tasks")}
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              {t("stats.published_assignments")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("stats.pending_assessments")}
            </CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.pendingAssessments}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("stats.awaiting_grading")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Attendance */}
      <Card>
        <CardHeader>
          <CardTitle>{t("attendance.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {stats?.todayAttendance.present}
              </div>
              <p className="text-sm text-gray-600">{t("attendance.present")}</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {stats?.todayAttendance.absent}
              </div>
              <p className="text-sm text-gray-600">{t("attendance.absent")}</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {stats?.todayAttendance.late}
              </div>
              <p className="text-sm text-gray-600">{t("attendance.late")}</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {stats?.todayAttendance.excused}
              </div>
              <p className="text-sm text-gray-600">{t("attendance.excused")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("recent_tasks")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Mathematics Quiz</p>
                  <p className="text-sm text-gray-500">{t("due_tomorrow")}</p>
                </div>
                <span className="text-sm text-gray-500">Grade 10A</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Science Project</p>
                  <p className="text-sm text-gray-500">{t("due_next_week")}</p>
                </div>
                <span className="text-sm text-gray-500">Grade 9B</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">History Essay</p>
                  <p className="text-sm text-gray-500">
                    {t("due_in_days", { count: 3 })}
                  </p>
                </div>
                <span className="text-sm text-gray-500">Grade 11C</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("recent_submissions")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">John Doe</p>
                  <p className="text-sm text-gray-500">English Assignment</p>
                </div>
                <span className="text-sm text-green-600">{t("submitted")}</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Jane Smith</p>
                  <p className="text-sm text-gray-500">Math Homework</p>
                </div>
                <span className="text-sm text-green-600">{t("submitted")}</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Mike Johnson</p>
                  <p className="text-sm text-gray-500">Physics Lab Report</p>
                </div>
                <span className="text-sm text-yellow-600">
                  {t("late_submission")}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
