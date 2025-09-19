import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/utils'

const UpdateAssessmentSchema = z.object({
  score: z.number().optional(),
  grade: z.string().optional(),
  feedback: z.string().optional(),
  status: z.enum(['NOT_SUBMITTED', 'SUBMITTED', 'LATE_SUBMITTED', 'GRADED', 'RETURNED']).optional(),
  gradedAt: z.string().optional(),
})

// PATCH /api/assessments/[id] - Update assessment (grade it)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    if (!user || !['ADMIN', 'TUTOR'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = UpdateAssessmentSchema.parse(body)

    const assessment = await prisma.assessment.update({
      where: { id },
      data: {
        ...validatedData,
        gradedAt: validatedData.gradedAt ? new Date(validatedData.gradedAt) : undefined,
        gradedById: validatedData.status === 'GRADED' ? user.id : undefined,
      },
      include: {
        task: true,
        student: true,
      },
    })

    // Create notification for student
    if (validatedData.status === 'GRADED') {
      await prisma.notification.create({
        data: {
          userId: assessment.studentId,
          type: 'GRADE_RELEASED',
          title: 'Grade Released',
          message: `Your ${assessment.task.title} has been graded`,
          data: { assessmentId: assessment.id },
        },
      })
    }

    return NextResponse.json({ data: assessment })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error updating assessment:', error)
    return NextResponse.json(
      { error: 'Failed to update assessment' },
      { status: 500 }
    )
  }
}
