import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/utils'

// GET /api/assessments - Get all assessments
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = req.nextUrl.searchParams
    const status = searchParams.get('status')
    const taskId = searchParams.get('taskId')
    const studentId = searchParams.get('studentId')

    const where: any = {}

    if (status && status !== 'all') {
      where.status = status
    }
    if (taskId) {
      where.taskId = taskId
    }
    if (studentId) {
      where.studentId = studentId
    }

    const assessments = await prisma.assessment.findMany({
      where,
      include: {
        task: true,
        student: true,
        comments: {
          include: {
            author: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(assessments)
  } catch (error) {
    console.error('Error fetching assessments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assessments' },
      { status: 500 }
    )
  }
}
