import { apiClient } from "./client";
import type { Role } from "@prisma/client";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithRelations extends User {
  groups?: Array<{
    id: string;
    name: string;
    code: string;
  }>;
  _count?: {
    auditLogs: number;
    comments: number;
    notifications: number;
  };
}

export interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface UserUpdateData {
  name?: string;
  email?: string;
  password?: string;
  role?: Role;
  isActive?: boolean;
}

export interface UserFilters {
  role?: Role;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const usersApi = {
  getUsers: async (filters?: UserFilters): Promise<PaginatedResponse<User>> => {
    const params = new URLSearchParams();

    if (filters?.role) params.append("role", filters.role);
    if (filters?.search) params.append("search", filters.search);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.pageSize)
      params.append("pageSize", filters.pageSize.toString());

    const queryString = params.toString();
    const url = `/users${queryString ? `?${queryString}` : ""}`;

    return apiClient.get<PaginatedResponse<User>>(url);
  },

  getUser: async (id: string): Promise<UserWithRelations> => {
    return apiClient.get<UserWithRelations>(`/users/${id}`);
  },

  createUser: async (data: UserFormData): Promise<User> => {
    return apiClient.post<User>("/users", data);
  },

  updateUser: async (id: string, data: UserUpdateData): Promise<User> => {
    return apiClient.patch<User>(`/users/${id}`, data);
  },

  deleteUser: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/users/${id}`);
  },
};
