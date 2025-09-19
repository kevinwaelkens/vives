'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  MessageSquare,
  Award,
  TrendingUp,
  User,
  Calendar,
} from 'lucide-react'
import { apiClient } from '@/data/api/client'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'

interface Assessment {
  id: string
  taskId: string
  studentId: string
  score?: number
  grade?: string
  feedback?: string
  status: string
  submittedAt?: string
  gradedAt?: string
  task: {
    title: string
    type: string
    points: number
  }
  student: {
    name: string
    studentId: string
    email: string
  }
}

export default function AssessmentsPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [gradingAssessment, setGradingAssessment] = useState<Assessment | null>(null)
  const [gradeData, setGradeData] = useState({
    score: 0,
    grade: '',
    feedback: '',
  })

  const queryClient = useQueryClient()

  const { data: assessments, isLoading } = useQuery({
    queryKey: ['assessments', selectedStatus],
    queryFn: async () => {
      const params = selectedStatus !== 'all' ? `?status=${selectedStatus}` : ''
      return apiClient.get<Assessment[]>(`/assessments${params}`)
    },
  })

  const gradeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof gradeData }) => {
      return apiClient.patch(`/assessments/${id}`, {
        ...data,
        status: 'GRADED',
        gradedAt: new Date().toISOString(),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] })
      toast.success('Assessment graded successfully')
      setGradingAssessment(null)
      setGradeData({ score: 0, grade: '', feedback: '' })
    },
    onError: () => {
      toast.error('Failed to grade assessment')
    },
  })

  const handleGrade = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!gradingAssessment) return
    await gradeMutation.mutateAsync({
      id: gradingAssessment.id,
      data: gradeData,
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'GRADED':
        return 'bg-green-100 text-green-700'
      case 'SUBMITTED':
        return 'bg-blue-100 text-blue-700'
      case 'LATE_SUBMITTED':
        return 'bg-yellow-100 text-yellow-700'
      case 'NOT_SUBMITTED':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'GRADED':
        return <CheckCircle className="h-4 w-4" />
      case 'SUBMITTED':
        return <Clock className="h-4 w-4" />
      case 'LATE_SUBMITTED':
        return <AlertCircle className="h-4 w-4" />
      case 'NOT_SUBMITTED':
        return <XCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading assessments...</div>
      </div>
    )
  }

  const assessmentList = assessments || []
  const stats = {
    total: assessmentList.length,
    graded: assessmentList.filter((a: Assessment) => a.status === 'GRADED').length,
    submitted: assessmentList.filter((a: Assessment) => a.status === 'SUBMITTED').length,
    late: assessmentList.filter((a: Assessment) => a.status === 'LATE_SUBMITTED').length,
    notSubmitted: assessmentList.filter((a: Assessment) => a.status === 'NOT_SUBMITTED').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Assessments</h1>
        <p className="text-gray-600 mt-1">Grade student submissions and provide feedback</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Graded</p>
                <p className="text-2xl font-bold">{stats.graded}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{stats.submitted}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Late</p>
                <p className="text-2xl font-bold">{stats.late}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Missing</p>
                <p className="text-2xl font-bold">{stats.notSubmitted}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <Button
          variant={selectedStatus === 'all' ? 'default' : 'outline'}
          onClick={() => setSelectedStatus('all')}
        >
          All
        </Button>
        <Button
          variant={selectedStatus === 'SUBMITTED' ? 'default' : 'outline'}
          onClick={() => setSelectedStatus('SUBMITTED')}
        >
          To Grade
        </Button>
        <Button
          variant={selectedStatus === 'GRADED' ? 'default' : 'outline'}
          onClick={() => setSelectedStatus('GRADED')}
        >
          Graded
        </Button>
        <Button
          variant={selectedStatus === 'NOT_SUBMITTED' ? 'default' : 'outline'}
          onClick={() => setSelectedStatus('NOT_SUBMITTED')}
        >
          Not Submitted
        </Button>
      </div>

      {/* Grading Form */}
      {gradingAssessment && (
        <Card>
          <CardHeader>
            <CardTitle>Grade Assessment</CardTitle>
            <p className="text-sm text-gray-600">
              {gradingAssessment.student.name} - {gradingAssessment.task.title}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGrade} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="score">Score</Label>
                  <Input
                    id="score"
                    type="number"
                    min="0"
                    max={gradingAssessment.task.points}
                    value={gradeData.score}
                    onChange={(e) => setGradeData({ ...gradeData, score: parseInt(e.target.value) })}
                    placeholder={`Out of ${gradingAssessment.task.points}`}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="grade">Grade</Label>
                  <select
                    id="grade"
                    value={gradeData.grade}
                    onChange={(e) => setGradeData({ ...gradeData, grade: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Grade</option>
                    <option value="A+">A+</option>
                    <option value="A">A</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B">B</option>
                    <option value="B-">B-</option>
                    <option value="C+">C+</option>
                    <option value="C">C</option>
                    <option value="C-">C-</option>
                    <option value="D">D</option>
                    <option value="F">F</option>
                  </select>
                </div>
              </div>
              <div>
                <Label htmlFor="feedback">Feedback</Label>
                <textarea
                  id="feedback"
                  value={gradeData.feedback}
                  onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                  className="w-full h-24 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Provide feedback for the student"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Submit Grade</Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setGradingAssessment(null)
                    setGradeData({ score: 0, grade: '', feedback: '' })
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Assessments List */}
      <Card>
        <CardHeader>
          <CardTitle>All Assessments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium text-gray-700">Student</th>
                  <th className="text-left p-4 font-medium text-gray-700">Task</th>
                  <th className="text-left p-4 font-medium text-gray-700">Type</th>
                  <th className="text-left p-4 font-medium text-gray-700">Status</th>
                  <th className="text-left p-4 font-medium text-gray-700">Score</th>
                  <th className="text-left p-4 font-medium text-gray-700">Grade</th>
                  <th className="text-left p-4 font-medium text-gray-700">Submitted</th>
                  <th className="text-left p-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assessmentList.map((assessment: Assessment) => (
                  <tr key={assessment.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{assessment.student.name}</p>
                        <p className="text-sm text-gray-500">{assessment.student.studentId}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-medium">{assessment.task.title}</p>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-gray-600">{assessment.task.type}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 w-fit ${getStatusColor(assessment.status)}`}>
                        {getStatusIcon(assessment.status)}
                        {assessment.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      {assessment.score !== null ? (
                        <span className="font-medium">
                          {assessment.score}/{assessment.task.points}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      {assessment.grade ? (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium">
                          {assessment.grade}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      {assessment.submittedAt ? (
                        <div className="text-sm text-gray-600">
                          <Calendar className="h-4 w-4 inline mr-1" />
                          {formatDate(assessment.submittedAt)}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      {assessment.status === 'SUBMITTED' || assessment.status === 'LATE_SUBMITTED' ? (
                        <Button
                          size="sm"
                          onClick={() => {
                            setGradingAssessment(assessment)
                            setGradeData({
                              score: assessment.score || 0,
                              grade: assessment.grade || '',
                              feedback: assessment.feedback || '',
                            })
                          }}
                        >
                          Grade
                        </Button>
                      ) : assessment.status === 'GRADED' ? (
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                      ) : (
                        <span className="text-gray-400 text-sm">No submission</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {assessmentList.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No assessments found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
