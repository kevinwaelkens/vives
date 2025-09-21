import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import seedTranslations from "./translation-seed";
import { seedPermissions } from "./permissions-seed";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seed...");

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.task.deleteMany();
  await prisma.parentContact.deleteMany();
  await prisma.student.deleteMany();
  await prisma.group.deleteMany();

  // Clean permissions system data
  await prisma.userRole.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.systemRole.deleteMany();
  await prisma.permission.deleteMany();

  await prisma.user.deleteMany();

  // Create users
  const adminPassword = await bcrypt.hash("admin123", 12);
  const tutorPassword = await bcrypt.hash("tutor123", 12);

  const admin = await prisma.user.create({
    data: {
      email: "admin@school.com",
      name: "Admin User",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  const tutor1 = await prisma.user.create({
    data: {
      email: "john.tutor@school.com",
      name: "John Tutor",
      password: tutorPassword,
      role: "TUTOR",
    },
  });

  const tutor2 = await prisma.user.create({
    data: {
      email: "jane.tutor@school.com",
      name: "Jane Tutor",
      password: tutorPassword,
      role: "TUTOR",
    },
  });

  console.log("Created users");

  // Create groups
  const group1 = await prisma.group.create({
    data: {
      name: "Class 10A",
      code: "CLS10A",
      academicYear: "2024",
      grade: "10",
      tutors: {
        connect: [{ id: tutor1.id }],
      },
    },
  });

  const group2 = await prisma.group.create({
    data: {
      name: "Class 10B",
      code: "CLS10B",
      academicYear: "2024",
      grade: "10",
      tutors: {
        connect: [{ id: tutor2.id }],
      },
    },
  });

  const group3 = await prisma.group.create({
    data: {
      name: "Class 9A",
      code: "CLS9A",
      academicYear: "2024",
      grade: "9",
      tutors: {
        connect: [{ id: tutor1.id }, { id: tutor2.id }],
      },
    },
  });

  console.log("Created groups");

  // Create students for group1
  const students = [];
  const studentNames = [
    "Alice Johnson",
    "Bob Smith",
    "Charlie Brown",
    "Diana Prince",
    "Ethan Hunt",
    "Fiona Shaw",
    "George Wilson",
    "Hannah Montana",
    "Isaac Newton",
    "Julia Roberts",
  ];

  for (let i = 0; i < studentNames.length; i++) {
    const student = await prisma.student.create({
      data: {
        studentId: `STU2024${String(i + 1).padStart(4, "0")}`,
        name: studentNames[i],
        email: `${studentNames[i].toLowerCase().replace(" ", ".")}@student.school.com`,
        groupId: i < 5 ? group1.id : group2.id,
        dateOfBirth: new Date(
          2008,
          Math.floor(Math.random() * 12),
          Math.floor(Math.random() * 28) + 1,
        ),
        status: "ACTIVE",
      },
    });

    // Add parent contact for each student
    await prisma.parentContact.create({
      data: {
        studentId: student.id,
        name: `Parent of ${studentNames[i]}`,
        email: `parent.${studentNames[i].toLowerCase().replace(" ", ".")}@email.com`,
        phone: `+1 555-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`,
        relationship: i % 2 === 0 ? "mother" : "father",
        isPrimary: true,
      },
    });

    students.push(student);
  }

  console.log("Created students and parent contacts");

  // Create tasks
  const task1 = await prisma.task.create({
    data: {
      title: "Mathematics Assignment 1",
      description: "Complete problems 1-20 from Chapter 5",
      instructions: "Show all your work and explain your reasoning",
      type: "ASSIGNMENT",
      category: "Mathematics",
      points: 100,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      createdById: tutor1.id,
      isPublished: true,
      groups: {
        connect: [{ id: group1.id }, { id: group2.id }],
      },
    },
  });

  const task2 = await prisma.task.create({
    data: {
      title: "Science Quiz",
      description: "Quiz on photosynthesis and cellular respiration",
      type: "QUIZ",
      category: "Science",
      points: 50,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      createdById: tutor2.id,
      isPublished: true,
      groups: {
        connect: [{ id: group1.id }],
      },
    },
  });

  const task3 = await prisma.task.create({
    data: {
      title: "History Essay",
      description: "Write a 500-word essay on the Industrial Revolution",
      instructions: "Include at least 3 sources and proper citations",
      type: "ASSIGNMENT",
      category: "History",
      points: 150,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
      createdById: tutor1.id,
      isPublished: true,
      groups: {
        connect: [{ id: group2.id }],
      },
    },
  });

  console.log("Created tasks");

  // Create assessments for students
  for (const student of students.slice(0, 5)) {
    // Students in group1 get task1 and task2
    await prisma.assessment.create({
      data: {
        taskId: task1.id,
        studentId: student.id,
        status: Math.random() > 0.3 ? "SUBMITTED" : "NOT_SUBMITTED",
        score: Math.random() > 0.3 ? Math.floor(Math.random() * 30) + 70 : null,
        submittedAt: Math.random() > 0.3 ? new Date() : null,
      },
    });

    await prisma.assessment.create({
      data: {
        taskId: task2.id,
        studentId: student.id,
        status: "NOT_SUBMITTED",
      },
    });
  }

  for (const student of students.slice(5, 10)) {
    // Students in group2 get task1 and task3
    await prisma.assessment.create({
      data: {
        taskId: task1.id,
        studentId: student.id,
        status: "NOT_SUBMITTED",
      },
    });

    await prisma.assessment.create({
      data: {
        taskId: task3.id,
        studentId: student.id,
        status: "NOT_SUBMITTED",
      },
    });
  }

  console.log("Created assessments");

  // Create attendance records for today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const student of students) {
    const attendanceStatus =
      Math.random() > 0.1 ? "PRESENT" : Math.random() > 0.5 ? "ABSENT" : "LATE";

    await prisma.attendance.create({
      data: {
        studentId: student.id,
        groupId: student.groupId,
        date: today,
        status: attendanceStatus,
        period: "full-day",
        markedById: tutor1.id,
      },
    });
  }

  console.log("Created attendance records");

  // Create some notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: admin.id,
        type: "SYSTEM_ALERT",
        title: "Welcome to School Management System",
        message: "Your account has been created successfully",
      },
      {
        userId: tutor1.id,
        type: "TASK_ASSIGNED",
        title: "New Task Created",
        message: "Mathematics Assignment 1 has been published",
      },
      {
        userId: tutor2.id,
        type: "TASK_ASSIGNED",
        title: "New Task Created",
        message: "Science Quiz has been published",
      },
    ],
  });

  console.log("Created notifications");

  // Seed translation system
  await seedTranslations();

  // Seed permissions system
  await seedPermissions();

  console.log("Database seed completed successfully!");
  console.log("\nLogin credentials:");
  console.log("Admin: admin@school.com / admin123");
  console.log("Tutor 1: john.tutor@school.com / tutor123");
  console.log("Tutor 2: jane.tutor@school.com / tutor123");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
