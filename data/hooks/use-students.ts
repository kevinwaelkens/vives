import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { studentsApi } from '@/data/api/students'
import type { StudentFilters, StudentFormData } from '@/types'
import { toast } from 'sonner'

// Query keys factory
export const studentKeys = {
  all: ['students'] as const,
  lists: () => [...studentKeys.all, 'list'] as const,
  list: (filters?: StudentFilters) => 
    [...studentKeys.lists(), { filters }] as const,
  details: () => [...studentKeys.all, 'detail'] as const,
  detail: (id: string) => [...studentKeys.details(), id] as const,
}

// Get all students
export function useStudents(filters?: StudentFilters) {
  return useQuery({
    queryKey: studentKeys.list(filters),
    queryFn: () => studentsApi.getStudents(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Get single student
export function useStudent(id: string) {
  return useQuery({
    queryKey: studentKeys.detail(id),
    queryFn: () => studentsApi.getStudent(id),
    enabled: !!id,
  })
}

// Create student
export function useCreateStudent() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: StudentFormData) => studentsApi.createStudent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() })
      toast.success('Student created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create student')
    },
  })
}

// Update student
export function useUpdateStudent() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<StudentFormData> }) =>
      studentsApi.updateStudent(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: studentKeys.detail(variables.id) })
      toast.success('Student updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update student')
    },
  })
}

// Delete student
export function useDeleteStudent() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => studentsApi.deleteStudent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() })
      toast.success('Student deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete student')
    },
  })
}

// Bulk import students
export function useBulkImportStudents() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (file: File) => studentsApi.bulkImport(file),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() })
      toast.success(`Import completed: ${data.success} successful, ${data.failed} failed`)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Import failed')
    },
  })
}

// Export students
export function useExportStudents() {
  return useMutation({
    mutationFn: (filters?: StudentFilters) => studentsApi.exportStudents(filters),
    onSuccess: (blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `students-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success('Export completed')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Export failed')
    },
  })
}
