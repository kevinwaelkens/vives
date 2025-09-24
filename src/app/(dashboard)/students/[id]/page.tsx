"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CollapsibleCard } from "@/components/ui/collapsible-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  User,
  BookOpen,
  Calendar,
  TrendingUp,
  Mail,
  Phone,
  GraduationCap,
  Target,
  BarChart3,
  ExternalLink,
} from "lucide-react";
import { useStudent } from "@/data/hooks/use-students";
import { usePageTitle } from "@/lib/contexts/PageTitleContext";
import { useEffect } from "react";
import { formatDate } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import { TranslationLoading } from "@/components/ui/translation-loading";

// Simple chart components (we'll create these)
import { LineChart } from "@/components/charts/LineChart";
import { PieChart } from "@/components/charts/PieChart";

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;

  const { data: student, isLoading, error } = useStudent(studentId);
  const { setTitle } = usePageTitle();
  const { t, isLoading: translationsLoading } = useTranslation("students", {
    useDynamic: true,
  });

  const [selectedYear, setSelectedYear] = useState<string>("all");

  // Set page title when student data loads
  useEffect(() => {
    if (student) {
      setTitle(`${student.name} - ${t("detail.student_details")}`);
    }
  }, [student, setTitle, t]);

  // Process assessment data by year
  const assessmentsByYear = useMemo(() => {
    if (!student?.assessments) return {};

    const grouped: Record<string, typeof student.assessments> = {};
    student.assessments.forEach((assessment) => {
      const year = new Date(assessment.createdAt).getFullYear().toString();
      if (!grouped[year]) grouped[year] = [];
      grouped[year].push(assessment);
    });

    return grouped;
  }, [student?.assessments]);

  const availableYears = Object.keys(assessmentsByYear).sort((a, b) =>
    b.localeCompare(a),
  );

  // Filter assessments based on selected year
  const filteredAssessments = useMemo(() => {
    if (!student?.assessments) return [];
    if (selectedYear === "all") return student.assessments;
    return assessmentsByYear[selectedYear] || [];
  }, [student?.assessments, selectedYear, assessmentsByYear]);

  // Calculate statistics
  const stats = useMemo(() => {
    const assessments = filteredAssessments.filter((a) => a.score !== null);
    const totalAssessments = filteredAssessments.length;
    const completedAssessments = assessments.length;
    const averageScore =
      assessments.length > 0
        ? assessments.reduce((sum, a) => sum + (a.score || 0), 0) /
          assessments.length
        : 0;

    const taskTypes = assessments.reduce(
      (acc, a) => {
        const type = a.task.type;
        if (!acc[type]) acc[type] = { count: 0, totalScore: 0 };
        acc[type].count++;
        acc[type].totalScore += a.score || 0;
        return acc;
      },
      {} as Record<string, { count: number; totalScore: number }>,
    );

    return {
      totalAssessments,
      completedAssessments,
      averageScore: Math.round(averageScore * 10) / 10,
      completionRate:
        totalAssessments > 0
          ? Math.round((completedAssessments / totalAssessments) * 100)
          : 0,
      taskTypes,
    };
  }, [filteredAssessments]);

  // Prepare chart data
  const scoresTrend = useMemo(() => {
    const assessments = filteredAssessments
      .filter((a) => a.score !== null && a.submittedAt)
      .sort((a, b) => {
        const dateA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
        const dateB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
        return dateA - dateB;
      });

    return assessments.map((a, index) => ({
      x: index + 1,
      y: a.score || 0,
      label: a.task.title,
      date: a.submittedAt ? formatDate(a.submittedAt) : "No date",
    }));
  }, [filteredAssessments]);

  const taskTypeData = useMemo(() => {
    return Object.entries(stats.taskTypes).map(([type, data]) => ({
      name: type,
      value: data.count,
      averageScore: Math.round((data.totalScore / data.count) * 10) / 10,
    }));
  }, [stats.taskTypes]);

  // Show loading skeleton while translations are loading
  if (translationsLoading) {
    return (
      <div className="animate-pulse space-y-6 p-6">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border rounded-lg p-6 space-y-4">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-32 bg-gray-100 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">{t("detail.loading")}</p>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">{t("detail.failed_to_load")}</p>
          <Button onClick={() => router.push("/students")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("detail.back_to_students")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <TranslationLoading isLoading={translationsLoading}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push("/students")}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {student.name}
              </h1>
              <p className="text-gray-500">
                {student.studentId} •{" "}
                {student.group?.name || t("detail.no_group")} • {student.status}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t("detail.select_year")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("detail.all_years")}</SelectItem>
                {availableYears.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Mail className="h-4 w-4 mr-2" />
              {t("detail.contact")}
            </Button>
          </div>
        </div>

        {/* Student Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("detail.total_assignments")}
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAssessments}</div>
              <p className="text-xs text-muted-foreground">
                {stats.completedAssessments} {t("detail.completed")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("detail.average_score")}
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageScore}%</div>
              <p className="text-xs text-muted-foreground">
                {t("detail.based_on_assessments", {
                  count: stats.completedAssessments,
                })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("detail.completion_rate")}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completionRate}%</div>
              <p className="text-xs text-muted-foreground">
                {t("detail.assignments_completed_on_time")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("detail.current_group")}
              </CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {student.group?.name || t("detail.no_group")}
              </div>
              <p className="text-xs text-muted-foreground">
                {student.group?.code || t("detail.no_code")} •{" "}
                {t("detail.grade")} {student.group?.grade || "N/A"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Charts */}
        <CollapsibleCard
          title={t("detail.performance_overview")}
          icon={<BarChart3 className="h-5 w-5" />}
          badge={<Badge variant="secondary">{t("detail.charts")}</Badge>}
          defaultOpen={true}
          previewContent={t("detail.score_trends_analytics")}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {t("detail.score_trend")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <LineChart
                    data={scoresTrend}
                    xLabel={t("detail.assignment_number")}
                    yLabel={t("detail.score_percent")}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {t("detail.task_types_distribution")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <PieChart data={taskTypeData} />
                </div>
              </CardContent>
            </Card>
          </div>
        </CollapsibleCard>

        {/* Assignment History */}
        <CollapsibleCard
          title={t("detail.assignment_history")}
          icon={<BookOpen className="h-5 w-5" />}
          badge={
            <Badge variant="secondary">{filteredAssessments.length}</Badge>
          }
          defaultOpen={true}
          previewContent={
            filteredAssessments.length > 0
              ? t("detail.latest", {
                  title: filteredAssessments[0]?.task.title,
                })
              : t("detail.no_assignments_found")
          }
        >
          <div className="space-y-4">
            {filteredAssessments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t("detail.no_assignments_period")}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAssessments.map((assessment) => (
                  <Card key={assessment.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Link
                            href={`/tasks/${assessment.task.id}`}
                            className="font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                          >
                            {assessment.task.title}
                          </Link>
                          <ExternalLink className="h-3 w-3 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-500 mb-2">
                          {assessment.task.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {assessment.task.dueDate
                              ? t("detail.due", {
                                  date: formatDate(assessment.task.dueDate),
                                })
                              : t("detail.no_due_date")}
                          </div>
                          <Badge variant="secondary">
                            {assessment.task.type}
                          </Badge>
                          <Badge
                            variant={
                              assessment.status === "GRADED"
                                ? "default"
                                : assessment.status === "SUBMITTED"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {assessment.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        {assessment.score !== null ? (
                          <div className="text-lg font-bold text-green-600">
                            {assessment.score}%
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">
                            {t("detail.not_graded")}
                          </div>
                        )}
                        {assessment.submittedAt && (
                          <div className="text-xs text-gray-500">
                            {t("detail.submitted", {
                              date: formatDate(assessment.submittedAt),
                            })}
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

        {/* Student Information */}
        <CollapsibleCard
          title={t("detail.student_information")}
          icon={<User className="h-5 w-5" />}
          badge={<Badge variant="outline">{t("detail.details")}</Badge>}
          defaultOpen={false}
          previewContent={`${student.email} • ${t("detail.enrolled", { date: formatDate(student.enrolledAt) })}`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">
                  {t("detail.contact_information")}
                </h4>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-500" />
                    {student.email}
                  </div>
                  {student.dateOfBirth && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      {t("detail.born", {
                        date: formatDate(student.dateOfBirth),
                      })}
                    </div>
                  )}
                </div>
              </div>

              {student.parentContacts && student.parentContacts.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900">
                    {t("detail.parent_contacts")}
                  </h4>
                  <div className="mt-2 space-y-2">
                    {student.parentContacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="p-3 bg-gray-50 rounded-md"
                      >
                        <div className="font-medium">{contact.name}</div>
                        <div className="text-sm text-gray-600 capitalize">
                          {contact.relationship}
                          {contact.isPrimary && ` (${t("detail.primary")})`}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {contact.email}
                          </div>
                          {contact.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {contact.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">
                  {t("detail.academic_information")}
                </h4>
                <div className="mt-2 space-y-2">
                  <div className="text-sm">
                    <span className="text-gray-500">
                      {t("detail.student_id")}
                    </span>{" "}
                    {student.studentId}
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">{t("detail.status")}</span>{" "}
                    <Badge variant="secondary">{student.status}</Badge>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">
                      {t("detail.enrolled_label")}
                    </span>{" "}
                    {formatDate(student.enrolledAt)}
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">{t("detail.group")}</span>{" "}
                    {student.group?.name || t("detail.no_group")} (
                    {student.group?.code || t("detail.no_code")})
                  </div>
                </div>
              </div>

              {student.notes && (
                <div>
                  <h4 className="font-medium text-gray-900">
                    {t("detail.notes")}
                  </h4>
                  <div className="mt-2 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-700">{student.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CollapsibleCard>
      </div>
    </TranslationLoading>
  );
}
