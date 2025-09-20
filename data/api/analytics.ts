import { apiClient } from "./client";

export interface AnalyticsData {
  keyMetrics: {
    averageScore: number;
    attendanceRate: number;
    tasksCompleted: number;
    activeStudents: number;
  };
  attendanceData: Array<{
    day: string;
    present: number;
    absent: number;
    late: number;
  }>;
  gradeDistribution: Array<{
    grade: string;
    students: number;
    percentage: number;
  }>;
  taskCompletion: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  performanceTrend: Array<{
    month: string;
    average: number;
  }>;
  topPerformers: Array<{
    name: string;
    score: number;
    trend: "up" | "down";
  }>;
  additionalStats: {
    totalAssignments: number;
    avgSubmissionRate: number;
    avgClassSize: number;
    passRate: number;
  };
}

export const analyticsApi = {
  getAnalytics: async (days?: number): Promise<AnalyticsData> => {
    const params = days ? `?days=${days}` : "";
    return apiClient.get<AnalyticsData>(`/analytics${params}`);
  },
};
