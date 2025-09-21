"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CollapsibleCard } from "@/components/ui/collapsible-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Clock,
  Users,
  FileText,
  Target,
  CheckCircle,
  XCircle,
  Edit2,
  Download,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/data/api/client";
import { usePageTitle } from "@/lib/contexts/PageTitleContext";
import { formatDate } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

interface TaskDetail {
  id: string;
  title: string;
  description: string;
  instructions?: string;
  type: string;
  category?: string;
  points?: number;
  dueDate?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  groups: Array<{
    id: string;
    name: string;
    code: string;
    grade: string;
  }>;
  assessments: Array<{
    id: string;
    status: string;
    score?: number;
    submittedAt?: string;
    feedback?: string;
    student: {
      id: string;
      name: string;
      studentId: string;
    };
  }>;
  _count: {
    assessments: number;
  };
}

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;
  const { setTitle } = usePageTitle();
  const { t } = useTranslation("tasks");

  // Fetch task details
  const {
    data: task,
    isLoading,
    error,
  } = useQuery<TaskDetail>({
    queryKey: ["task", taskId],
    queryFn: async () => {
      const response = await apiClient.get<TaskDetail>(`/tasks/${taskId}`);
      return response;
    },
  });

  // Set page title when task data loads
  useEffect(() => {
    if (task) {
      setTitle(`${task.title} - Task Details`);
    }
  }, [task, setTitle]);

  // Calculate statistics
  const totalStudents =
    task?.groups.reduce(
      (acc, group) =>
        acc +
        ((group as { _count?: { students?: number } })._count?.students || 0),
      0,
    ) || 0;

  const actualSubmissions =
    task?.assessments.filter(
      (a) => a.status === "SUBMITTED" || a.status === "GRADED",
    ) || [];

  const stats = {
    totalSubmissions: actualSubmissions.length,
    gradedSubmissions: actualSubmissions.filter((a) => a.score !== null).length,
    pendingSubmissions: actualSubmissions.filter(
      (a) => a.status === "SUBMITTED" && a.score === null,
    ).length,
    notSubmitted: totalStudents - actualSubmissions.length,
    averageScore: actualSubmissions.filter((a) => a.score !== null).length
      ? Math.round(
          (actualSubmissions
            .filter((a) => a.score !== null)
            .reduce((sum, a) => sum + (a.score || 0), 0) /
            actualSubmissions.filter((a) => a.score !== null).length) *
            10,
        ) / 10
      : 0,
    totalStudents,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">{t("loading_task_details")}</p>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">{t("failed_to_load_task")}</p>
          <Button onClick={() => router.push("/tasks")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("back_to_tasks")}
          </Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "GRADED":
        return "bg-green-100 text-green-800";
      case "SUBMITTED":
        return "bg-blue-100 text-blue-800";
      case "LATE":
        return "bg-red-100 text-red-800";
      case "DRAFT":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "EXAM":
        return "bg-red-100 text-red-700";
      case "QUIZ":
        return "bg-yellow-100 text-yellow-700";
      case "PROJECT":
        return "bg-purple-100 text-purple-700";
      case "HOMEWORK":
        return "bg-green-100 text-green-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/tasks")}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
            <div className="flex items-center gap-3 mt-1">
              <Badge className={getTypeColor(task.type)}>{task.type}</Badge>
              {task.category && (
                <span className="text-gray-500">{task.category}</span>
              )}
              {task.isPublished ? (
                <Badge
                  variant="default"
                  className="bg-green-100 text-green-800"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {t("published")}
                </Badge>
              ) : (
                <Badge variant="secondary">{t("draft")}</Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Edit2 className="h-4 w-4 mr-2" />
            {t("edit_task")}
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            {t("export_results")}
          </Button>
        </div>
      </div>

      {/* Task Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("stats.total_submissions")}
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
            <p className="text-xs text-muted-foreground">
              {t("stats.out_of_students", { count: stats.totalStudents })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("stats.graded")}
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.gradedSubmissions}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalSubmissions > 0
                ? Math.round(
                    (stats.gradedSubmissions / stats.totalSubmissions) * 100,
                  )
                : 0}
              {t("stats.percent_of_submissions")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("stats.pending")}
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pendingSubmissions}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("stats.awaiting_grading")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("stats.not_submitted")}
            </CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.notSubmitted}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("stats.missing_submissions")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("stats.average_score")}
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageScore}%</div>
            <p className="text-xs text-muted-foreground">
              {t("stats.based_on_grades", { count: stats.gradedSubmissions })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Task Details */}
      <CollapsibleCard
        title={t("task_information")}
        icon={<BookOpen className="h-5 w-5" />}
        badge={<Badge variant="outline">{t("details")}</Badge>}
        defaultOpen={true}
        previewContent={task.description}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900">{t("description")}</h4>
              <p className="mt-2 text-gray-700">{task.description}</p>
            </div>

            {task.instructions && (
              <div>
                <h4 className="font-medium text-gray-900">
                  {t("instructions")}
                </h4>
                <div className="mt-2 p-3 bg-gray-50 rounded-md">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {task.instructions}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900">{t("task_details")}</h4>
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500">{t("type")}:</span>
                  <Badge className={getTypeColor(task.type)}>{task.type}</Badge>
                </div>
                {task.category && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">{t("category")}:</span>
                    <span>{task.category}</span>
                  </div>
                )}
                {task.points && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">{t("points")}:</span>
                    <span className="font-medium">{task.points}</span>
                  </div>
                )}
                {task.dueDate && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-500">{t("due")}:</span>
                    <span>{formatDate(task.dueDate)}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500">{t("created")}:</span>
                  <span>{formatDate(task.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500">{t("last_updated")}:</span>
                  <span>{formatDate(task.updatedAt)}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900">
                {t("assigned_groups")}
              </h4>
              <div className="mt-2 space-y-2">
                {task.groups.map((group) => (
                  <div
                    key={group.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                  >
                    <div>
                      <div className="font-medium">{group.name}</div>
                      <div className="text-sm text-gray-600">
                        {group.code} • Grade {group.grade}
                      </div>
                    </div>
                    <Users className="h-4 w-4 text-gray-500" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CollapsibleCard>

      {/* Submissions */}
      <CollapsibleCard
        title={t("student_submissions")}
        icon={<FileText className="h-5 w-5" />}
        badge={<Badge variant="secondary">{task.assessments.length}</Badge>}
        defaultOpen={true}
        previewContent={
          task.assessments.length > 0
            ? t("submissions_preview", {
                graded: stats.gradedSubmissions,
                pending: stats.pendingSubmissions,
              })
            : t("no_submissions_yet")
        }
      >
        <div className="space-y-4">
          {task.assessments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t("no_submissions_for_task")}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {task.assessments.map((assessment) => (
                <Card key={assessment.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">
                          {assessment.student.name}
                        </h4>
                        <span className="text-sm text-gray-500">
                          ({assessment.student.studentId})
                        </span>
                        <Badge className={getStatusColor(assessment.status)}>
                          {t(`status.${assessment.status.toLowerCase()}`)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {assessment.submittedAt && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {t("submitted")}:{" "}
                            {formatDate(assessment.submittedAt)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {assessment.score !== null ? (
                        <div className="text-lg font-bold text-green-600">
                          {assessment.score}%
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">
                          {t("not_graded")}
                        </div>
                      )}
                    </div>
                  </div>
                  {assessment.feedback && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-700">
                        {assessment.feedback}
                      </p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </CollapsibleCard>
    </div>
  );
}
