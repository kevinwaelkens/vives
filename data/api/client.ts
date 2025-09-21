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
        credentials: "include", // Include cookies for authentication
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Request failed" }));
        throw new Error(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        );
      }

      const data = await response.json();
      console.log(`API ${options?.method || "GET"} ${url}:`, data); // Debug logging
      return data;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  async get<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await this.request<T>(url, { ...options, method: "GET" });
    console.log(`API GET ${url}:`, response); // Debug logging
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
