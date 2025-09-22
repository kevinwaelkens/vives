// src/app/api/permissions/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/utils";
import {
  getUserPermissions,
  getUserWithPermissions,
  PERMISSIONS,
  SYSTEM_ROLES,
} from "@/lib/permissions";
import { requireAdmin } from "@/lib/permissions/middleware";

// GET /api/permissions - Get current user's permissions
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const permissions = await getUserPermissions(user.id);
    const userWithRoles = await getUserWithPermissions(user.id);

    return NextResponse.json({
      data: {
        permissions,
        roles:
          userWithRoles?.userRoles.map((ur) => ({
            id: ur.role.id,
            name: ur.role.name,
            context: ur.context,
          })) || [],
      },
    });
  } catch (error) {
    console.error("Error fetching user permissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch permissions" },
      { status: 500 },
    );
  }
}

// POST /api/permissions/check - Check if user has specific permissions
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { permissions: permissionsToCheck, context } = body;

    if (!Array.isArray(permissionsToCheck)) {
      return NextResponse.json(
        { error: "Permissions must be an array" },
        { status: 400 },
      );
    }

    const { hasPermission } = await import("@/lib/permissions");

    const results: Record<string, boolean> = {};

    for (const permission of permissionsToCheck) {
      results[permission] = await hasPermission(user.id, permission, context);
    }

    return NextResponse.json({ data: results });
  } catch (error) {
    console.error("Error checking permissions:", error);
    return NextResponse.json(
      { error: "Failed to check permissions" },
      { status: 500 },
    );
  }
}
