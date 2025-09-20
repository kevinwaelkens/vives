import { apiClient } from "./client";
import type {
  Student,
  StudentWithRelations,
  StudentFormData,
  StudentFilters,
  PaginatedResponse,
} from "@/types";

export const studentsApi = {
  // Get all students with pagination and filters
  getStudents: async (
    filters?: StudentFilters,
  ): Promise<PaginatedResponse<StudentWithRelations>> => {
    const params = new URLSearchParams();

    if (filters?.groupId) params.append("groupId", filters.groupId);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.search) params.append("search", filters.search);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.pageSize)
      params.append("pageSize", filters.pageSize.toString());

    const queryString = params.toString();
    const url = `/students${queryString ? `?${queryString}` : ""}`;

    const response =
      await apiClient.get<PaginatedResponse<StudentWithRelations>>(url);
    // The API client now returns the response directly
    return response;
  },

  // Get a single student by ID
  getStudent: async (id: string): Promise<StudentWithRelations> => {
    return apiClient.get<StudentWithRelations>(`/students/${id}`);
  },

  // Create a new student
  createStudent: async (data: StudentFormData): Promise<Student> => {
    return apiClient.post<Student>("/students", data);
  },

  // Update a student
  updateStudent: async (
    id: string,
    data: Partial<StudentFormData>,
  ): Promise<Student> => {
    return apiClient.patch<Student>(`/students/${id}`, data);
  },

  // Delete a student
  deleteStudent: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/students/${id}`);
  },

  // Bulk import students
  bulkImport: async (
    file: File,
  ): Promise<{
    success: number;
    failed: number;
    errors: any[];
  }> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/bulk/students/import", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Import failed");
    }

    return response.json();
  },

  // Export students to CSV
  exportStudents: async (filters?: StudentFilters): Promise<Blob> => {
    const params = new URLSearchParams();

    if (filters?.groupId) params.append("groupId", filters.groupId);
    if (filters?.status) params.append("status", filters.status);

    const response = await fetch(`/api/students/export?${params.toString()}`);

    if (!response.ok) {
      throw new Error("Export failed");
    }

    return response.blob();
  },
};
