// lib/permissions/utils.ts

import { prisma } from "@/lib/prisma";
import { PERMISSIONS, SYSTEM_ROLES } from "./constants";
import type { User } from "@prisma/client";

export interface UserWithPermissions extends User {
  userRoles: Array<{
    role: {
      id: string;
      name: string;
      rolePermissions: Array<{
        permission: {
          name: string;
          category: string;
        };
      }>;
    };
    context: any;
  }>;
}

/**
 * Get user with all their roles and permissions
 */
export async function getUserWithPermissions(
  userId: string,
): Promise<UserWithPermissions | null> {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: {
      userRoles: {
        include: {
          role: {
            include: {
              rolePermissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

/**
 * Check if a user has a specific permission
 */
export async function hasPermission(
  userId: string,
  permission: string,
  context?: Record<string, any>,
): Promise<boolean> {
  const user = await getUserWithPermissions(userId);

  if (!user) return false;

  // Admin users have all permissions
  if (user.role === "ADMIN") return true;

  // Check if user has the permission through their roles
  for (const userRole of user.userRoles) {
    const hasPermissionInRole = userRole.role.rolePermissions.some(
      (rp) => rp.permission.name === permission,
    );

    if (hasPermissionInRole) {
      // If context is provided, check if it matches the role context
      if (context && userRole.context) {
        const roleContext = userRole.context as Record<string, any>;
        const contextMatches = Object.keys(context).every(
          (key) => roleContext[key] === context[key],
        );
        if (contextMatches) return true;
      } else if (!context) {
        // No context required, permission granted
        return true;
      }
    }
  }

  return false;
}

/**
 * Check if a user has any of the specified permissions
 */
export async function hasAnyPermission(
  userId: string,
  permissions: string[],
  context?: Record<string, any>,
): Promise<boolean> {
  for (const permission of permissions) {
    if (await hasPermission(userId, permission, context)) {
      return true;
    }
  }
  return false;
}

/**
 * Check if a user has all of the specified permissions
 */
export async function hasAllPermissions(
  userId: string,
  permissions: string[],
  context?: Record<string, any>,
): Promise<boolean> {
  for (const permission of permissions) {
    if (!(await hasPermission(userId, permission, context))) {
      return false;
    }
  }
  return true;
}

/**
 * Get all permissions for a user
 */
export async function getUserPermissions(userId: string): Promise<string[]> {
  const user = await getUserWithPermissions(userId);

  if (!user) return [];

  // Admin users have all permissions
  if (user.role === "ADMIN") {
    return Object.values(PERMISSIONS);
  }

  const permissions = new Set<string>();

  for (const userRole of user.userRoles) {
    for (const rolePermission of userRole.role.rolePermissions) {
      permissions.add(rolePermission.permission.name);
    }
  }

  return Array.from(permissions);
}

/**
 * Assign a role to a user
 */
export async function assignRoleToUser(
  userId: string,
  roleId: string,
  assignedBy?: string,
  context?: Record<string, any>,
  expiresAt?: Date,
) {
  return await prisma.userRole.create({
    data: {
      userId,
      roleId,
      assignedBy,
      context: context || {},
      expiresAt,
    },
  });
}

/**
 * Remove a role from a user
 */
export async function removeRoleFromUser(userId: string, roleId: string) {
  return await prisma.userRole.deleteMany({
    where: {
      userId,
      roleId,
    },
  });
}

/**
 * Get users with a specific permission
 */
export async function getUsersWithPermission(
  permission: string,
): Promise<User[]> {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        // Admin users have all permissions
        { role: "ADMIN" },
        // Users with the specific permission through roles
        {
          userRoles: {
            some: {
              role: {
                rolePermissions: {
                  some: {
                    permission: {
                      name: permission,
                    },
                  },
                },
              },
            },
          },
        },
      ],
    },
  });

  return users;
}

/**
 * Create a new system role with permissions
 */
export async function createSystemRole(
  name: string,
  description: string,
  permissions: string[],
  isDefault = false,
) {
  return await prisma.$transaction(async (tx) => {
    // Create the role
    const role = await tx.systemRole.create({
      data: {
        name,
        description,
        isDefault,
        isSystem: true,
      },
    });

    // Get permission IDs
    const permissionRecords = await tx.permission.findMany({
      where: {
        name: {
          in: permissions,
        },
      },
    });

    // Create role-permission associations
    const rolePermissions = permissionRecords.map((permission) => ({
      roleId: role.id,
      permissionId: permission.id,
    }));

    await tx.rolePermission.createMany({
      data: rolePermissions,
    });

    return role;
  });
}

/**
 * Check if user can access a specific resource based on context
 * This is useful for checking if a user can access specific groups, students, etc.
 */
export async function canAccessResource(
  userId: string,
  permission: string,
  resourceType: string,
  resourceId: string,
): Promise<boolean> {
  const user = await getUserWithPermissions(userId);

  if (!user) return false;

  // Admin users can access everything
  if (user.role === "ADMIN") return true;

  // Check if user has the permission with appropriate context
  for (const userRole of user.userRoles) {
    const hasPermissionInRole = userRole.role.rolePermissions.some(
      (rp) => rp.permission.name === permission,
    );

    if (hasPermissionInRole) {
      const roleContext = userRole.context as Record<string, any>;

      // If no context restrictions, allow access
      if (!roleContext || Object.keys(roleContext).length === 0) {
        return true;
      }

      // Check context-specific access
      switch (resourceType) {
        case "group":
          if (roleContext.groupId === resourceId) return true;
          break;
        case "student":
          // For parents, check if student is their child
          if (
            user.role === "PARENT" &&
            roleContext.studentIds?.includes(resourceId)
          ) {
            return true;
          }
          // For tutors, check if student is in their groups
          if (roleContext.groupId) {
            const student = await prisma.student.findFirst({
              where: {
                id: resourceId,
                groupId: roleContext.groupId,
              },
            });
            if (student) return true;
          }
          break;
      }
    }
  }

  return false;
}

/**
 * Middleware helper to check permissions
 */
export function requirePermission(
  permission: string,
  context?: Record<string, any>,
) {
  return async (userId: string): Promise<boolean> => {
    return await hasPermission(userId, permission, context);
  };
}

/**
 * Middleware helper to check multiple permissions (OR logic)
 */
export function requireAnyPermission(
  permissions: string[],
  context?: Record<string, any>,
) {
  return async (userId: string): Promise<boolean> => {
    return await hasAnyPermission(userId, permissions, context);
  };
}

/**
 * Middleware helper to check multiple permissions (AND logic)
 */
export function requireAllPermissions(
  permissions: string[],
  context?: Record<string, any>,
) {
  return async (userId: string): Promise<boolean> => {
    return await hasAllPermissions(userId, permissions, context);
  };
}
