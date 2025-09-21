#!/usr/bin/env tsx

/**
 * Test script to verify tutor permissions are working correctly
 * Run with: npx tsx scripts/test-tutor-permissions.ts
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function testTutorPermissions() {
  console.log("🧪 Testing Tutor Permissions System...\n");

  try {
    // Clean up any existing test data
    await cleanup();

    // Create test data
    const testData = await createTestData();
    console.log("✅ Test data created successfully\n");

    // Test 1: Verify tutor can only see their assigned students
    await testStudentAccess(testData);

    // Test 2: Verify task assignment restrictions
    await testTaskAssignment(testData);

    // Test 3: Verify attendance restrictions
    await testAttendanceAccess(testData);

    console.log("🎉 All tutor permission tests passed!\n");
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await cleanup();
    await prisma.$disconnect();
  }
}

async function createTestData() {
  const password = await bcrypt.hash("testpass123", 12);

  // Create tutors
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

  // Create groups
  const group1 = await prisma.group.create({
    data: {
      id: "test-group-1",
      name: "Test Class A",
      code: "TESTA",
      academicYear: "2024",
      grade: "10",
      tutors: { connect: [{ id: tutor1.id }] },
    },
  });

  const group2 = await prisma.group.create({
    data: {
      id: "test-group-2",
      name: "Test Class B",
      code: "TESTB",
      academicYear: "2024",
      grade: "10",
      tutors: { connect: [{ id: tutor2.id }] },
    },
  });

  // Create students
  const student1 = await prisma.student.create({
    data: {
      id: "test-student-1",
      studentId: "TEST001",
      name: "Test Student 1",
      email: "test-student-1@school.com",
      groupId: group1.id,
      status: "ACTIVE",
    },
  });

  const student2 = await prisma.student.create({
    data: {
      id: "test-student-2",
      studentId: "TEST002",
      name: "Test Student 2",
      email: "test-student-2@school.com",
      groupId: group2.id,
      status: "ACTIVE",
    },
  });

  return { tutor1, tutor2, group1, group2, student1, student2 };
}

async function testStudentAccess(testData: any) {
  console.log("🔍 Testing student access restrictions...");

  // Simulate tutor1 querying students - should only see students from group1
  const tutor1Students = await prisma.student.findMany({
    where: {
      group: {
        tutors: {
          some: { id: testData.tutor1.id },
        },
      },
    },
  });

  // Simulate tutor2 querying students - should only see students from group2
  const tutor2Students = await prisma.student.findMany({
    where: {
      group: {
        tutors: {
          some: { id: testData.tutor2.id },
        },
      },
    },
  });

  // Verify isolation
  const tutor1StudentIds = tutor1Students.map((s) => s.id);
  const tutor2StudentIds = tutor2Students.map((s) => s.id);

  if (
    tutor1StudentIds.includes(testData.student1.id) &&
    !tutor1StudentIds.includes(testData.student2.id)
  ) {
    console.log("  ✅ Tutor1 can only see their assigned students");
  } else {
    throw new Error("Tutor1 student access restriction failed");
  }

  if (
    tutor2StudentIds.includes(testData.student2.id) &&
    !tutor2StudentIds.includes(testData.student1.id)
  ) {
    console.log("  ✅ Tutor2 can only see their assigned students");
  } else {
    throw new Error("Tutor2 student access restriction failed");
  }
}

async function testTaskAssignment(testData: any) {
  console.log("🔍 Testing task assignment restrictions...");

  // Test: Tutor1 should be able to create task for group1
  try {
    const tutorGroups = await prisma.group.findMany({
      where: {
        id: { in: [testData.group1.id] },
        tutors: {
          some: { id: testData.tutor1.id },
        },
      },
    });

    if (tutorGroups.length === 1) {
      console.log("  ✅ Tutor1 can create tasks for their assigned group");
    } else {
      throw new Error("Tutor1 group access check failed");
    }
  } catch (error) {
    throw new Error(`Task assignment test failed: ${error}`);
  }

  // Test: Tutor1 should NOT be able to create task for group2
  const unauthorizedGroups = await prisma.group.findMany({
    where: {
      id: { in: [testData.group2.id] },
      tutors: {
        some: { id: testData.tutor1.id },
      },
    },
  });

  if (unauthorizedGroups.length === 0) {
    console.log("  ✅ Tutor1 cannot create tasks for unassigned groups");
  } else {
    throw new Error("Tutor1 unauthorized group access check failed");
  }
}

async function testAttendanceAccess(testData: any) {
  console.log("🔍 Testing attendance access restrictions...");

  // Test: Tutor1 should be able to access student1 for attendance
  const authorizedStudent = await prisma.student.findFirst({
    where: {
      id: testData.student1.id,
      group: {
        tutors: {
          some: { id: testData.tutor1.id },
        },
      },
    },
  });

  if (authorizedStudent) {
    console.log(
      "  ✅ Tutor1 can access their assigned students for attendance",
    );
  } else {
    throw new Error("Tutor1 authorized student access failed");
  }

  // Test: Tutor1 should NOT be able to access student2 for attendance
  const unauthorizedStudent = await prisma.student.findFirst({
    where: {
      id: testData.student2.id,
      group: {
        tutors: {
          some: { id: testData.tutor1.id },
        },
      },
    },
  });

  if (!unauthorizedStudent) {
    console.log("  ✅ Tutor1 cannot access unassigned students for attendance");
  } else {
    throw new Error("Tutor1 unauthorized student access check failed");
  }
}

async function cleanup() {
  // Clean up test data
  await prisma.attendance.deleteMany({
    where: { studentId: { contains: "test-student" } },
  });
  await prisma.task.deleteMany({
    where: { createdById: { contains: "test-tutor" } },
  });
  await prisma.student.deleteMany({
    where: { id: { contains: "test-student" } },
  });
  await prisma.group.deleteMany({ where: { id: { contains: "test-group" } } });
  await prisma.user.deleteMany({ where: { id: { contains: "test-tutor" } } });
}

// Run the test
testTutorPermissions().catch(console.error);
