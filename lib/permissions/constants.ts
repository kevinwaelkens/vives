// lib/permissions/constants.ts

export const PERMISSIONS = {
  // Student Management
  STUDENTS_VIEW: "students.view",
  STUDENTS_CREATE: "students.create",
  STUDENTS_EDIT: "students.edit",
  STUDENTS_DELETE: "students.delete",
  STUDENTS_IMPORT: "students.import",
  STUDENTS_EXPORT: "students.export",

  // Group Management
  GROUPS_VIEW: "groups.view",
  GROUPS_CREATE: "groups.create",
  GROUPS_EDIT: "groups.edit",
  GROUPS_DELETE: "groups.delete",
  GROUPS_ASSIGN_TUTORS: "groups.assign_tutors",

  // Task Management
  TASKS_VIEW: "tasks.view",
  TASKS_CREATE: "tasks.create",
  TASKS_EDIT: "tasks.edit",
  TASKS_DELETE: "tasks.delete",
  TASKS_PUBLISH: "tasks.publish",
  TASKS_ASSIGN: "tasks.assign",

  // Assessment & Grading
  ASSESSMENTS_VIEW: "assessments.view",
  ASSESSMENTS_GRADE: "assessments.grade",
  ASSESSMENTS_COMMENT: "assessments.comment",
  ASSESSMENTS_VIEW_ALL: "assessments.view_all",
  ASSESSMENTS_VIEW_OWN: "assessments.view_own",

  // Attendance
  ATTENDANCE_VIEW: "attendance.view",
  ATTENDANCE_MARK: "attendance.mark",
  ATTENDANCE_EDIT: "attendance.edit",
  ATTENDANCE_REPORTS: "attendance.reports",

  // User Management
  USERS_VIEW: "users.view",
  USERS_CREATE: "users.create",
  USERS_EDIT: "users.edit",
  USERS_DELETE: "users.delete",
  USERS_MANAGE_ROLES: "users.manage_roles",

  // Analytics & Reports
  ANALYTICS_VIEW: "analytics.view",
  ANALYTICS_REPORTS: "analytics.reports",
  ANALYTICS_EXPORT: "analytics.export",

  // CMS & System Administration
  CMS_ACCESS: "cms.access",
  CMS_SYSTEM_SETTINGS: "cms.system_settings",
  CMS_DATABASE: "cms.database",
  CMS_AUDIT_LOGS: "cms.audit_logs",
  CMS_TRANSLATIONS: "cms.translations",
  CMS_TRANSLATIONS_KEYS: "cms.translations.keys",
  CMS_TRANSLATIONS_APPROVE: "cms.translations.approve",

  // Notifications
  NOTIFICATIONS_SEND: "notifications.send",
  NOTIFICATIONS_VIEW: "notifications.view",
  NOTIFICATIONS_MANAGE: "notifications.manage",

  // Bulk Operations
  BULK_IMPORT: "bulk.import",
  BULK_EXPORT: "bulk.export",
  BULK_OPERATIONS: "bulk.operations",
} as const;

export const PERMISSION_CATEGORIES = {
  STUDENTS: "students",
  GROUPS: "groups",
  TASKS: "tasks",
  ASSESSMENTS: "assessments",
  ATTENDANCE: "attendance",
  USERS: "users",
  ANALYTICS: "analytics",
  CMS: "cms",
  NOTIFICATIONS: "notifications",
  BULK: "bulk",
} as const;

export const SYSTEM_ROLES = {
  STUDENT: "STUDENT",
  TEACHER: "TEACHER",
  ADMIN: "ADMIN",
  PARENT: "PARENT",
  VIEWER: "VIEWER",
} as const;

// Default permissions for each role
export const DEFAULT_ROLE_PERMISSIONS = {
  [SYSTEM_ROLES.STUDENT]: [
    PERMISSIONS.ASSESSMENTS_VIEW_OWN,
    PERMISSIONS.TASKS_VIEW,
    PERMISSIONS.ATTENDANCE_VIEW,
    PERMISSIONS.NOTIFICATIONS_VIEW,
  ],

  [SYSTEM_ROLES.TEACHER]: [
    PERMISSIONS.STUDENTS_VIEW,
    PERMISSIONS.STUDENTS_CREATE,
    PERMISSIONS.STUDENTS_EDIT,
    PERMISSIONS.GROUPS_VIEW,
    PERMISSIONS.GROUPS_EDIT,
    PERMISSIONS.TASKS_VIEW,
    PERMISSIONS.TASKS_CREATE,
    PERMISSIONS.TASKS_EDIT,
    PERMISSIONS.TASKS_PUBLISH,
    PERMISSIONS.TASKS_ASSIGN,
    PERMISSIONS.ASSESSMENTS_VIEW,
    PERMISSIONS.ASSESSMENTS_GRADE,
    PERMISSIONS.ASSESSMENTS_COMMENT,
    PERMISSIONS.ATTENDANCE_VIEW,
    PERMISSIONS.ATTENDANCE_MARK,
    PERMISSIONS.ATTENDANCE_EDIT,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.NOTIFICATIONS_SEND,
    PERMISSIONS.NOTIFICATIONS_VIEW,
  ],

  [SYSTEM_ROLES.ADMIN]: [
    // All permissions - will be handled specially in the code
    ...Object.values(PERMISSIONS),
  ],

  [SYSTEM_ROLES.PARENT]: [
    PERMISSIONS.STUDENTS_VIEW, // Limited to own children
    PERMISSIONS.ASSESSMENTS_VIEW_OWN, // Children's assessments
    PERMISSIONS.TASKS_VIEW, // Children's tasks
    PERMISSIONS.ATTENDANCE_VIEW, // Children's attendance
    PERMISSIONS.NOTIFICATIONS_VIEW,
  ],

  [SYSTEM_ROLES.VIEWER]: [
    PERMISSIONS.STUDENTS_VIEW,
    PERMISSIONS.GROUPS_VIEW,
    PERMISSIONS.TASKS_VIEW,
    PERMISSIONS.ASSESSMENTS_VIEW,
    PERMISSIONS.ATTENDANCE_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,
  ],
} as const;

