// lib/permissions/middleware.ts

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/utils";
import { hasPermission, hasAnyPermission, hasAllPermissions } from "./utils";

export interface PermissionCheckOptions {
  permission?: string;
  permissions?: string[];
  requireAll?: boolean; // If true, requires ALL permissions; if false, requires ANY
  context?: Record<string, any>;
  onUnauthorized?: (req: NextRequest) => NextResponse;
}

/**
 * Higher-order function to create permission-checking middleware
 */
export function withPermissions(options: PermissionCheckOptions) {
  return function permissionMiddleware(
    handler: (req: NextRequest, context: any) => Promise<NextResponse>,
  ) {
    return async function (
      req: NextRequest,
      context: any,
    ): Promise<NextResponse> {
      try {
        const user = await getCurrentUser();

        if (!user) {
          return (
            options.onUnauthorized?.(req) ||
            NextResponse.json({ error: "Unauthorized" }, { status: 401 })
          );
        }

        let hasRequiredPermission = false;

        if (options.permission) {
          hasRequiredPermission = await hasPermission(
            user.id,
            options.permission,
            options.context,
          );
        } else if (options.permissions) {
          if (options.requireAll) {
            hasRequiredPermission = await hasAllPermissions(
              user.id,
              options.permissions,
              options.context,
            );
          } else {
            hasRequiredPermission = await hasAnyPermission(
              user.id,
              options.permissions,
              options.context,
            );
          }
        } else {
          // No specific permissions required, just need to be authenticated
          hasRequiredPermission = true;
        }

        if (!hasRequiredPermission) {
          return (
            options.onUnauthorized?.(req) ||
            NextResponse.json(
              { error: "Insufficient permissions" },
              { status: 403 },
            )
          );
        }

        // Add user to request context for use in handler
        const enhancedContext = {
          ...context,
          user,
        };

        return await handler(req, enhancedContext);
      } catch (error) {
        console.error("Permission middleware error:", error);
        return NextResponse.json(
          { error: "Internal server error" },
          { status: 500 },
        );
      }
    };
  };
}

/**
 * Convenience function for single permission check
 */
export function requirePermission(
  permission: string,
  context?: Record<string, any>,
) {
  return withPermissions({ permission, context });
}

/**
 * Convenience function for multiple permissions (ANY)
 */
export function requireAnyPermission(
  permissions: string[],
  context?: Record<string, any>,
) {
  return withPermissions({ permissions, requireAll: false, context });
}

/**
 * Convenience function for multiple permissions (ALL)
 */
export function requireAllPermissions(
  permissions: string[],
  context?: Record<string, any>,
) {
  return withPermissions({ permissions, requireAll: true, context });
}

/**
 * Admin-only middleware
 */
export function requireAdmin() {
  return function adminMiddleware(
    handler: (req: NextRequest, context: any) => Promise<NextResponse>,
  ) {
    return async function (
      req: NextRequest,
      context: any,
    ): Promise<NextResponse> {
      try {
        const user = await getCurrentUser();

        if (!user || user.role !== "ADMIN") {
          return NextResponse.json(
            { error: "Admin access required" },
            { status: 403 },
          );
        }

        const enhancedContext = {
          ...context,
          user,
        };

        return await handler(req, enhancedContext);
      } catch (error) {
        console.error("Admin middleware error:", error);
        return NextResponse.json(
          { error: "Internal server error" },
          { status: 500 },
        );
      }
    };
  };
}

/**
 * Resource-based permission middleware
 * Checks if user can access a specific resource (e.g., group, student)
 */
export function requireResourceAccess(
  permission: string,
  resourceType: string,
  getResourceId: (req: NextRequest, context: any) => string | Promise<string>,
) {
  return function resourceMiddleware(
    handler: (req: NextRequest, context: any) => Promise<NextResponse>,
  ) {
    return async function (
      req: NextRequest,
      context: any,
    ): Promise<NextResponse> {
      try {
        const user = await getCurrentUser();

        if (!user) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const resourceId = await getResourceId(req, context);

        // Import canAccessResource here to avoid circular dependency
        const { canAccessResource } = await import("./utils");

        const canAccess = await canAccessResource(
          user.id,
          permission,
          resourceType,
          resourceId,
        );

        if (!canAccess) {
          return NextResponse.json(
            { error: "Insufficient permissions" },
            { status: 403 },
          );
        }

        const enhancedContext = {
          ...context,
          user,
          resourceId,
        };

        return await handler(req, enhancedContext);
      } catch (error) {
        console.error("Resource access middleware error:", error);
        return NextResponse.json(
          { error: "Internal server error" },
          { status: 500 },
        );
      }
    };
  };
}

/**
 * Context-aware permission middleware
 * Extracts context from request parameters or body
 */
export function requirePermissionWithContext(
  permission: string,
  getContext: (
    req: NextRequest,
    context: any,
  ) => Record<string, any> | Promise<Record<string, any>>,
) {
  return function contextMiddleware(
    handler: (req: NextRequest, context: any) => Promise<NextResponse>,
  ) {
    return async function (
      req: NextRequest,
      context: any,
    ): Promise<NextResponse> {
      try {
        const user = await getCurrentUser();

        if (!user) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const permissionContext = await getContext(req, context);

        const hasRequiredPermission = await hasPermission(
          user.id,
          permission,
          permissionContext,
        );

        if (!hasRequiredPermission) {
          return NextResponse.json(
            { error: "Insufficient permissions" },
            { status: 403 },
          );
        }

        const enhancedContext = {
          ...context,
          user,
          permissionContext,
        };

        return await handler(req, enhancedContext);
      } catch (error) {
        console.error("Context permission middleware error:", error);
        return NextResponse.json(
          { error: "Internal server error" },
          { status: 500 },
        );
      }
    };
  };
}
