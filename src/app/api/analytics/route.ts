import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only ADMIN and TUTOR can access analytics
    if (!["ADMIN", "TUTOR"].includes(session.user.role as Role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get date range from query params (default to last 30 days)
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "30");
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Parallel queries for better performance
    const [
      totalStudents,
      totalGroups,
      publishedTasks,
      assessmentStats,
      attendanceStats,
      gradeDistribution,
      taskCompletionStats,
      topPerformers,
      performanceTrend,
      weeklyAttendance,
    ] = await Promise.all([
      // Total active students
      prisma.student.count({
        where: { status: "ACTIVE" },
      }),

      // Total active groups
      prisma.group.count({
        where: { isActive: true },
      }),

      // Total published tasks
      prisma.task.count({
        where: { isPublished: true },
      }),

      // Assessment statistics
      prisma.assessment.groupBy({
        by: ["status"],
        _count: {
          status: true,
        },
      }),

      // Attendance statistics (last 7 days)
      prisma.attendance.groupBy({
        by: ["status"],
        where: {
          date: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
        _count: {
          status: true,
        },
      }),

      // Grade distribution (only graded assessments)
      prisma.assessment.findMany({
        where: {
          status: "GRADED",
          score: { not: null },
        },
        select: {
          score: true,
          grade: true,
        },
      }),

      // Task completion statistics
      prisma.assessment.groupBy({
        by: ["status"],
        where: {
          task: {
            isPublished: true,
          },
        },
        _count: {
          status: true,
        },
      }),

      // Top 5 performing students (by average score)
      prisma.student.findMany({
        where: {
          status: "ACTIVE",
          assessments: {
            some: {
              status: "GRADED",
              score: { not: null },
            },
          },
        },
        select: {
          id: true,
          name: true,
          assessments: {
            where: {
              status: "GRADED",
              score: { not: null },
            },
            select: {
              score: true,
            },
          },
        },
        take: 10, // Get more to calculate averages
      }),

      // Performance trend (last 6 months)
      prisma.assessment.groupBy({
        by: ["gradedAt"],
        where: {
          status: "GRADED",
          score: { not: null },
          gradedAt: {
            gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000),
          },
        },
        _avg: {
          score: true,
        },
        orderBy: {
          gradedAt: "asc",
        },
      }),

      // Weekly attendance (last 7 days)
      prisma.attendance.findMany({
        where: {
          date: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
        select: {
          date: true,
          status: true,
        },
      }),
    ]);

    // Process grade distribution
    const gradeDistributionData = [
      { grade: "A", students: 0, percentage: 0 },
      { grade: "B", students: 0, percentage: 0 },
      { grade: "C", students: 0, percentage: 0 },
      { grade: "D", students: 0, percentage: 0 },
      { grade: "F", students: 0, percentage: 0 },
    ];

    gradeDistribution.forEach((assessment) => {
      if (assessment.grade) {
        const gradeIndex = gradeDistributionData.findIndex(
          (g) => g.grade === assessment.grade,
        );
        if (gradeIndex !== -1) {
          gradeDistributionData[gradeIndex].students++;
        }
      }
    });

    const totalGraded = gradeDistribution.length;
    gradeDistributionData.forEach((grade) => {
      grade.percentage =
        totalGraded > 0
          ? Math.round((grade.students / totalGraded) * 100 * 10) / 10
          : 0;
    });

    // Process task completion
    const taskCompletionData = [
      { name: "Completed", value: 0, color: "#10b981" },
      { name: "Pending", value: 0, color: "#f59e0b" },
      { name: "Overdue", value: 0, color: "#ef4444" },
    ];

    taskCompletionStats.forEach((stat) => {
      if (stat.status === "GRADED") {
        taskCompletionData[0].value = stat._count.status;
      } else if (
        stat.status === "SUBMITTED" ||
        stat.status === "LATE_SUBMITTED"
      ) {
        taskCompletionData[1].value += stat._count.status;
      } else if (stat.status === "NOT_SUBMITTED") {
        taskCompletionData[1].value += stat._count.status;
      }
    });

    // Calculate total for percentages
    const totalTasksForCompletion = taskCompletionData.reduce(
      (sum, item) => sum + item.value,
      0,
    );
    if (totalTasksForCompletion > 0) {
      taskCompletionData.forEach((item) => {
        const percentage = Math.round(
          (item.value / totalTasksForCompletion) * 100,
        );
        item.value = percentage;
      });
    }

    // Process top performers
    const topPerformersData = topPerformers
      .map((student) => {
        const scores = student.assessments
          .map((a) => a.score)
          .filter(Boolean) as number[];
        const averageScore =
          scores.length > 0
            ? Math.round(
                scores.reduce((sum, score) => sum + score, 0) / scores.length,
              )
            : 0;

        return {
          name: student.name,
          score: averageScore,
          trend: "up" as const, // We'll assume positive trend for now
        };
      })
      .filter((student) => student.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    // Process performance trend (group by month)
    const performanceTrendData: { month: string; average: number }[] = [];
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthlyData: { [key: string]: number[] } = {};

    performanceTrend.forEach((item) => {
      if (item.gradedAt && item._avg.score) {
        const month = monthNames[item.gradedAt.getMonth()];
        if (!monthlyData[month]) {
          monthlyData[month] = [];
        }
        monthlyData[month].push(item._avg.score);
      }
    });

    Object.entries(monthlyData).forEach(([month, scores]) => {
      const average = Math.round(
        scores.reduce((sum, score) => sum + score, 0) / scores.length,
      );
      performanceTrendData.push({ month, average });
    });

    // Process weekly attendance
    const weeklyAttendanceData = [
      { day: "Mon", present: 0, absent: 0, late: 0 },
      { day: "Tue", present: 0, absent: 0, late: 0 },
      { day: "Wed", present: 0, absent: 0, late: 0 },
      { day: "Thu", present: 0, absent: 0, late: 0 },
      { day: "Fri", present: 0, absent: 0, late: 0 },
    ];

    weeklyAttendance.forEach((attendance) => {
      const dayOfWeek = attendance.date.getDay(); // 0 = Sunday, 1 = Monday, etc.
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        // Monday to Friday
        const dayIndex = dayOfWeek - 1;
        const dayData = weeklyAttendanceData[dayIndex];

        if (attendance.status === "PRESENT") {
          dayData.present++;
        } else if (attendance.status === "ABSENT") {
          dayData.absent++;
        } else if (attendance.status === "LATE") {
          dayData.late++;
        }
      }
    });

    // Calculate key metrics
    const totalAssessments = assessmentStats.reduce(
      (sum, stat) => sum + stat._count.status,
      0,
    );
    const gradedAssessments =
      assessmentStats.find((stat) => stat.status === "GRADED")?._count.status ||
      0;

    const totalAttendanceRecords = attendanceStats.reduce(
      (sum, stat) => sum + stat._count.status,
      0,
    );
    const presentCount =
      attendanceStats.find((stat) => stat.status === "PRESENT")?._count
        .status || 0;
    const attendanceRate =
      totalAttendanceRecords > 0
        ? Math.round((presentCount / totalAttendanceRecords) * 100 * 10) / 10
        : 0;

    const averageScore =
      gradeDistribution.length > 0
        ? Math.round(
            (gradeDistribution.reduce(
              (sum, assessment) => sum + (assessment.score || 0),
              0,
            ) /
              gradeDistribution.length) *
              10,
          ) / 10
        : 0;

    const response = {
      // Key metrics
      keyMetrics: {
        averageScore,
        attendanceRate,
        tasksCompleted: gradedAssessments,
        activeStudents: totalStudents,
      },

      // Chart data
      attendanceData: weeklyAttendanceData,
      gradeDistribution: gradeDistributionData,
      taskCompletion: taskCompletionData,
      performanceTrend:
        performanceTrendData.length > 0
          ? performanceTrendData
          : [{ month: "Current", average: averageScore }],
      topPerformers: topPerformersData,

      // Additional stats
      additionalStats: {
        totalAssignments: publishedTasks,
        avgSubmissionRate:
          totalAssessments > 0
            ? Math.round((gradedAssessments / totalAssessments) * 100)
            : 0,
        avgClassSize:
          totalGroups > 0 ? Math.round(totalStudents / totalGroups) : 0,
        passRate:
          gradeDistribution.length > 0
            ? Math.round(
                (gradeDistribution.filter((a) => (a.score || 0) >= 60).length /
                  gradeDistribution.length) *
                  100,
              )
            : 0,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
