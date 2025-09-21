// lib/permissions/index.ts

export * from "./constants";
export * from "./utils";
export * from "./middleware";

// Re-export commonly used functions for convenience
export {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getUserPermissions,
  getUserWithPermissions,
  assignRoleToUser,
  removeRoleFromUser,
  canAccessResource,
} from "./utils";

export {
  withPermissions,
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  requireAdmin,
  requireResourceAccess,
  requirePermissionWithContext,
} from "./middleware";

export {
  PERMISSIONS,
  PERMISSION_CATEGORIES,
  SYSTEM_ROLES,
  DEFAULT_ROLE_PERMISSIONS,
  PERMISSION_DESCRIPTIONS,
} from "./constants";
