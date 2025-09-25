import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const publishSchema = z.object({
  notes: z.string().optional(),
  triggerDeployment: z.boolean().default(true),
});

// POST /api/translations/publish - Publish all approved translations
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { notes, triggerDeployment } = publishSchema.parse(body);

    // Generate version string
    const version = `v${Date.now()}`;

    // Start a transaction to publish all approved translations
    const result = await prisma.$transaction(async (tx) => {
      // Get all approved but unpublished translations
      const unpublishedTranslations = await tx.translation.findMany({
        where: {
          isApproved: true,
          isPublished: false,
        },
        include: {
          translationKey: true,
          language: true,
        },
      });

      console.log(
        `Publishing ${unpublishedTranslations.length} translations...`,
      );

      // Mark all approved translations as published
      const publishedCount = await tx.translation.updateMany({
        where: {
          isApproved: true,
        },
        data: {
          isPublished: true,
          publishedAt: new Date(),
        },
      });

      // Create publication record
      const publication = await tx.translationPublication.create({
        data: {
          version,
          publishedBy: session.user.id,
          notes,
          deploymentStatus: triggerDeployment ? "pending" : "skipped",
        },
      });

      return {
        publication,
        publishedCount: publishedCount.count,
        newTranslations: unpublishedTranslations.length,
      };
    });

    // Trigger deployment if requested
    if (triggerDeployment) {
      try {
        await triggerVercelDeployment(version, result.publication.id);
      } catch (deployError) {
        console.error("Deployment trigger failed:", deployError);
        // Update publication status
        await prisma.translationPublication.update({
          where: { id: result.publication.id },
          data: { deploymentStatus: "failed" },
        });
      }
    }

    return NextResponse.json({
      success: true,
      version,
      publishedCount: result.publishedCount,
      newTranslations: result.newTranslations,
      publicationId: result.publication.id,
      deploymentTriggered: triggerDeployment,
    });
  } catch (error) {
    console.error("Failed to publish translations:", error);
    return NextResponse.json(
      { error: "Failed to publish translations" },
      { status: 500 },
    );
  }
}

// GET /api/translations/publish - Get publication history
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const publications = await prisma.translationPublication.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { publishedAt: "desc" },
      take: 20,
    });

    // Get counts of unpublished translations
    const unpublishedCount = await prisma.translation.count({
      where: {
        isApproved: true,
        isPublished: false,
      },
    });

    const unapprovedCount = await prisma.translation.count({
      where: {
        isApproved: false,
      },
    });

    return NextResponse.json({
      publications,
      unpublishedCount,
      unapprovedCount,
    });
  } catch (error) {
    console.error("Failed to fetch publication history:", error);
    return NextResponse.json(
      { error: "Failed to fetch publication history" },
      { status: 500 },
    );
  }
}

async function triggerVercelDeployment(version: string, publicationId: string) {
  const deployHook = process.env.VERCEL_DEPLOY_HOOK_URL;

  if (!deployHook) {
    console.log("No Vercel deploy hook configured, skipping deployment");
    return;
  }

  console.log(`Triggering Vercel deployment for version ${version}...`);

  const response = await fetch(deployHook, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ref: "main", // or your default branch
      meta: {
        translationVersion: version,
        publicationId,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Deployment trigger failed: ${response.statusText}`);
  }

  // Update publication with deployment info
  await prisma.translationPublication.update({
    where: { id: publicationId },
    data: {
      deploymentStatus: "building",
      deploymentUrl: `https://vercel.com/deployments`, // You might want to parse the actual deployment URL from response
    },
  });

  console.log(`✅ Deployment triggered successfully for version ${version}`);
}