// Permission descriptions for UI
export const PERMISSION_DESCRIPTIONS = {
  [PERMISSIONS.STUDENTS_VIEW]: "View student information and profiles",
  [PERMISSIONS.STUDENTS_CREATE]: "Add new students to the system",
  [PERMISSIONS.STUDENTS_EDIT]: "Edit existing student information",
  [PERMISSIONS.STUDENTS_DELETE]: "Delete or deactivate student accounts",
  [PERMISSIONS.STUDENTS_IMPORT]: "Import students via CSV or bulk operations",
  [PERMISSIONS.STUDENTS_EXPORT]: "Export student data",

  [PERMISSIONS.GROUPS_VIEW]: "View class groups and their information",
  [PERMISSIONS.GROUPS_CREATE]: "Create new class groups",
  [PERMISSIONS.GROUPS_EDIT]: "Edit group information and settings",
  [PERMISSIONS.GROUPS_DELETE]: "Delete class groups",
  [PERMISSIONS.GROUPS_ASSIGN_TUTORS]: "Assign tutors to class groups",

  [PERMISSIONS.TASKS_VIEW]: "View tasks and assignments",
  [PERMISSIONS.TASKS_CREATE]: "Create new tasks and assignments",
  [PERMISSIONS.TASKS_EDIT]: "Edit existing tasks and assignments",
  [PERMISSIONS.TASKS_DELETE]: "Delete tasks and assignments",
  [PERMISSIONS.TASKS_PUBLISH]: "Publish or unpublish tasks",
  [PERMISSIONS.TASKS_ASSIGN]: "Assign tasks to groups or students",

  [PERMISSIONS.ASSESSMENTS_VIEW]: "View assessment results and submissions",
  [PERMISSIONS.ASSESSMENTS_GRADE]: "Grade student submissions",
  [PERMISSIONS.ASSESSMENTS_COMMENT]: "Add comments to assessments",
  [PERMISSIONS.ASSESSMENTS_VIEW_ALL]: "View all students' assessments",
  [PERMISSIONS.ASSESSMENTS_VIEW_OWN]: "View only own assessments",

  [PERMISSIONS.ATTENDANCE_VIEW]: "View attendance records",
  [PERMISSIONS.ATTENDANCE_MARK]: "Mark student attendance",
  [PERMISSIONS.ATTENDANCE_EDIT]: "Edit attendance records",
  [PERMISSIONS.ATTENDANCE_REPORTS]: "Generate attendance reports",

  [PERMISSIONS.USERS_VIEW]: "View user accounts and profiles",
  [PERMISSIONS.USERS_CREATE]: "Create new user accounts",
  [PERMISSIONS.USERS_EDIT]: "Edit user account information",
  [PERMISSIONS.USERS_DELETE]: "Delete user accounts",
  [PERMISSIONS.USERS_MANAGE_ROLES]: "Assign and manage user roles",

  [PERMISSIONS.ANALYTICS_VIEW]: "View analytics dashboard and metrics",
  [PERMISSIONS.ANALYTICS_REPORTS]: "Generate detailed analytics reports",
  [PERMISSIONS.ANALYTICS_EXPORT]: "Export analytics data",

  [PERMISSIONS.CMS_ACCESS]: "Access the Content Management System",
  [PERMISSIONS.CMS_SYSTEM_SETTINGS]: "Modify system settings and configuration",
  [PERMISSIONS.CMS_DATABASE]: "Access database management tools",
  [PERMISSIONS.CMS_AUDIT_LOGS]: "View system audit logs",
  [PERMISSIONS.CMS_TRANSLATIONS]: "Manage translations and localization",
  [PERMISSIONS.CMS_TRANSLATIONS_KEYS]: "Manage translation keys",
  [PERMISSIONS.CMS_TRANSLATIONS_APPROVE]: "Approve translation submissions",

  [PERMISSIONS.NOTIFICATIONS_SEND]: "Send notifications to users",
  [PERMISSIONS.NOTIFICATIONS_VIEW]: "View notifications",
  [PERMISSIONS.NOTIFICATIONS_MANAGE]: "Manage notification settings",

  [PERMISSIONS.BULK_IMPORT]: "Perform bulk import operations",
  [PERMISSIONS.BULK_EXPORT]: "Perform bulk export operations",
  [PERMISSIONS.BULK_OPERATIONS]: "Manage bulk operations",
} as const;
