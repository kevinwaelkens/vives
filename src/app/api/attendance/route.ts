import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/utils'

const MarkAttendanceSchema = z.object({
  studentId: z.string(),
  groupId: z.string(),
  date: z.string(),
  status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']),
  period: z.string().optional().default('full-day'),
  notes: z.string().optional(),
})

// GET /api/attendance - Get attendance records
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = req.nextUrl.searchParams
    const date = searchParams.get('date')
    const groupId = searchParams.get('groupId')
    const studentId = searchParams.get('studentId')

    const where: any = {}

    if (date) {
      where.date = new Date(date)
    }
    if (groupId) {
      where.groupId = groupId
    }
    if (studentId) {
      where.studentId = studentId
    }

    const attendance = await prisma.attendance.findMany({
      where,
      include: {
        student: true,
        group: true,
      },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json(attendance)
  } catch (error) {
    console.error('Error fetching attendance:', error)
    return NextResponse.json(
      { error: 'Failed to fetch attendance' },
      { status: 500 }
    )
  }
}

// POST /api/attendance - Mark attendance
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !['ADMIN', 'TUTOR'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = MarkAttendanceSchema.parse(body)

    // Check if attendance already exists for this student and date
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        studentId: validatedData.studentId,
        date: new Date(validatedData.date),
        period: validatedData.period,
      },
    })

    if (existingAttendance) {
      // Update existing attendance
      const updated = await prisma.attendance.update({
        where: { id: existingAttendance.id },
        data: {
          status: validatedData.status,
          notes: validatedData.notes,
          markedById: user.id,
          markedAt: new Date(),
        },
      })
      return NextResponse.json({ data: updated })
    }

    // Create new attendance record
    const attendance = await prisma.attendance.create({
      data: {
        studentId: validatedData.studentId,
        groupId: validatedData.groupId,
        date: new Date(validatedData.date),
        status: validatedData.status,
        period: validatedData.period,
        notes: validatedData.notes,
        markedById: user.id,
      },
    })

    return NextResponse.json({ data: attendance }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error marking attendance:', error)
    return NextResponse.json(
      { error: 'Failed to mark attendance' },
      { status: 500 }
    )
  }
}
