import type { ApiResponse, PaginatedResponse } from "@/types";

class ApiClient {
  private baseUrl = "/api";

  private async request<T>(
    url: string,
    options?: RequestInit,
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${url}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Request failed");
      }

      return data;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  async get<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await this.request<T>(url, { ...options, method: "GET" });
    // Handle both ApiResponse format and direct data format
    return (response.data !== undefined ? response.data : response) as T;
  }

  async post<T>(url: string, data?: any, options?: RequestInit): Promise<T> {
    const response = await this.request<T>(url, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    });
    return (response.data !== undefined ? response.data : response) as T;
  }

  async patch<T>(url: string, data?: any, options?: RequestInit): Promise<T> {
    const response = await this.request<T>(url, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return (response.data !== undefined ? response.data : response) as T;
  }

  async put<T>(url: string, data?: any, options?: RequestInit): Promise<T> {
    const response = await this.request<T>(url, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    });
    return (response.data !== undefined ? response.data : response) as T;
  }

  async delete<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await this.request<T>(url, {
      ...options,
      method: "DELETE",
    });
    return response as T;
  }
}

export const apiClient = new ApiClient();
