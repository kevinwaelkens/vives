# Permissions System Documentation

## Overview

This application implements a comprehensive role-based access control (RBAC) system with fine-grained permissions. The system allows for flexible permission management while maintaining security and ease of use.

## Architecture

### Core Components

1. **Permissions**: Fine-grained actions that can be performed (e.g., `students.view`, `tasks.create`)
2. **System Roles**: Predefined roles with associated permissions (e.g., `STUDENT`, `TEACHER`, `ADMIN`)
3. **User Roles**: Assignment of roles to users with optional context and expiration
4. **Role Permissions**: Many-to-many relationship between roles and permissions

### Database Schema

```sql
-- Permissions define what actions can be performed
Permission {
  id: String (Primary Key)
  name: String (Unique) -- e.g., "students.view"
  description: String
  category: String -- e.g., "students", "tasks"
}

-- System roles are predefined role templates
SystemRole {
  id: String (Primary Key)
  name: String (Unique) -- e.g., "TEACHER"
  description: String
  isDefault: Boolean
  isSystem: Boolean
}

-- Links roles to their permissions
RolePermission {
  roleId: String (Foreign Key)
  permissionId: String (Foreign Key)
}

-- Assigns roles to users with context
UserRole {
  userId: String (Foreign Key)
  roleId: String (Foreign Key)
  context: JSON -- Optional context for scoped permissions
  assignedAt: DateTime
  expiresAt: DateTime (Optional)
}
```

## Available Permissions

### Student Management
- `students.view` - View student information
- `students.create` - Add new students
- `students.edit` - Edit student information
- `students.delete` - Delete/deactivate students
- `students.import` - Bulk import students
- `students.export` - Export student data

### Group Management
- `groups.view` - View groups/classes
- `groups.create` - Create new groups
- `groups.edit` - Edit group information
- `groups.delete` - Delete groups
- `groups.assign_tutors` - Assign tutors to groups

### Task Management
- `tasks.view` - View tasks/assignments
- `tasks.create` - Create new tasks
- `tasks.edit` - Edit tasks
- `tasks.delete` - Delete tasks
- `tasks.publish` - Publish/unpublish tasks
- `tasks.assign` - Assign tasks to groups/students

### Assessment & Grading
- `assessments.view` - View assessments
- `assessments.grade` - Grade student submissions
- `assessments.comment` - Add comments to assessments
- `assessments.view_all` - View all students' assessments
- `assessments.view_own` - View only own assessments

### Attendance
- `attendance.view` - View attendance records
- `attendance.mark` - Mark attendance
- `attendance.edit` - Edit attendance records
- `attendance.reports` - Generate attendance reports

### User Management
- `users.view` - View user accounts
- `users.create` - Create new user accounts
- `users.edit` - Edit user accounts
- `users.delete` - Delete user accounts
- `users.manage_roles` - Assign/change user roles

### Analytics & Reports
- `analytics.view` - View analytics dashboard
- `analytics.reports` - Generate detailed reports
- `analytics.export` - Export analytics data

### CMS & System Administration
- `cms.access` - Access CMS interface
- `cms.system_settings` - Modify system settings
- `cms.database` - Access database management
- `cms.audit_logs` - View audit logs
- `cms.translations` - Manage translations
- `cms.translations.keys` - Manage translation keys
- `cms.translations.approve` - Approve translations

### Notifications
- `notifications.send` - Send notifications
- `notifications.view` - View notifications
- `notifications.manage` - Manage notification settings

### Bulk Operations
- `bulk.import` - Perform bulk imports
- `bulk.export` - Perform bulk exports
- `bulk.operations` - Manage bulk operations

## Default Roles

### STUDENT
- `assessments.view_own`
- `tasks.view` (own assigned tasks)
- `attendance.view` (own attendance)
- `notifications.view`

### TEACHER
- `students.view`, `students.create`, `students.edit`
- `groups.view`, `groups.edit` (assigned groups only)
- `tasks.view`, `tasks.create`, `tasks.edit`, `tasks.publish`, `tasks.assign`
- `assessments.view`, `assessments.grade`, `assessments.comment`
- `attendance.view`, `attendance.mark`, `attendance.edit`
- `analytics.view`
- `notifications.send`, `notifications.view`

### ADMIN
- All permissions (full system access)

