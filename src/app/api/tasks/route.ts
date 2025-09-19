import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/utils'

const CreateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  instructions: z.string().optional(),
  type: z.enum(['ASSIGNMENT', 'QUIZ', 'EXAM', 'PROJECT', 'HOMEWORK']),
  category: z.string().optional(),
  points: z.number().min(0).optional(),
  weight: z.number().min(0).max(1).optional(),
  dueDate: z.string().optional(),
  groupIds: z.array(z.string()).min(1, 'At least one group is required'),
  studentIds: z.array(z.string()).optional(),
  allowLateSubmission: z.boolean().default(true),
  rubric: z.any().optional(),
  isPublished: z.boolean().default(false),
})

// GET /api/tasks - Get all tasks
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = req.nextUrl.searchParams
    const groupId = searchParams.get('groupId')
    const type = searchParams.get('type')
    const isPublished = searchParams.get('isPublished')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')

    const where: any = {}

    if (groupId) {
      where.groups = {
        some: {
          id: groupId,
        },
      }
    }

    if (type) {
      where.type = type
    }

    if (isPublished !== null) {
      where.isPublished = isPublished === 'true'
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    // If user is a tutor, only show tasks from their groups
    if (user.role === 'TUTOR') {
      where.groups = {
        some: {
          tutors: {
            some: {
              id: user.id,
            },
          },
        },
      }
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          groups: true,
          _count: {
            select: {
              assessments: true,
              attachments: true,
            },
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.task.count({ where }),
    ])

    return NextResponse.json({
      data: tasks,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

// POST /api/tasks - Create a new task
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !['ADMIN', 'TUTOR'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = CreateTaskSchema.parse(body)

    const { groupIds, studentIds, ...taskData } = validatedData

    const task = await prisma.task.create({
      data: {
        ...taskData,
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
        createdById: user.id,
        groups: {
          connect: groupIds.map((id) => ({ id })),
        },
        students: studentIds
          ? {
              connect: studentIds.map((id) => ({ id })),
            }
          : undefined,
      },
      include: {
        groups: true,
        students: true,
      },
    })

    // Create assessments for all students in the connected groups
    if (validatedData.isPublished) {
      const students = await prisma.student.findMany({
        where: {
          OR: [
            { groupId: { in: groupIds } },
            { id: { in: studentIds || [] } },
          ],
        },
      })

      await prisma.assessment.createMany({
        data: students.map((student) => ({
          taskId: task.id,
          studentId: student.id,
          status: 'NOT_SUBMITTED',
        })),
      })

      // Create notifications for students
      await prisma.notification.createMany({
        data: students.map((student) => ({
          userId: student.id,
          type: 'TASK_ASSIGNED',
          title: 'New Task Assigned',
          message: `You have been assigned a new task: ${task.title}`,
          data: { taskId: task.id },
        })),
      })
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entity: 'Task',
        entityId: task.id,
        userId: user.id,
        newValues: task as any,
      },
    })

    return NextResponse.json({ data: task }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error creating task:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}
