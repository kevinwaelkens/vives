import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/utils";

const UpdateStudentSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  groupId: z.string().cuid().optional(),
  dateOfBirth: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "GRADUATED", "TRANSFERRED"]).optional(),
});

// GET /api/students/[id] - Get a single student
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Build where clause with tutor permission check
    const where: any = { id };

    // If user is a tutor, only allow access to students in their assigned groups
    if (user.role === "TUTOR") {
      where.group = {
        tutors: {
          some: {
            id: user.id,
          },
        },
      };
    }

    const student = await prisma.student.findFirst({
      where,
      include: {
        group: {
          include: {
            tutors: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        parentContacts: true,
        assessments: {
          include: {
            task: {
              select: {
                id: true,
                title: true,
                description: true,
                type: true,
                category: true,
                points: true,
                dueDate: true,
                assignedAt: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        attendance: {
          orderBy: { date: "desc" },
          take: 30,
        },
        _count: {
          select: {
            assessments: true,
            attendance: true,
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json({ data: student });
  } catch (error) {
    console.error("Error fetching student:", error);
    return NextResponse.json(
      { error: "Failed to fetch student" },
      { status: 500 },
    );
  }
}

// PATCH /api/students/[id] - Update a student
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user || !["ADMIN", "TUTOR"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = UpdateStudentSchema.parse(body);

    // Build where clause with tutor permission check
    const where: any = { id };

    // If user is a tutor, only allow access to students in their assigned groups
    if (user.role === "TUTOR") {
      where.group = {
        tutors: {
          some: {
            id: user.id,
          },
        },
      };
    }

    // Get current student for audit log
    const currentStudent = await prisma.student.findFirst({
      where,
      include: {
        group: true,
      },
    });

    if (!currentStudent) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // If tutor is trying to change groupId, verify they have access to the new group
    if (
      user.role === "TUTOR" &&
      validatedData.groupId &&
      validatedData.groupId !== currentStudent.groupId
    ) {
      const newGroup = await prisma.group.findFirst({
        where: {
          id: validatedData.groupId,
          tutors: {
            some: {
              id: user.id,
            },
          },
        },
      });

      if (!newGroup) {
        return NextResponse.json(
          { error: "You can only move students to groups you are assigned to" },
          { status: 403 },
        );
      }
    }

    // Check if email is being changed and if it's already taken
    if (validatedData.email && validatedData.email !== currentStudent.email) {
      const existingStudent = await prisma.student.findUnique({
        where: { email: validatedData.email },
      });

      if (existingStudent) {
        return NextResponse.json(
          { error: "Email already in use" },
          { status: 400 },
        );
      }
    }

    const updatedStudent = await prisma.student.update({
      where: { id },
      data: {
        ...validatedData,
        dateOfBirth: validatedData.dateOfBirth
          ? new Date(validatedData.dateOfBirth)
          : undefined,
      },
      include: {
        group: true,
        parentContacts: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        entity: "Student",
        entityId: id,
        userId: user.id,
        oldValues: currentStudent as any,
        newValues: updatedStudent as any,
      },
    });

    return NextResponse.json({ data: updatedStudent });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 },
      );
    }

    console.error("Error updating student:", error);
    return NextResponse.json(
      { error: "Failed to update student" },
      { status: 500 },
    );
  }
}

// DELETE /api/students/[id] - Delete a student
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const student = await prisma.student.findUnique({
      where: { id },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Delete related records (cascade delete for some relations)
    await prisma.$transaction(async (tx) => {
      // Delete assessments
      await tx.assessment.deleteMany({
        where: { studentId: id },
      });

      // Delete attendance records
      await tx.attendance.deleteMany({
        where: { studentId: id },
      });

      // Delete the student (parent contacts will cascade delete)
      await tx.student.delete({
        where: { id },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          action: "DELETE",
          entity: "Student",
          entityId: id,
          userId: user.id,
          oldValues: student as any,
        },
      });
    });

    return NextResponse.json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Error deleting student:", error);
    return NextResponse.json(
      { error: "Failed to delete student" },
      { status: 500 },
    );
  }
}
