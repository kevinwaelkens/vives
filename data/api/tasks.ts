import { apiClient } from "./client";
import type { Task, TaskWithRelations, PaginatedResponse } from "@/types";

export const tasksApi = {
  getTasks: async (params?: {
    groupId?: string;
    type?: string;
    isPublished?: boolean;
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<TaskWithRelations>> => {
    const searchParams = new URLSearchParams();
    if (params?.groupId) searchParams.append("groupId", params.groupId);
    if (params?.type) searchParams.append("type", params.type);
    if (params?.isPublished !== undefined)
      searchParams.append("isPublished", params.isPublished.toString());
    if (params?.search) searchParams.append("search", params.search);
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.pageSize)
      searchParams.append("pageSize", params.pageSize.toString());

    const url = `/tasks${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
    return apiClient.get<PaginatedResponse<TaskWithRelations>>(url);
  },

  getTask: async (id: string): Promise<TaskWithRelations> => {
    return apiClient.get<TaskWithRelations>(`/tasks/${id}`);
  },

  createTask: async (
    data: Partial<Task> & { groupIds: string[]; studentIds?: string[] },
  ): Promise<Task> => {
    return apiClient.post<Task>("/tasks", data);
  },

  updateTask: async (id: string, data: Partial<Task>): Promise<Task> => {
    return apiClient.patch<Task>(`/tasks/${id}`, data);
  },

  deleteTask: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/tasks/${id}`);
  },
};
