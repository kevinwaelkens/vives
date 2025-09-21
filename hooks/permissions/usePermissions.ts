// hooks/permissions/usePermissions.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

interface UserPermissions {
  permissions: string[];
  roles: Array<{
    id: string;
    name: string;
    context: Record<string, any>;
    assignedAt: string;
    expiresAt?: string;
  }>;
}

interface PermissionCheckResult {
  [permission: string]: boolean;
}

/**
 * Hook to get current user's permissions
 */
export function usePermissions() {
  const { data: session } = useSession();

  return useQuery<UserPermissions>({
    queryKey: ["permissions", session?.user?.id],
    queryFn: async () => {
      const response = await fetch("/api/permissions");
      if (!response.ok) {
        throw new Error("Failed to fetch permissions");
      }
      const result = await response.json();
      return result.data;
    },
    enabled: !!session?.user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to check if user has specific permissions
 */
export function usePermissionCheck() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation<
    PermissionCheckResult,
    Error,
    { permissions: string[]; context?: Record<string, any> }
  >({
    mutationFn: async ({ permissions, context }) => {
      const response = await fetch("/api/permissions/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ permissions, context }),
      });

      if (!response.ok) {
        throw new Error("Failed to check permissions");
      }

      const result = await response.json();
      return result.data;
    },
    onSuccess: (data, variables) => {
      // Cache individual permission results
      Object.entries(data).forEach(([permission, hasPermission]) => {
        queryClient.setQueryData(
          ["permission", session?.user?.id, permission, variables.context],
          hasPermission,
        );
      });
    },
  });
}

/**
 * Hook to check a single permission
 */
export function useHasPermission(
  permission: string,
  context?: Record<string, any>,
) {
  const { data: session } = useSession();

  return useQuery<boolean>({
    queryKey: ["permission", session?.user?.id, permission, context],
    queryFn: async () => {
      const response = await fetch("/api/permissions/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ permissions: [permission], context }),
      });

      if (!response.ok) {
        throw new Error("Failed to check permission");
      }

      const result = await response.json();
      return result.data[permission] || false;
    },
    enabled: !!session?.user && !!permission,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook that returns a function to check permissions synchronously
 * Uses cached data from usePermissions
 */
export function usePermissionChecker() {
  const { data: permissions } = usePermissions();

  return {
    hasPermission: (permission: string): boolean => {
      return permissions?.permissions.includes(permission) || false;
    },
    hasAnyPermission: (permissionList: string[]): boolean => {
      return (
        permissionList.some((p) => permissions?.permissions.includes(p)) ||
        false
      );
    },
    hasAllPermissions: (permissionList: string[]): boolean => {
      return (
        permissionList.every((p) => permissions?.permissions.includes(p)) ||
        false
      );
    },
    hasRole: (roleName: string): boolean => {
      return permissions?.roles.some((role) => role.name === roleName) || false;
    },
    getRoleContext: (roleName: string): Record<string, any> | null => {
      const role = permissions?.roles.find((role) => role.name === roleName);
      return role?.context || null;
    },
  };
}
