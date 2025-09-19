'use client'

import { useState } from 'react'
import { useStudents, useCreateStudent, useUpdateStudent, useDeleteStudent } from '@/data/hooks/use-students'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Mail,
  Calendar,
  UserCheck,
  X,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { StudentFormData, StudentWithRelations } from '@/types'

export default function StudentsPage() {
  const [search, setSearch] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingStudent, setEditingStudent] = useState<StudentWithRelations | null>(null)
  const [formData, setFormData] = useState<Partial<StudentFormData>>({
    name: '',
    email: '',
    groupId: '',
    notes: '',
  })

  const { data, isLoading } = useStudents({ search })
  const createMutation = useCreateStudent()
  const updateMutation = useUpdateStudent()
  const deleteMutation = useDeleteStudent()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingStudent) {
      await updateMutation.mutateAsync({
        id: editingStudent.id,
        data: formData as StudentFormData,
      })
      setEditingStudent(null)
    } else {
      await createMutation.mutateAsync(formData as StudentFormData)
      setShowAddForm(false)
    }
    
    setFormData({ name: '', email: '', groupId: '', notes: '' })
  }

  const handleEdit = (student: StudentWithRelations) => {
    setEditingStudent(student)
    setFormData({
      name: student.name,
      email: student.email,
      groupId: student.groupId,
      notes: student.notes || '',
    })
    setShowAddForm(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      await deleteMutation.mutateAsync(id)
    }
  }

  const handleCancel = () => {
    setShowAddForm(false)
    setEditingStudent(null)
    setFormData({ name: '', email: '', groupId: '', notes: '' })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading students...</div>
      </div>
    )
  }

  const students = data?.data || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-600 mt-1">Manage student records and information</p>
        </div>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Student
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search students by name, email, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingStudent ? 'Edit Student' : 'Add New Student'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="groupId">Group</Label>
                  <select
                    id="groupId"
                    value={formData.groupId}
                    onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a group</option>
                    <option value="clxxx1">Class 10A</option>
                    <option value="clxxx2">Class 10B</option>
                    <option value="clxxx3">Class 9A</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  {editingStudent ? 'Update' : 'Create'} Student
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-2xl font-bold">{students.length}</p>
              </div>
              <UserCheck className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold">
                  {students.filter(s => s.status === 'ACTIVE').length}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inactive</p>
                <p className="text-2xl font-bold">
                  {students.filter(s => s.status === 'INACTIVE').length}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Groups</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">G</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students List */}
      <Card>
        <CardHeader>
          <CardTitle>All Students</CardTitle>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No students found. Add your first student to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium text-gray-700">Name</th>
                    <th className="text-left p-4 font-medium text-gray-700">Student ID</th>
                    <th className="text-left p-4 font-medium text-gray-700">Email</th>
                    <th className="text-left p-4 font-medium text-gray-700">Group</th>
                    <th className="text-left p-4 font-medium text-gray-700">Status</th>
                    <th className="text-left p-4 font-medium text-gray-700">Enrolled</th>
                    <th className="text-left p-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div className="font-medium">{student.name}</div>
                      </td>
                      <td className="p-4 text-gray-600">{student.studentId}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Mail className="h-4 w-4" />
                          {student.email}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                          {student.group?.name || 'Unassigned'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-sm ${
                          student.status === 'ACTIVE' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          {formatDate(student.enrolledAt)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(student)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(student.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
