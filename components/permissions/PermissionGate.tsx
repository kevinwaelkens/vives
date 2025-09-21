// components/permissions/PermissionGate.tsx

import React from "react";
import {
  useHasPermission,
  usePermissionChecker,
} from "@/hooks/permissions/usePermissions";

interface PermissionGateProps {
  children: React.ReactNode;
  permission?: string;
  permissions?: string[];
  requireAll?: boolean; // If true, requires ALL permissions; if false, requires ANY
  context?: Record<string, any>;
  fallback?: React.ReactNode;
  loading?: React.ReactNode;
}

/**
 * Component that conditionally renders children based on user permissions
 */
export function PermissionGate({
  children,
  permission,
  permissions,
  requireAll = false,
  context,
  fallback = null,
  loading = null,
}: PermissionGateProps) {
  const checker = usePermissionChecker();
  const { data: hasPermission, isLoading } = useHasPermission(
    permission || "",
    context,
  );

  // Single permission check
  if (permission) {
    if (isLoading) return <>{loading}</>;
    if (!hasPermission) return <>{fallback}</>;
    return <>{children}</>;
  }

  // Multiple permissions check using cached data
  if (permissions) {
    let hasRequiredPermissions: boolean;

    if (requireAll) {
      hasRequiredPermissions = checker.hasAllPermissions(permissions);
    } else {
      hasRequiredPermissions = checker.hasAnyPermission(permissions);
    }

    if (!hasRequiredPermissions) return <>{fallback}</>;
    return <>{children}</>;
  }

  // No permissions specified, render children
  return <>{children}</>;
}

/**
 * Higher-order component version of PermissionGate
 */
export function withPermissions<P extends object>(
  Component: React.ComponentType<P>,
  permissionConfig: Omit<PermissionGateProps, "children">,
) {
  return function PermissionWrappedComponent(props: P) {
    return (
      <PermissionGate {...permissionConfig}>
        <Component {...props} />
      </PermissionGate>
    );
  };
}

/**
 * Hook-based permission check for conditional rendering
 */
export function usePermissionGate(
  permission?: string,
  permissions?: string[],
  requireAll = false,
  context?: Record<string, any>,
) {
  const checker = usePermissionChecker();
  const singlePermissionQuery = useHasPermission(permission || "", context);

  if (permission) {
    return {
      canRender: singlePermissionQuery.data || false,
      isLoading: singlePermissionQuery.isLoading,
    };
  }

  if (permissions) {
    const canRender = requireAll
      ? checker.hasAllPermissions(permissions)
      : checker.hasAnyPermission(permissions);

    return {
      canRender,
      isLoading: false,
    };
  }

  return {
    canRender: true,
    isLoading: false,
  };
}
