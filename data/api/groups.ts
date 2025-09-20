import { apiClient } from "./client";
import type { Group, GroupWithRelations } from "@/types";

export interface GroupFilters {
  academicYear?: string;
  grade?: string;
  isActive?: boolean;
  search?: string;
}

export const groupsApi = {
  // Get all groups with filters
  getGroups: async (filters?: GroupFilters): Promise<Group[]> => {
    const params = new URLSearchParams();

    if (filters?.academicYear)
      params.append("academicYear", filters.academicYear);
    if (filters?.grade) params.append("grade", filters.grade);
    if (filters?.isActive !== undefined)
      params.append("isActive", filters.isActive.toString());
    if (filters?.search) params.append("search", filters.search);

    const queryString = params.toString();
    const url = `/groups${queryString ? `?${queryString}` : ""}`;

    const response = await apiClient.get<{ data: Group[] }>(url);
    // Handle both direct array and wrapped response
    return Array.isArray(response) ? response : response.data || [];
  },

  // Get a single group by ID
  getGroup: async (id: string): Promise<GroupWithRelations> => {
    return apiClient.get<GroupWithRelations>(`/groups/${id}`);
  },

  // Create a new group
  createGroup: async (data: {
    name: string;
    code: string;
    academicYear: string;
    grade: string;
    tutorIds?: string[];
  }): Promise<Group> => {
    return apiClient.post<Group>("/groups", data);
  },

  // Update a group
  updateGroup: async (
    id: string,
    data: Partial<{
      name: string;
      code: string;
      academicYear: string;
      grade: string;
      tutorIds?: string[];
    }>,
  ): Promise<Group> => {
    return apiClient.patch<Group>(`/groups/${id}`, data);
  },

  // Delete a group
  deleteGroup: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/groups/${id}`);
  },
};
