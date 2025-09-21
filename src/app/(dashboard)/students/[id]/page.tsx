"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
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
} from "lucide-react";
import { useStudent } from "@/data/hooks/use-students";
import { usePageTitle } from "@/lib/contexts/PageTitleContext";
import { useEffect } from "react";
import { formatDate } from "@/lib/utils";

// Simple chart components (we'll create these)
import { LineChart } from "@/components/charts/LineChart";
import { PieChart } from "@/components/charts/PieChart";

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;

  const { data: student, isLoading, error } = useStudent(studentId);
  const { setTitle } = usePageTitle();
  // const { t } = useTranslation("students");

  const [selectedYear, setSelectedYear] = useState<string>("all");

  // Set page title when student data loads
  useEffect(() => {
    if (student) {
      setTitle(`${student.name} - Student Details`);
    }
  }, [student, setTitle]);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading student details...</p>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">Failed to load student details</p>
          <Button onClick={() => router.push("/students")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Students
          </Button>
        </div>
      </div>
    );
  }

  return (
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
            <h1 className="text-2xl font-bold text-gray-900">{student.name}</h1>
            <p className="text-gray-500">
              {student.studentId} • {student.group?.name || "No group"} •{" "}
              {student.status}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {availableYears.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Mail className="h-4 w-4 mr-2" />
            Contact
          </Button>
        </div>
      </div>

      {/* Student Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Assignments
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAssessments}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedAssessments} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageScore}%</div>
            <p className="text-xs text-muted-foreground">
              Based on {stats.completedAssessments} assessments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completion Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Assignments completed on time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Group</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {student.group?.name || "No group"}
            </div>
            <p className="text-xs text-muted-foreground">
              {student.group?.code || "No code"} • Grade{" "}
              {student.group?.grade || "N/A"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <CollapsibleCard
        title="Performance Overview"
        icon={<BarChart3 className="h-5 w-5" />}
        badge={<Badge variant="secondary">Charts</Badge>}
        defaultOpen={true}
        previewContent="Score trends and performance analytics"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Score Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <LineChart
                  data={scoresTrend}
                  xLabel="Assignment #"
                  yLabel="Score (%)"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Task Types Distribution</CardTitle>
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
        title="Assignment History"
        icon={<BookOpen className="h-5 w-5" />}
        badge={<Badge variant="secondary">{filteredAssessments.length}</Badge>}
        defaultOpen={true}
        previewContent={
          filteredAssessments.length > 0
            ? `Latest: ${filteredAssessments[0]?.task.title}`
            : "No assignments found"
        }
      >
        <div className="space-y-4">
          {filteredAssessments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No assignments found for the selected period.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAssessments.map((assessment) => (
                <Card key={assessment.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{assessment.task.title}</h4>
                      <p className="text-sm text-gray-500 mb-2">
                        {assessment.task.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {assessment.task.dueDate
                            ? `Due: ${formatDate(assessment.task.dueDate)}`
                            : "No due date"}
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
                        <div className="text-sm text-gray-500">Not graded</div>
                      )}
                      {assessment.submittedAt && (
                        <div className="text-xs text-gray-500">
                          Submitted: {formatDate(assessment.submittedAt)}
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
        title="Student Information"
        icon={<User className="h-5 w-5" />}
        badge={<Badge variant="outline">Details</Badge>}
        defaultOpen={false}
        previewContent={`${student.email} • Enrolled ${formatDate(student.enrolledAt)}`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900">Contact Information</h4>
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-500" />
                  {student.email}
                </div>
                {student.dateOfBirth && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    Born: {formatDate(student.dateOfBirth)}
                  </div>
                )}
              </div>
            </div>

            {student.parentContacts && student.parentContacts.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900">Parent Contacts</h4>
                <div className="mt-2 space-y-2">
                  {student.parentContacts.map((contact) => (
                    <div key={contact.id} className="p-3 bg-gray-50 rounded-md">
                      <div className="font-medium">{contact.name}</div>
                      <div className="text-sm text-gray-600 capitalize">
                        {contact.relationship}
                        {contact.isPrimary && " (Primary)"}
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
                Academic Information
              </h4>
              <div className="mt-2 space-y-2">
                <div className="text-sm">
                  <span className="text-gray-500">Student ID:</span>{" "}
                  {student.studentId}
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Status:</span>{" "}
                  <Badge variant="secondary">{student.status}</Badge>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Enrolled:</span>{" "}
                  {formatDate(student.enrolledAt)}
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Group:</span>{" "}
                  {student.group?.name || "No group"} (
                  {student.group?.code || "No code"})
                </div>
              </div>
            </div>

            {student.notes && (
              <div>
                <h4 className="font-medium text-gray-900">Notes</h4>
                <div className="mt-2 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-700">{student.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CollapsibleCard>
    </div>
  );
}