### PARENT
- `students.view` (own children only)
- `assessments.view_own` (children's assessments)
- `tasks.view` (children's tasks)
- `attendance.view` (children's attendance)
- `notifications.view`

### VIEWER
- `students.view`, `groups.view`, `tasks.view`
- `assessments.view`, `attendance.view`
- `analytics.view`

## Usage Examples

### Backend API Routes

#### Using Middleware

```typescript
import { requirePermission, PERMISSIONS } from '@/lib/permissions';

// Single permission
export const GET = requirePermission(PERMISSIONS.STUDENTS_VIEW)(
  async function (req: NextRequest, { user }: { user: any }) {
    // Handler code here
    // user is automatically injected by middleware
  }
);

// Multiple permissions (ANY)
export const POST = requireAnyPermission([
  PERMISSIONS.STUDENTS_CREATE,
  PERMISSIONS.STUDENTS_IMPORT
])(
  async function (req: NextRequest, { user }: { user: any }) {
    // Handler code here
  }
);

// Admin only
export const DELETE = requireAdmin()(
  async function (req: NextRequest, { user }: { user: any }) {
    // Handler code here
  }
);
```

#### Resource-Based Permissions

```typescript
import { requireResourceAccess, PERMISSIONS } from '@/lib/permissions';

// Check if user can access specific group
export const GET = requireResourceAccess(
  PERMISSIONS.GROUPS_VIEW,
  'group',
  async (req, { params }) => {
    const { groupId } = await params;
    return groupId;
  }
)(
  async function (req: NextRequest, { user, resourceId }: any) {
    // User can access this specific group
  }
);
```

#### Manual Permission Checks

```typescript
import { hasPermission, canAccessResource } from '@/lib/permissions';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  
  // Check single permission
  if (await hasPermission(user.id, PERMISSIONS.STUDENTS_VIEW)) {
    // User has permission
  }
  
  // Check resource access
  if (await canAccessResource(user.id, PERMISSIONS.STUDENTS_VIEW, 'group', groupId)) {
    // User can view students in this specific group
  }
}
```

### Frontend Components

#### Permission Gate Component

```tsx
import { PermissionGate } from '@/components/permissions';
import { PERMISSIONS } from '@/lib/permissions';

function StudentManagement() {
  return (
    <div>
      <PermissionGate 
        permission={PERMISSIONS.STUDENTS_VIEW}
        fallback={<div>You don't have permission to view students</div>}
      >
        <StudentList />
      </PermissionGate>
      
      <PermissionGate 
        permissions={[PERMISSIONS.STUDENTS_CREATE, PERMISSIONS.STUDENTS_IMPORT]}
        requireAll={false} // ANY permission
      >
        <CreateStudentButton />
      </PermissionGate>
    </div>
  );
}
```

#### Using Hooks

```tsx
import { usePermissionChecker, useHasPermission } from '@/hooks/permissions/usePermissions';
import { PERMISSIONS } from '@/lib/permissions';

function StudentActions() {
  const checker = usePermissionChecker();
  const { data: canEdit } = useHasPermission(PERMISSIONS.STUDENTS_EDIT);
  
  return (
    <div>
      {checker.hasPermission(PERMISSIONS.STUDENTS_VIEW) && (
        <ViewStudentButton />
      )}
      
      {canEdit && (
        <EditStudentButton />
      )}
      
      {checker.hasRole('ADMIN') && (
        <AdminOnlyFeature />
      )}
    </div>
  );
}
```

### Permission Management

#### Assigning Roles to Users

```typescript
import { assignRoleToUser, removeRoleFromUser } from '@/lib/permissions';

// Assign teacher role to user for specific group
await assignRoleToUser(
  userId,
  teacherRoleId,
  adminUserId, // who assigned it
  { groupId: 'specific-group-id' }, // context
  new Date('2024-12-31') // expiration (optional)
);

// Remove role
await removeRoleFromUser(userId, roleId);
```

#### Creating Custom Roles

```typescript
import { createSystemRole, PERMISSIONS } from '@/lib/permissions';

const customRole = await createSystemRole(
  'DEPARTMENT_HEAD',
  'Department head with extended permissions',
  [
    PERMISSIONS.STUDENTS_VIEW,
    PERMISSIONS.STUDENTS_EDIT,
    PERMISSIONS.TEACHERS_MANAGE,
    PERMISSIONS.ANALYTICS_VIEW,
  ]
);
```

## Context-Based Permissions

The system supports context-based permissions for fine-grained access control:

### Group-Scoped Permissions
```typescript
// Teacher can only manage students in their assigned groups
const userRole = {
  userId: 'teacher-id',
  roleId: 'teacher-role-id',
  context: { groupId: 'group-123' }
};
```

### Parent-Child Relationships
```typescript
// Parent can only view their own children's data
const parentRole = {
  userId: 'parent-id',
  roleId: 'parent-role-id',
  context: { studentIds: ['child1-id', 'child2-id'] }
};
```

## Security Considerations

1. **Admin Override**: Admin users automatically have all permissions
2. **Context Validation**: Always validate context when checking permissions
3. **Expiration**: Roles can have expiration dates for temporary access
4. **Audit Logging**: All permission changes should be logged
5. **Caching**: Permission checks are cached for performance

## Migration Guide

### From Old Role System

The new system is backward compatible with the existing `User.role` field:

1. Existing users will automatically get appropriate system roles assigned during seeding
2. Old role checks (`user.role === 'ADMIN'`) will continue to work
3. Gradually migrate to permission-based checks for better granularity

### Database Migration

Run the following to set up the permissions system:

```bash
# Generate Prisma client with new schema
npx prisma generate

# Run database migration
npx prisma db push

# Seed permissions and roles
npx prisma db seed
```

## Best Practices

1. **Use Specific Permissions**: Prefer specific permissions over broad role checks
2. **Context Awareness**: Always consider context when checking permissions
3. **Frontend Guards**: Use PermissionGate components for UI elements
4. **Backend Validation**: Always validate permissions on the server side
5. **Caching**: Leverage React Query caching for performance
6. **Error Handling**: Provide meaningful error messages for permission failures

## Troubleshooting

### Common Issues

1. **Permission Not Found**: Ensure permission is defined in constants and seeded
2. **Context Mismatch**: Verify context structure matches expected format
3. **Cache Issues**: Clear React Query cache if permissions seem stale
4. **Migration Errors**: Check database constraints and foreign keys

### Debugging

```typescript
// Check user's current permissions
const permissions = await getUserPermissions(userId);
console.log('User permissions:', permissions);

// Check specific permission with context
const hasAccess = await hasPermission(userId, 'students.view', { groupId: '123' });
console.log('Has access:', hasAccess);
```
