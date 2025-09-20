import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting test database seed...')

  // Clear existing data
  await prisma.auditLog.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.attendance.deleteMany()
  await prisma.assessment.deleteMany()
  await prisma.task.deleteMany()
  await prisma.parentContact.deleteMany()
  await prisma.student.deleteMany()
  await prisma.group.deleteMany()
  await prisma.user.deleteMany()

  // Create test users
  const hashedPassword = await bcrypt.hash('test123', 12)

  const adminUser = await prisma.user.create({
    data: {
      email: 'test-admin@vives.com',
      name: 'Test Admin',
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
    },
  })

  const tutorUser = await prisma.user.create({
    data: {
      email: 'test-tutor@vives.com',
      name: 'Test Tutor',
      password: hashedPassword,
      role: 'TUTOR',
      isActive: true,
    },
  })

  console.log('Created test users')

  // Create test groups
  const group1 = await prisma.group.create({
    data: {
      name: 'Test Class 10A',
      code: 'TEST-10A',
      academicYear: '2024-2025',
      grade: '10',
      isActive: true,
      tutors: {
        connect: { id: tutorUser.id },
      },
    },
  })

  const group2 = await prisma.group.create({
    data: {
      name: 'Test Class 11B',
      code: 'TEST-11B',
      academicYear: '2024-2025',
      grade: '11',
      isActive: true,
      tutors: {
        connect: { id: tutorUser.id },
      },
    },
  })

  console.log('Created test groups')

  // Create test students
  const students = []
  for (let i = 1; i <= 6; i++) {
    const student = await prisma.student.create({
      data: {
        studentId: `TEST-S${i.toString().padStart(3, '0')}`,
        name: `Test Student ${i}`,
        email: `test-student${i}@vives.com`,
        dateOfBirth: new Date('2008-01-01'),
        groupId: i <= 3 ? group1.id : group2.id,
        status: 'ACTIVE',
      },
    })
    students.push(student)

    // Create parent contact for each student
    await prisma.parentContact.create({
      data: {
        studentId: student.id,
        name: `Test Parent ${i}`,
        email: `test-parent${i}@vives.com`,
        phone: `+32 9 123 45 ${i.toString().padStart(2, '0')}`,
        relationship: 'PARENT',
        isPrimary: true,
      },
    })
  }

  console.log('Created test students and parent contacts')

  // Create test tasks
  const task1 = await prisma.task.create({
    data: {
      title: 'Test Mathematics Assignment',
      description: 'A test assignment for mathematics',
      instructions: 'Complete all exercises in the workbook',
      type: 'ASSIGNMENT',
      category: 'Mathematics',
      points: 100,
      dueDate: new Date('2025-10-01'),
      isPublished: true,
      createdById: tutorUser.id,
      groups: {
        connect: [{ id: group1.id }, { id: group2.id }],
      },
    },
  })

  const task2 = await prisma.task.create({
    data: {
      title: 'Test Science Project',
      description: 'A test project for science class',
      instructions: 'Create a presentation about renewable energy',
      type: 'PROJECT',
      category: 'Science',
      points: 150,
      dueDate: new Date('2025-10-15'),
      isPublished: true,
      createdById: tutorUser.id,
      groups: {
        connect: [{ id: group1.id }],
      },
    },
  })

  console.log('Created test tasks')

  // Create test assessments
  for (const student of students) {
    // Assessment for task 1
    await prisma.assessment.create({
      data: {
        taskId: task1.id,
        studentId: student.id,
        status: 'SUBMITTED',
        submittedAt: new Date(),
      },
    })

    // Assessment for task 2 (only for group 1 students)
    if (students.indexOf(student) < 3) {
      await prisma.assessment.create({
        data: {
          taskId: task2.id,
          studentId: student.id,
          status: 'GRADED',
          score: 85 + (students.indexOf(student) * 5),
          grade: 'B+',
          feedback: 'Good work on the project!',
          submittedAt: new Date(),
          gradedAt: new Date(),
          gradedById: tutorUser.id,
        },
      })
    }
  }

  console.log('Created test assessments')

  // Create test attendance records for the last 5 days
  const today = new Date()
  for (let i = 0; i < 5; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    for (const student of students) {
      await prisma.attendance.create({
        data: {
          studentId: student.id,
          groupId: student.groupId,
          date,
          status: Math.random() > 0.1 ? 'PRESENT' : 'ABSENT', // 90% attendance rate
          markedById: tutorUser.id,
        },
      })
    }
  }

  console.log('Created test attendance records')

  console.log('Test database seed completed successfully!')
  console.log('')
  console.log('Test login credentials:')
  console.log('Admin: test-admin@vives.com / test123')
  console.log('Tutor: test-tutor@vives.com / test123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
