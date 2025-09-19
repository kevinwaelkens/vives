'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, BookOpen, ClipboardCheck, Calendar } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/data/api/client'

interface DashboardStats {
  totalStudents: number
  totalGroups: number
  totalTasks: number
  pendingAssessments: number
  todayAttendance: {
    present: number
    absent: number
    late: number
    excused: number
  }
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
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
      } as DashboardStats
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to your School Management System</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Active students enrolled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Groups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalGroups}</div>
            <p className="text-xs text-muted-foreground">Active class groups</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalTasks}</div>
            <p className="text-xs text-muted-foreground">Published assignments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Assessments</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingAssessments}</div>
            <p className="text-xs text-muted-foreground">Awaiting grading</p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Attendance */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {stats?.todayAttendance.present}
              </div>
              <p className="text-sm text-gray-600">Present</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {stats?.todayAttendance.absent}
              </div>
              <p className="text-sm text-gray-600">Absent</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {stats?.todayAttendance.late}
              </div>
              <p className="text-sm text-gray-600">Late</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {stats?.todayAttendance.excused}
              </div>
              <p className="text-sm text-gray-600">Excused</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Mathematics Quiz</p>
                  <p className="text-sm text-gray-500">Due: Tomorrow</p>
                </div>
                <span className="text-sm text-gray-500">Grade 10A</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Science Project</p>
                  <p className="text-sm text-gray-500">Due: Next Week</p>
                </div>
                <span className="text-sm text-gray-500">Grade 9B</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">History Essay</p>
                  <p className="text-sm text-gray-500">Due: In 3 days</p>
                </div>
                <span className="text-sm text-gray-500">Grade 11C</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">John Doe</p>
                  <p className="text-sm text-gray-500">English Assignment</p>
                </div>
                <span className="text-sm text-green-600">Submitted</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Jane Smith</p>
                  <p className="text-sm text-gray-500">Math Homework</p>
                </div>
                <span className="text-sm text-green-600">Submitted</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Mike Johnson</p>
                  <p className="text-sm text-gray-500">Physics Lab Report</p>
                </div>
                <span className="text-sm text-yellow-600">Late</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
