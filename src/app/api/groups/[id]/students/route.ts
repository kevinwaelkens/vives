import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/utils";

const MoveStudentSchema = z.object({
  studentId: z.string(),
  targetGroupId: z.string(),
});

const RemoveStudentSchema = z.object({
  studentId: z.string(),
});

// POST /api/groups/[id]/students - Move student to this group
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: groupId } = await params;
    const user = await getCurrentUser();
    if (!user || !["ADMIN", "TUTOR"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { studentId } = MoveStudentSchema.parse(body);

    // Verify tutor has access to the target group
    if (user.role === "TUTOR") {
      const targetGroup = await prisma.group.findFirst({
        where: {
          id: groupId,
          tutors: {
            some: { id: user.id },
          },
        },
      });

      if (!targetGroup) {
        return NextResponse.json(
          { error: "You can only move students to groups you are assigned to" },
          { status: 403 },
        );
      }
    }

    // Get current student to verify tutor has access to source group
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        group: {
          include: {
            tutors: true,
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Verify tutor has access to source group
    if (user.role === "TUTOR") {
      const hasAccessToSource = student.group.tutors.some(
        (tutor) => tutor.id === user.id,
      );

      if (!hasAccessToSource) {
        return NextResponse.json(
          {
            error: "You can only move students from groups you are assigned to",
          },
          { status: 403 },
        );
      }
    }

    // Move student to new group
    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: { groupId },
      include: {
        group: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        entity: "Student",
        entityId: studentId,
        userId: user.id,
        oldValues: { groupId: student.groupId },
        newValues: { groupId },
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

    console.error("Error moving student:", error);
    return NextResponse.json(
      { error: "Failed to move student" },
      { status: 500 },
    );
  }
}

// DELETE /api/groups/[id]/students - Remove student from group (Admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: groupId } = await params;
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can remove students from groups" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { studentId } = RemoveStudentSchema.parse(body);

    // Verify student exists and is in this group
    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        groupId,
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found in this group" },
        { status: 404 },
      );
    }

    // Delete the student (this will cascade delete related records)
    await prisma.$transaction(async (tx) => {
      // Delete assessments
      await tx.assessment.deleteMany({
        where: { studentId },
      });

      // Delete attendance records
      await tx.attendance.deleteMany({
        where: { studentId },
      });

      // Delete the student
      await tx.student.delete({
        where: { id: studentId },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          action: "DELETE",
          entity: "Student",
          entityId: studentId,
          userId: user.id,
          oldValues: student as any,
        },
      });
    });

    return NextResponse.json({ message: "Student removed successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 },
      );
    }

    console.error("Error removing student:", error);
    return NextResponse.json(
      { error: "Failed to remove student" },
      { status: 500 },
    );
  }
}
