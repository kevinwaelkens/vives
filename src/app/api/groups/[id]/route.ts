import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/utils";

const UpdateGroupSchema = z.object({
  name: z.string().min(1).optional(),
  code: z.string().min(1).optional(),
  academicYear: z.string().min(1).optional(),
  grade: z.string().min(1).optional(),
  tutorIds: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

// GET /api/groups/[id] - Get a single group with full details
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

    // If user is a tutor, only allow access to groups they are assigned to
    if (user.role === "TUTOR") {
      where.tutors = {
        some: {
          id: user.id,
        },
      };
    }

    const group = await prisma.group.findFirst({
      where,
      include: {
        tutors: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        students: {
          include: {
            parentContacts: {
              where: { isPrimary: true },
              take: 1,
            },
            _count: {
              select: {
                assessments: true,
                attendance: {
                  where: {
                    date: {
                      gte: new Date(new Date().getFullYear(), 0, 1), // This year
                    },
                  },
                },
              },
            },
          },
          orderBy: { name: "asc" },
        },
        tasks: {
          include: {
            _count: {
              select: {
                assessments: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10, // Latest 10 tasks
        },
        _count: {
          select: {
            students: true,
            tasks: true,
          },
        },
      },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    return NextResponse.json({ data: group });
  } catch (error) {
    console.error("Error fetching group:", error);
    return NextResponse.json(
      { error: "Failed to fetch group" },
      { status: 500 },
    );
  }
}

// PATCH /api/groups/[id] - Update a group
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
    const validatedData = UpdateGroupSchema.parse(body);

    // Build where clause with tutor permission check
    const where: any = { id };

    // If user is a tutor, only allow access to groups they are assigned to
    if (user.role === "TUTOR") {
      where.tutors = {
        some: {
          id: user.id,
        },
      };
    }

    // Get current group for audit log
    const currentGroup = await prisma.group.findFirst({
      where,
      include: {
        tutors: true,
      },
    });

    if (!currentGroup) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Prepare update data
    const { tutorIds, ...groupData } = validatedData;
    const updateData: any = { ...groupData };

    // Handle tutor assignments if provided
    if (tutorIds !== undefined) {
      // For tutors, they can only assign themselves or keep existing assignments
      if (user.role === "TUTOR") {
        const currentTutorIds = currentGroup.tutors.map((t) => t.id);
        const hasCurrentUser = currentTutorIds.includes(user.id);
        const hasCurrentUserInNew = tutorIds.includes(user.id);

        // Tutor must remain assigned to the group
        if (hasCurrentUser && !hasCurrentUserInNew) {
          return NextResponse.json(
            { error: "You cannot remove yourself from the group" },
            { status: 403 },
          );
        }

        // Tutors can only add themselves or keep existing tutors
        const allowedTutorIds = [...new Set([...currentTutorIds, user.id])];
        const invalidTutorIds = tutorIds.filter(
          (id) => !allowedTutorIds.includes(id),
        );

        if (invalidTutorIds.length > 0) {
          return NextResponse.json(
            { error: "You can only assign yourself or existing tutors" },
            { status: 403 },
          );
        }
      }

      updateData.tutors = {
        set: tutorIds.map((id) => ({ id })),
      };
    }

    const updatedGroup = await prisma.group.update({
      where: { id },
      data: updateData,
      include: {
        tutors: true,
        _count: {
          select: {
            students: true,
            tasks: true,
          },
        },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        entity: "Group",
        entityId: id,
        userId: user.id,
        oldValues: currentGroup as any,
        newValues: updatedGroup as any,
      },
    });

    return NextResponse.json({ data: updatedGroup });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 },
      );
    }

    console.error("Error updating group:", error);
    return NextResponse.json(
      { error: "Failed to update group" },
      { status: 500 },
    );
  }
}

// DELETE /api/groups/[id] - Delete a group (Admin only)
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

    const group = await prisma.group.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            students: true,
            tasks: true,
          },
        },
      },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Check if group has students or tasks
    if (group._count.students > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete group with students. Please move students to another group first.",
        },
        { status: 400 },
      );
    }

    if (group._count.tasks > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete group with tasks. Please remove or reassign tasks first.",
        },
        { status: 400 },
      );
    }

    await prisma.group.delete({
      where: { id },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: "DELETE",
        entity: "Group",
        entityId: id,
        userId: user.id,
        oldValues: group as any,
      },
    });

    return NextResponse.json({ message: "Group deleted successfully" });
  } catch (error) {
    console.error("Error deleting group:", error);
    return NextResponse.json(
      { error: "Failed to delete group" },
      { status: 500 },
    );
  }
}
