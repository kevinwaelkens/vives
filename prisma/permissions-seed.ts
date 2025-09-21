// prisma/permissions-seed.ts

import { PrismaClient } from "@prisma/client";
import {
  PERMISSIONS,
  PERMISSION_CATEGORIES,
  SYSTEM_ROLES,
  DEFAULT_ROLE_PERMISSIONS,
  PERMISSION_DESCRIPTIONS,
} from "../lib/permissions/constants";

const prisma = new PrismaClient();

export async function seedPermissions() {
  console.log("🔐 Seeding permissions system...");

  try {
    // 1. Create all permissions
    console.log("📝 Creating permissions...");

    const permissionData = Object.entries(PERMISSIONS).map(([key, name]) => ({
      name,
      description: PERMISSION_DESCRIPTIONS[name] || `Permission: ${name}`,
      category: name.split(".")[0], // Extract category from permission name (e.g., 'students' from 'students.view')
    }));

    // Use upsert to avoid duplicates
    for (const permission of permissionData) {
      await prisma.permission.upsert({
        where: { name: permission.name },
        update: {
          description: permission.description,
          category: permission.category,
        },
        create: permission,
      });
    }

    console.log(`✅ Created ${permissionData.length} permissions`);

    // 2. Create system roles
    console.log("👥 Creating system roles...");

    const roleData = [
      {
        name: SYSTEM_ROLES.STUDENT,
        description: "Student role with limited access to own data",
        isDefault: false,
        isSystem: true,
      },
      {
        name: SYSTEM_ROLES.TEACHER,
        description: "Teacher role with access to manage students and classes",
        isDefault: true, // Default role for new users
        isSystem: true,
      },
      {
        name: SYSTEM_ROLES.ADMIN,
        description: "Administrator role with full system access",
        isDefault: false,
        isSystem: true,
      },
      {
        name: SYSTEM_ROLES.PARENT,
        description: "Parent role with access to own children's data",
        isDefault: false,
        isSystem: true,
      },
      {
        name: SYSTEM_ROLES.VIEWER,
        description: "Viewer role with read-only access",
        isDefault: false,
        isSystem: true,
      },
    ];

    const createdRoles: Record<string, string> = {};

    for (const role of roleData) {
      const createdRole = await prisma.systemRole.upsert({
        where: { name: role.name },
        update: {
          description: role.description,
          isDefault: role.isDefault,
        },
        create: role,
      });
      createdRoles[role.name] = createdRole.id;
    }

    console.log(`✅ Created ${roleData.length} system roles`);

    // 3. Assign permissions to roles
    console.log("🔗 Assigning permissions to roles...");

    for (const [roleName, permissions] of Object.entries(
      DEFAULT_ROLE_PERMISSIONS,
    )) {
      const roleId = createdRoles[roleName];

      if (!roleId) {
        console.warn(
          `⚠️  Role ${roleName} not found, skipping permission assignment`,
        );
        continue;
      }

      // Clear existing permissions for this role
      await prisma.rolePermission.deleteMany({
        where: { roleId },
      });

      // Get permission IDs
      const permissionRecords = await prisma.permission.findMany({
        where: {
          name: {
            in: permissions,
          },
        },
      });

      // Create role-permission associations
      const rolePermissions = permissionRecords.map((permission) => ({
        roleId,
        permissionId: permission.id,
      }));

      if (rolePermissions.length > 0) {
        await prisma.rolePermission.createMany({
          data: rolePermissions,
        });
      }

      console.log(
        `✅ Assigned ${rolePermissions.length} permissions to ${roleName}`,
      );
    }

    // 4. Assign default roles to existing users based on their current role
    console.log("👤 Assigning default roles to existing users...");

    const existingUsers = await prisma.user.findMany({
      select: {
        id: true,
        role: true,
        email: true,
      },
    });

    for (const user of existingUsers) {
      // Map old role enum to new system role
      let systemRoleName: string;

      switch (user.role) {
        case "ADMIN":
          systemRoleName = SYSTEM_ROLES.ADMIN;
          break;
        case "TUTOR":
          systemRoleName = SYSTEM_ROLES.TEACHER;
          break;
        case "VIEWER":
          systemRoleName = SYSTEM_ROLES.VIEWER;
          break;
        case "PARENT":
          systemRoleName = SYSTEM_ROLES.PARENT;
          break;
        default:
          systemRoleName = SYSTEM_ROLES.TEACHER; // Default fallback
      }

      const systemRoleId = createdRoles[systemRoleName];

      if (systemRoleId) {
        // Check if user already has this role assigned
        const existingUserRole = await prisma.userRole.findFirst({
          where: {
            userId: user.id,
            roleId: systemRoleId,
          },
        });

        if (!existingUserRole) {
          await prisma.userRole.create({
            data: {
              userId: user.id,
              roleId: systemRoleId,
              context: {}, // No specific context for default assignments
            },
          });

          console.log(
            `✅ Assigned ${systemRoleName} role to user ${user.email}`,
          );
        }
      }
    }

    console.log("🎉 Permissions system seeded successfully!");

    // Print summary
    const totalPermissions = await prisma.permission.count();
    const totalRoles = await prisma.systemRole.count();
    const totalRolePermissions = await prisma.rolePermission.count();
    const totalUserRoles = await prisma.userRole.count();

    console.log("\n📊 Permissions System Summary:");
    console.log(`   Permissions: ${totalPermissions}`);
    console.log(`   System Roles: ${totalRoles}`);
    console.log(`   Role-Permission Associations: ${totalRolePermissions}`);
    console.log(`   User Role Assignments: ${totalUserRoles}`);
  } catch (error) {
    console.error("❌ Error seeding permissions:", error);
    throw error;
  }
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedPermissions()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
