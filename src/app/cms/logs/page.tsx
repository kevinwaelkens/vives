"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Search,
  Filter,
  Download,
  AlertTriangle,
  CheckCircle,
  Info,
  XCircle,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export default function CMSLogsPage() {
  const { t } = useTranslation("cms", {
    useDynamic: true,
    fallbackToStatic: true,
  });
  // Mock audit log data
  const auditLogs = [
    {
      id: 1,
      action: "CREATE",
      entity: "User",
      entityId: "user_123",
      userId: "admin_1",
      userName: "Admin User",
      timestamp: "2024-01-15 14:30:25",
      details: "Created new user: john.doe@example.com",
      type: "success",
    },
    {
      id: 2,
      action: "UPDATE",
      entity: "User",
      entityId: "user_456",
      userId: "admin_1",
      userName: "Admin User",
      timestamp: "2024-01-15 14:25:10",
      details: "Updated user role from VIEWER to TUTOR",
      type: "info",
    },
    {
      id: 3,
      action: "DELETE",
      entity: "Student",
      entityId: "student_789",
      userId: "tutor_2",
      userName: "Jane Tutor",
      timestamp: "2024-01-15 14:20:45",
      details: "Deleted student record: jane.student@example.com",
      type: "warning",
    },
    {
      id: 4,
      action: "LOGIN_FAILED",
      entity: "Auth",
      entityId: "auth_attempt",
      userId: "unknown",
      userName: "Unknown",
      timestamp: "2024-01-15 14:15:30",
      details: "Failed login attempt for: suspicious@example.com",
      type: "error",
    },
    {
      id: 5,
      action: "BACKUP",
      entity: "Database",
      entityId: "backup_001",
      userId: "system",
      userName: "System",
      timestamp: "2024-01-15 02:00:00",
      details: "Automatic database backup completed successfully",
      type: "success",
    },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      case "error":
        return "bg-red-50 border-red-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t("logs.title")}</h1>
        <p className="text-gray-600">{t("logs.subtitle")}</p>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>{t("logs.filters")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder={t("logs.search_placeholder")}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                {t("logs.filter_by_type")}
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                {t("logs.export_logs")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Log Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("logs.total_logs")}
            </CardTitle>
            <FileText className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">
              {t("logs.last_30_days")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("logs.success")}
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">1,156</div>
            <p className="text-xs text-muted-foreground">
              92.7% {t("logs.success_rate")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("logs.warnings")}
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">67</div>
            <p className="text-xs text-muted-foreground">
              5.4% {t("logs.of_total")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("logs.errors")}
            </CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">24</div>
            <p className="text-xs text-muted-foreground">
              1.9% {t("logs.error_rate")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Audit Logs */}
      <Card>
        <CardHeader>
          <CardTitle>{t("logs.recent_activity")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className={`p-4 rounded-lg border ${getTypeColor(log.type)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {getIcon(log.type)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-sm">
                          {log.action}
                        </span>
                        <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                          {log.entity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-1">
                        {log.details}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>By: {log.userName}</span>
                        <span>Entity ID: {log.entityId}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 text-right">
                    {log.timestamp}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-center">
            <Button variant="outline">{t("logs.load_more")}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
