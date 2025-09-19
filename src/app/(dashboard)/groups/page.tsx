'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Users, BookOpen, Calendar, Edit2, Trash2, Plus } from 'lucide-react'
import { apiClient } from '@/data/api/client'
import { toast } from 'sonner'

interface Group {
  id: string
  name: string
  code: string
  academicYear: string
  grade: string
  tutors: any[]
  _count: {
    students: number
    tasks: number
  }
}

export default function GroupsPage() {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    academicYear: '2024',
    grade: '',
  })

  const queryClient = useQueryClient()

  const { data: groups, isLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const response = await apiClient.get<{ data: Group[] }>('/groups')
      return response.data
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiClient.post('/groups', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
      toast.success('Group created successfully')
      setShowAddForm(false)
      setFormData({ name: '', code: '', academicYear: '2024', grade: '' })
    },
    onError: () => {
      toast.error('Failed to create group')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiClient.delete(`/groups/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
      toast.success('Group deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete group')
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await createMutation.mutateAsync(formData)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this group?')) {
      await deleteMutation.mutateAsync(id)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading groups...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Groups</h1>
          <p className="text-gray-600 mt-1">Manage class groups and assignments</p>
        </div>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Group
        </Button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Group</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Group Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Class 10A"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="code">Group Code</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g., CLS10A"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="grade">Grade</Label>
                  <Input
                    id="grade"
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    placeholder="e.g., 10"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="academicYear">Academic Year</Label>
                  <Input
                    id="academicYear"
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    placeholder="e.g., 2024"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Create Group</Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowAddForm(false)
                    setFormData({ name: '', code: '', academicYear: '2024', grade: '' })
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups?.map((group) => (
          <Card key={group.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{group.name}</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">Code: {group.code}</p>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingGroup(group)
                      setFormData({
                        name: group.name,
                        code: group.code,
                        academicYear: group.academicYear,
                        grade: group.grade,
                      })
                      setShowAddForm(true)
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(group.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Academic Year: {group.academicYear}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <BookOpen className="h-4 w-4" />
                  <span className="text-sm">Grade: {group.grade}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">{group._count.students} Students</span>
                </div>
                <div className="pt-3 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Active Tasks:</span>
                    <span className="font-medium">{group._count.tasks}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-500">Tutors:</span>
                    <span className="font-medium">{group.tutors.length}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!groups || groups.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No groups found. Create your first group to get started.</p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
