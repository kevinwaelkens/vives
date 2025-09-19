import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/utils'
import { generateStudentId } from '@/lib/utils'

const CreateStudentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  groupId: z.string().cuid('Invalid group ID'),
  dateOfBirth: z.string().optional(),
  notes: z.string().optional(),
})

const UpdateStudentSchema = CreateStudentSchema.partial()

// GET /api/students - Get all students with filtering
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = req.nextUrl.searchParams
    const groupId = searchParams.get('groupId')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')

    const where: any = {}

    if (groupId) {
      where.groupId = groupId
    }

    if (status) {
      where.status = status
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { studentId: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        include: {
          group: true,
          parentContacts: true,
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.student.count({ where }),
    ])

    return NextResponse.json({
      data: students,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    )
  }
}

// POST /api/students - Create a new student
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !['ADMIN', 'TUTOR'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = CreateStudentSchema.parse(body)

    // Check if email already exists
    const existingStudent = await prisma.student.findUnique({
      where: { email: validatedData.email },
    })

    if (existingStudent) {
      return NextResponse.json(
        { error: 'Student with this email already exists' },
        { status: 400 }
      )
    }

    // Generate unique student ID
    const studentId = generateStudentId()

    const student = await prisma.student.create({
      data: {
        ...validatedData,
        studentId,
        dateOfBirth: validatedData.dateOfBirth
          ? new Date(validatedData.dateOfBirth)
          : undefined,
      },
      include: {
        group: true,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entity: 'Student',
        entityId: student.id,
        userId: user.id,
        newValues: student as any,
      },
    })

    return NextResponse.json({ data: student }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error creating student:', error)
    return NextResponse.json(
      { error: 'Failed to create student' },
      { status: 500 }
    )
  }
}
