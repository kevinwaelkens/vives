# Tutor Permissions Analysis & Implementation

## Overview

This document analyzes the current implementation of tutor permissions in the school management system and confirms that **tutors can only access students, create tasks, and mark attendance for classes they are assigned to**.

## Data Model Relationships

### Core Relationships
```
User (Tutor) ←→ Group (Many-to-Many via "GroupTutors")
Group ←→ Student (One-to-Many)
Task ←→ Group (Many-to-Many via "GroupTasks")
Attendance → Student (Many-to-One)
Attendance → Group (Many-to-One)
```

### Key Schema Points
- **Users** have a `role` field (ADMIN, TUTOR, VIEWER, PARENT)
- **Groups** can have multiple tutors via the `"GroupTutors"` relation
- **Students** belong to exactly one group via `groupId`
- **Tasks** can be assigned to multiple groups and students
- **Attendance** records link to both student and group

## Current Implementation Status

### ✅ PROPERLY IMPLEMENTED

#### 1. Student Access Control
**API Endpoints:** `/api/students`, `/api/students/[id]`

**Implementation:**
- **GET /api/students**: Tutors only see students from their assigned groups
- **GET /api/students/[id]**: Tutors can only access individual students from their assigned groups
- **POST /api/students**: Tutors can only create students in groups they're assigned to
- **PATCH /api/students/[id]**: Tutors can only update students from their assigned groups

**Code Example:**
```typescript
// Filter students by tutor's assigned groups
if (user.role === 'TUTOR') {
  where.group = {
    tutors: {
      some: {
        id: user.id,
      },
    },
  }
}
```

#### 2. Task Assignment Control
**API Endpoints:** `/api/tasks`

**Implementation:**
- **GET /api/tasks**: Tutors only see tasks from their assigned groups
- **POST /api/tasks**: Tutors can only create tasks for groups they're assigned to
- Validates both group assignments and individual student selections

**Code Example:**
```typescript
// Validate tutor can create tasks for specified groups
if (user.role === 'TUTOR') {
  const tutorGroups = await prisma.group.findMany({
    where: {
      id: { in: groupIds },
      tutors: { some: { id: user.id } },
    },
  })
  
  if (tutorGroups.length !== groupIds.length) {
    return NextResponse.json(
      { error: 'You can only create tasks for groups you are assigned to' },
      { status: 403 }
    )
  }
}
```

#### 3. Attendance Management Control
**API Endpoints:** `/api/attendance`

**Implementation:**
- **GET /api/attendance**: Tutors only see attendance records for their assigned groups
- **POST /api/attendance**: Tutors can only mark attendance for students in their assigned groups

**Code Example:**
```typescript
// Validate tutor can mark attendance for this student
if (user.role === 'TUTOR') {
  const student = await prisma.student.findFirst({
    where: {
      id: validatedData.studentId,
      groupId: validatedData.groupId,
      group: {
        tutors: { some: { id: user.id } },
      },
    },
  })
  
  if (!student) {
    return NextResponse.json(
      { error: 'You can only mark attendance for students in groups you are assigned to' },
      { status: 403 }
    )
  }
}
```

## Test Coverage

### Comprehensive Backend Tests
Created comprehensive test suite in `/tests/tutor-permissions.spec.ts` that verifies:

1. **Student Access Isolation**
   - Tutor1 can only see students from Group1 and shared groups
   - Tutor2 can only see students from Group2 and shared groups
   - Cross-tutor isolation is maintained

2. **Task Assignment Restrictions**
   - Tutors can only create tasks for their assigned groups
   - Tutors cannot create tasks for unassigned groups
   - Individual student selection is validated

3. **Attendance Control**
   - Tutors can only mark attendance for their assigned students
   - Tutors cannot access attendance for unassigned students
   - Viewing attendance is filtered by group assignment

4. **Admin Override**
   - Admins can access all students regardless of group assignment
   - Admin permissions bypass tutor restrictions

### Test Data Structure
```typescript
// Example test setup
tutor1 → group1 (exclusive)
tutor2 → group2 (exclusive)
both tutors → group3 (shared)

students:
- group1: 3 students (accessible to tutor1 only)
- group2: 3 students (accessible to tutor2 only)  
- group3: 3 students (accessible to both tutors)
```

## Security Validation

### ✅ Verified Security Measures

1. **Database-Level Filtering**: All queries include proper WHERE clauses to filter by tutor assignments
2. **Permission Validation**: API endpoints validate permissions before allowing operations
3. **Cross-Tutor Isolation**: Tutors cannot access each other's exclusive groups
4. **Shared Group Support**: Multiple tutors can be assigned to the same group
5. **Admin Override**: Admins maintain full access for management purposes

### Test Results
```bash
🧪 Testing Tutor Permissions System...
✅ Test data created successfully
🔍 Testing student access restrictions...
  ✅ Tutor1 can only see their assigned students
  ✅ Tutor2 can only see their assigned students
🔍 Testing task assignment restrictions...
  ✅ Tutor1 can create tasks for their assigned group
  ✅ Tutor1 cannot create tasks for unassigned groups
🔍 Testing attendance access restrictions...
  ✅ Tutor1 can access their assigned students for attendance
  ✅ Tutor1 cannot access unassigned students for attendance
🎉 All tutor permission tests passed!
```

## API Endpoints Summary

| Endpoint | Method | Tutor Restrictions |
|----------|--------|-------------------|
| `/api/students` | GET | ✅ Only assigned groups |
| `/api/students` | POST | ✅ Only assigned groups |
| `/api/students/[id]` | GET | ✅ Only assigned students |
| `/api/students/[id]` | PATCH | ✅ Only assigned students |
| `/api/tasks` | GET | ✅ Only assigned groups |
| `/api/tasks` | POST | ✅ Only assigned groups |
| `/api/attendance` | GET | ✅ Only assigned groups |
| `/api/attendance` | POST | ✅ Only assigned students |

## Conclusion

**✅ CONFIRMED: The system properly implements tutor permissions**

- Tutors can only access students from classes they are assigned to
- Tutors can only create tasks for their assigned classes
- Tutors can only mark attendance for students in their assigned classes
- Multiple tutors can share the same class
- Admins maintain full access for system management
- All restrictions are enforced at the database query level for security

The implementation follows security best practices by:
1. Filtering data at the database level rather than application level
2. Validating permissions before allowing operations
3. Maintaining proper isolation between tutors
4. Supporting shared group assignments
5. Preserving admin override capabilities

## Running Tests

To verify the permissions system:

```bash
# Run the custom test script
npx tsx scripts/test-tutor-permissions.ts

# Run the comprehensive Playwright tests
npx playwright test tests/tutor-permissions.spec.ts
```
