import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/utils'

const CreateGroupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  academicYear: z.string().min(1, 'Academic year is required'),
  grade: z.string().min(1, 'Grade is required'),
  tutorIds: z.array(z.string()).optional(),
})

const UpdateGroupSchema = CreateGroupSchema.partial()

// GET /api/groups - Get all groups
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = req.nextUrl.searchParams
    const academicYear = searchParams.get('academicYear')
    const grade = searchParams.get('grade')
    const isActive = searchParams.get('isActive')
    const search = searchParams.get('search')

    const where: any = {}

    if (academicYear) {
      where.academicYear = academicYear
    }

    if (grade) {
      where.grade = grade
    }

    if (isActive !== null) {
      where.isActive = isActive === 'true'
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ]
    }

    // If user is a tutor, only show their groups
    if (user.role === 'TUTOR') {
      where.tutors = {
        some: {
          id: user.id,
        },
      }
    }

    const groups = await prisma.group.findMany({
      where,
      include: {
        tutors: true,
        _count: {
          select: {
            students: true,
            tasks: true,
          },
        },
      },
      orderBy: [{ academicYear: 'desc' }, { name: 'asc' }],
    })

    return NextResponse.json({ data: groups })
  } catch (error) {
    console.error('Error fetching groups:', error)
    return NextResponse.json(
      { error: 'Failed to fetch groups' },
      { status: 500 }
    )
  }
}

// POST /api/groups - Create a new group
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = CreateGroupSchema.parse(body)

    // Check if group code already exists
    const existingGroup = await prisma.group.findUnique({
      where: { code: validatedData.code },
    })

    if (existingGroup) {
      return NextResponse.json(
        { error: 'Group with this code already exists' },
        { status: 400 }
      )
    }

    const { tutorIds, ...groupData } = validatedData

    const group = await prisma.group.create({
      data: {
        ...groupData,
        tutors: tutorIds
          ? {
              connect: tutorIds.map((id) => ({ id })),
            }
          : undefined,
      },
      include: {
        tutors: true,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entity: 'Group',
        entityId: group.id,
        userId: user.id,
        newValues: group as any,
      },
    })

    return NextResponse.json({ data: group }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error creating group:', error)
    return NextResponse.json(
      { error: 'Failed to create group' },
      { status: 500 }
    )
  }
}
