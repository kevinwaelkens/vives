import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Test data setup
let testData: {
  tutor1: { id: string; email: string };
  tutor2: { id: string; email: string };
  admin: { id: string; email: string };
  group1: { id: string; name: string };
  group2: { id: string; name: string };
  group3: { id: string; name: string }; // Shared between tutors
  students: {
    group1: Array<{ id: string; name: string; email: string }>;
    group2: Array<{ id: string; name: string; email: string }>;
    group3: Array<{ id: string; name: string; email: string }>;
  };
  tasks: Array<{ id: string; title: string; groupIds: string[] }>;
};

test.describe("Tutor Permissions System", () => {
  test.beforeAll(async () => {
    // Clean up existing test data
    await prisma.auditLog.deleteMany({
      where: { userId: { contains: "test-" } },
    });
    await prisma.assessment.deleteMany();
    await prisma.attendance.deleteMany();
    await prisma.task.deleteMany({
      where: { createdById: { contains: "test-" } },
    });
    await prisma.student.deleteMany({
      where: { email: { contains: "test-student" } },
    });
    await prisma.group.deleteMany({ where: { code: { contains: "TEST" } } });
    await prisma.user.deleteMany({
      where: { email: { contains: "test-tutor" } },
    });

    // Create test users
    const password = await bcrypt.hash("testpass123", 12);

    const admin = await prisma.user.create({
      data: {
        id: "test-admin-1",
        email: "test-admin@school.com",
        name: "Test Admin",
        password,
        role: "ADMIN",
      },
    });

    const tutor1 = await prisma.user.create({
      data: {
        id: "test-tutor-1",
        email: "test-tutor1@school.com",
        name: "Test Tutor 1",
        password,
        role: "TUTOR",
      },
    });

    const tutor2 = await prisma.user.create({
      data: {
        id: "test-tutor-2",
        email: "test-tutor2@school.com",
        name: "Test Tutor 2",
        password,
        role: "TUTOR",
      },
    });

    // Create test groups
    const group1 = await prisma.group.create({
      data: {
        id: "test-group-1",
        name: "Test Class A",
        code: "TESTA",
        academicYear: "2024",
        grade: "10",
        tutors: {
          connect: [{ id: tutor1.id }],
        },
      },
    });

    const group2 = await prisma.group.create({
      data: {
        id: "test-group-2",
        name: "Test Class B",
        code: "TESTB",
        academicYear: "2024",
        grade: "10",
        tutors: {
          connect: [{ id: tutor2.id }],
        },
      },
    });

    const group3 = await prisma.group.create({
      data: {
        id: "test-group-3",
        name: "Test Class C (Shared)",
        code: "TESTC",
        academicYear: "2024",
        grade: "9",
        tutors: {
          connect: [{ id: tutor1.id }, { id: tutor2.id }],
        },
      },
    });

    // Create test students
    const studentsGroup1 = [];
    const studentsGroup2 = [];
    const studentsGroup3 = [];

    for (let i = 1; i <= 3; i++) {
      const student1 = await prisma.student.create({
        data: {
          id: `test-student-g1-${i}`,
          studentId: `TESTG1${i.toString().padStart(3, "0")}`,
          name: `Test Student G1-${i}`,
          email: `test-student-g1-${i}@school.com`,
          groupId: group1.id,
          status: "ACTIVE",
        },
      });
      studentsGroup1.push(student1);

      const student2 = await prisma.student.create({
        data: {
          id: `test-student-g2-${i}`,
          studentId: `TESTG2${i.toString().padStart(3, "0")}`,
          name: `Test Student G2-${i}`,
          email: `test-student-g2-${i}@school.com`,
          groupId: group2.id,
          status: "ACTIVE",
        },
      });
      studentsGroup2.push(student2);

      const student3 = await prisma.student.create({
        data: {
          id: `test-student-g3-${i}`,
          studentId: `TESTG3${i.toString().padStart(3, "0")}`,
          name: `Test Student G3-${i}`,
          email: `test-student-g3-${i}@school.com`,
          groupId: group3.id,
          status: "ACTIVE",
        },
      });
      studentsGroup3.push(student3);
    }

    // Create test tasks
    const task1 = await prisma.task.create({
      data: {
        id: "test-task-1",
        title: "Test Task for Group 1",
        description: "Task assigned to Group 1 only",
        type: "ASSIGNMENT",
        createdById: tutor1.id,
        isPublished: true,
        groups: {
          connect: [{ id: group1.id }],
        },
      },
    });

    const task2 = await prisma.task.create({
      data: {
        id: "test-task-2",
        title: "Test Task for Group 2",
        description: "Task assigned to Group 2 only",
        type: "ASSIGNMENT",
        createdById: tutor2.id,
        isPublished: true,
        groups: {
          connect: [{ id: group2.id }],
        },
      },
    });

    const task3 = await prisma.task.create({
      data: {
        id: "test-task-3",
        title: "Test Task for Shared Group",
        description: "Task assigned to shared Group 3",
        type: "ASSIGNMENT",
        createdById: tutor1.id,
        isPublished: true,
        groups: {
          connect: [{ id: group3.id }],
        },
      },
    });

    testData = {
      tutor1: { id: tutor1.id, email: tutor1.email },
      tutor2: { id: tutor2.id, email: tutor2.email },
      admin: { id: admin.id, email: admin.email },
      group1: { id: group1.id, name: group1.name },
      group2: { id: group2.id, name: group2.name },
      group3: { id: group3.id, name: group3.name },
      students: {
        group1: studentsGroup1,
        group2: studentsGroup2,
        group3: studentsGroup3,
      },
      tasks: [
        { id: task1.id, title: task1.title, groupIds: [group1.id] },
        { id: task2.id, title: task2.title, groupIds: [group2.id] },
        { id: task3.id, title: task3.title, groupIds: [group3.id] },
      ],
    };
  });

  test.afterAll(async () => {
    // Clean up test data
    await prisma.auditLog.deleteMany({
      where: { userId: { contains: "test-" } },
    });
    await prisma.assessment.deleteMany({
      where: { taskId: { contains: "test-task" } },
    });
    await prisma.attendance.deleteMany({
      where: { studentId: { contains: "test-student" } },
    });
    await prisma.task.deleteMany({ where: { id: { contains: "test-task" } } });
    await prisma.student.deleteMany({
      where: { id: { contains: "test-student" } },
    });
    await prisma.group.deleteMany({
      where: { id: { contains: "test-group" } },
    });
    await prisma.user.deleteMany({ where: { id: { contains: "test-" } } });
    await prisma.$disconnect();
  });

  test.describe("Student Access Control", () => {
    test("tutor can only see students from their assigned groups", async ({
      request,
    }) => {
      // Login as tutor1
      const loginResponse = await request.post("/api/auth/signin", {
        data: {
          email: testData.tutor1.email,
          password: "testpass123",
        },
      });
      expect(loginResponse.ok()).toBeTruthy();

      // Get students - should only return students from group1 and group3 (tutor1's groups)
      const studentsResponse = await request.get("/api/students");
      expect(studentsResponse.ok()).toBeTruthy();

      const studentsData = await studentsResponse.json();
      const studentIds = studentsData.data.map((s: any) => s.id);

      // Should include students from group1 and group3
      testData.students.group1.forEach((student) => {
        expect(studentIds).toContain(student.id);
      });
      testData.students.group3.forEach((student) => {
        expect(studentIds).toContain(student.id);
      });

      // Should NOT include students from group2 (not tutor1's group)
      testData.students.group2.forEach((student) => {
        expect(studentIds).not.toContain(student.id);
      });
    });

    test("tutor cannot access individual student from unassigned group", async ({
      request,
    }) => {
      // Login as tutor1
      await request.post("/api/auth/signin", {
        data: {
          email: testData.tutor1.email,
          password: "testpass123",
        },
      });

      // Try to access a student from group2 (not assigned to tutor1)
      const studentFromGroup2 = testData.students.group2[0];
      const studentResponse = await request.get(
        `/api/students/${studentFromGroup2.id}`,
      );

      // Should return 403 Forbidden or 404 Not Found
      expect([403, 404]).toContain(studentResponse.status());
    });

    test("tutor can access student from assigned group", async ({
      request,
    }) => {
      // Login as tutor1
      await request.post("/api/auth/signin", {
        data: {
          email: testData.tutor1.email,
          password: "testpass123",
        },
      });

      // Access a student from group1 (assigned to tutor1)
      const studentFromGroup1 = testData.students.group1[0];
      const studentResponse = await request.get(
        `/api/students/${studentFromGroup1.id}`,
      );

      expect(studentResponse.ok()).toBeTruthy();
      const studentData = await studentResponse.json();
      expect(studentData.data.id).toBe(studentFromGroup1.id);
    });
  });

  test.describe("Task Assignment Control", () => {
    test("tutor can only see tasks from their assigned groups", async ({
      request,
    }) => {
      // Login as tutor1
      await request.post("/api/auth/signin", {
        data: {
          email: testData.tutor1.email,
          password: "testpass123",
        },
      });

      const tasksResponse = await request.get("/api/tasks");
      expect(tasksResponse.ok()).toBeTruthy();

      const tasksData = await tasksResponse.json();
      const taskIds = tasksData.data.map((t: any) => t.id);

      // Should see task1 (group1) and task3 (group3 - shared)
      expect(taskIds).toContain(testData.tasks[0].id); // task1
      expect(taskIds).toContain(testData.tasks[2].id); // task3

      // Should NOT see task2 (group2 - not assigned to tutor1)
      expect(taskIds).not.toContain(testData.tasks[1].id); // task2
    });

    test("tutor cannot create task for unassigned group", async ({
      request,
    }) => {
      // Login as tutor1
      await request.post("/api/auth/signin", {
        data: {
          email: testData.tutor1.email,
          password: "testpass123",
        },
      });

      // Try to create task for group2 (not assigned to tutor1)
      const createTaskResponse = await request.post("/api/tasks", {
        data: {
          title: "Unauthorized Task",
          description: "This should fail",
          type: "ASSIGNMENT",
          groupIds: [testData.group2.id], // group2 not assigned to tutor1
          isPublished: true,
        },
      });

      // Should return 403 Forbidden
      expect(createTaskResponse.status()).toBe(403);
    });

    test("tutor can create task for assigned group", async ({ request }) => {
      // Login as tutor1
      await request.post("/api/auth/signin", {
        data: {
          email: testData.tutor1.email,
          password: "testpass123",
        },
      });

      // Create task for group1 (assigned to tutor1)
      const createTaskResponse = await request.post("/api/tasks", {
        data: {
          title: "Authorized Task",
          description: "This should succeed",
          type: "ASSIGNMENT",
          groupIds: [testData.group1.id], // group1 assigned to tutor1
          isPublished: true,
        },
      });

      expect(createTaskResponse.ok()).toBeTruthy();
      const taskData = await createTaskResponse.json();
      expect(taskData.data.title).toBe("Authorized Task");
    });
  });

  test.describe("Attendance Control", () => {
    test("tutor cannot mark attendance for student from unassigned group", async ({
      request,
    }) => {
      // Login as tutor1
      await request.post("/api/auth/signin", {
        data: {
          email: testData.tutor1.email,
          password: "testpass123",
        },
      });

      // Try to mark attendance for student from group2 (not assigned to tutor1)
      const studentFromGroup2 = testData.students.group2[0];
      const attendanceResponse = await request.post("/api/attendance", {
        data: {
          studentId: studentFromGroup2.id,
          groupId: testData.group2.id,
          date: new Date().toISOString().split("T")[0],
          status: "PRESENT",
        },
      });

      // Should return 403 Forbidden
      expect(attendanceResponse.status()).toBe(403);
    });

    test("tutor can mark attendance for student from assigned group", async ({
      request,
    }) => {
      // Login as tutor1
      await request.post("/api/auth/signin", {
        data: {
          email: testData.tutor1.email,
          password: "testpass123",
        },
      });

      // Mark attendance for student from group1 (assigned to tutor1)
      const studentFromGroup1 = testData.students.group1[0];
      const attendanceResponse = await request.post("/api/attendance", {
        data: {
          studentId: studentFromGroup1.id,
          groupId: testData.group1.id,
          date: new Date().toISOString().split("T")[0],
          status: "PRESENT",
        },
      });

      expect(attendanceResponse.ok()).toBeTruthy();
      const attendanceData = await attendanceResponse.json();
      expect(attendanceData.data.studentId).toBe(studentFromGroup1.id);
    });

    test("tutor can only view attendance for their assigned groups", async ({
      request,
    }) => {
      // Login as tutor1
      await request.post("/api/auth/signin", {
        data: {
          email: testData.tutor1.email,
          password: "testpass123",
        },
      });

      // Get attendance records
      const attendanceResponse = await request.get("/api/attendance");
      expect(attendanceResponse.ok()).toBeTruthy();

      const attendanceData = await attendanceResponse.json();

      // All attendance records should be for students in tutor1's groups (group1 and group3)
      for (const record of attendanceData) {
        const student = await prisma.student.findUnique({
          where: { id: record.studentId },
          include: { group: true },
        });

        expect([testData.group1.id, testData.group3.id]).toContain(
          student?.groupId,
        );
      }
    });
  });

  test.describe("Cross-Tutor Isolation", () => {
    test("tutor1 and tutor2 have isolated access to their respective groups", async ({
      request,
    }) => {
      // Test tutor1 access
      await request.post("/api/auth/signin", {
        data: {
          email: testData.tutor1.email,
          password: "testpass123",
        },
      });

      const tutor1StudentsResponse = await request.get("/api/students");
      const tutor1Students = await tutor1StudentsResponse.json();
      const tutor1StudentIds = tutor1Students.data.map((s: any) => s.id);

      // Logout and login as tutor2
      await request.post("/api/auth/signout");
      await request.post("/api/auth/signin", {
        data: {
          email: testData.tutor2.email,
          password: "testpass123",
        },
      });

      const tutor2StudentsResponse = await request.get("/api/students");
      const tutor2Students = await tutor2StudentsResponse.json();
      const tutor2StudentIds = tutor2Students.data.map((s: any) => s.id);

      // Verify isolation: tutor1 should not see group2 students, tutor2 should not see group1 students
      testData.students.group2.forEach((student) => {
        expect(tutor1StudentIds).not.toContain(student.id);
        expect(tutor2StudentIds).toContain(student.id);
      });

      testData.students.group1.forEach((student) => {
        expect(tutor1StudentIds).toContain(student.id);
        expect(tutor2StudentIds).not.toContain(student.id);
      });

      // Both should see shared group3 students
      testData.students.group3.forEach((student) => {
        expect(tutor1StudentIds).toContain(student.id);
        expect(tutor2StudentIds).toContain(student.id);
      });
    });
  });

  test.describe("Admin Override", () => {
    test("admin can access all students regardless of group assignment", async ({
      request,
    }) => {
      // Login as admin
      await request.post("/api/auth/signin", {
        data: {
          email: testData.admin.email,
          password: "testpass123",
        },
      });

      const studentsResponse = await request.get("/api/students");
      expect(studentsResponse.ok()).toBeTruthy();

      const studentsData = await studentsResponse.json();
      const studentIds = studentsData.data.map((s: any) => s.id);

      // Admin should see ALL students from all groups
      [
        ...testData.students.group1,
        ...testData.students.group2,
        ...testData.students.group3,
      ].forEach((student) => {
        expect(studentIds).toContain(student.id);
      });
    });
  });
});
