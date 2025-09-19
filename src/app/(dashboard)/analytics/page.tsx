'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { TrendingUp, TrendingDown, Users, BookOpen, Award, Calendar } from 'lucide-react'

export default function AnalyticsPage() {
  // Sample data for charts
  const attendanceData = [
    { day: 'Mon', present: 142, absent: 8, late: 4 },
    { day: 'Tue', present: 138, absent: 12, late: 6 },
    { day: 'Wed', present: 145, absent: 5, late: 6 },
    { day: 'Thu', present: 140, absent: 10, late: 6 },
    { day: 'Fri', present: 135, absent: 15, late: 6 },
  ]

  const gradeDistribution = [
    { grade: 'A', students: 45, percentage: 28.8 },
    { grade: 'B', students: 52, percentage: 33.3 },
    { grade: 'C', students: 38, percentage: 24.4 },
    { grade: 'D', students: 15, percentage: 9.6 },
    { grade: 'F', students: 6, percentage: 3.8 },
  ]

  const taskCompletion = [
    { name: 'Completed', value: 78, color: '#10b981' },
    { name: 'Pending', value: 15, color: '#f59e0b' },
    { name: 'Overdue', value: 7, color: '#ef4444' },
  ]

  const performanceTrend = [
    { month: 'Jan', average: 72 },
    { month: 'Feb', average: 75 },
    { month: 'Mar', average: 78 },
    { month: 'Apr', average: 74 },
    { month: 'May', average: 80 },
    { month: 'Jun', average: 82 },
  ]

  const topPerformers = [
    { name: 'Alice Johnson', score: 95, trend: 'up' },
    { name: 'Bob Smith', score: 92, trend: 'up' },
    { name: 'Charlie Brown', score: 90, trend: 'down' },
    { name: 'Diana Prince', score: 88, trend: 'up' },
    { name: 'Ethan Hunt', score: 87, trend: 'up' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-1">Performance insights and trends</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Score</p>
                <p className="text-2xl font-bold">82.5%</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +5.2% from last month
                </p>
              </div>
              <Award className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Attendance Rate</p>
                <p className="text-2xl font-bold">92.3%</p>
                <p className="text-xs text-red-600 flex items-center mt-1">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  -2.1% from last week
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tasks Completed</p>
                <p className="text-2xl font-bold">234</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12 this week
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Students</p>
                <p className="text-2xl font-bold">156</p>
                <p className="text-xs text-gray-600 flex items-center mt-1">
                  <Calendar className="h-3 w-3 mr-1" />
                  This semester
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="present" fill="#10b981" name="Present" />
                <Bar dataKey="absent" fill="#ef4444" name="Absent" />
                <Bar dataKey="late" fill="#f59e0b" name="Late" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Grade Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Grade Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={gradeDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="grade" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="students" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Completion */}
        <Card>
          <CardHeader>
            <CardTitle>Task Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={taskCompletion}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }: any) => `${name}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {taskCompletion.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Average Score Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={performanceTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="average" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPerformers.map((student, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-gray-500">Average: {student.score}%</p>
                    </div>
                  </div>
                  {student.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-600">Total Assignments</p>
              <p className="text-2xl font-bold">45</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg. Submission Rate</p>
              <p className="text-2xl font-bold">87%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg. Class Size</p>
              <p className="text-2xl font-bold">26</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Pass Rate</p>
              <p className="text-2xl font-bold">94%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
