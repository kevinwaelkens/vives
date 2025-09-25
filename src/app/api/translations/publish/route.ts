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
      let unpublishedTranslations;
      let publishedCount;
      
      // Try to use isPublished column, fall back if it doesn't exist
      try {
        // Get all approved but unpublished translations
        unpublishedTranslations = await tx.translation.findMany({
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
        publishedCount = await tx.translation.updateMany({
          where: {
            isApproved: true,
          },
          data: {
            isPublished: true,
            publishedAt: new Date(),
          },
        });
      } catch (error: any) {
        // If isPublished column doesn't exist, just get all approved translations
        if (error.code === 'P2022' && error.meta?.column?.includes('isPublished')) {
          console.log("⚠️  isPublished column not found, using approved translations only");
          
          unpublishedTranslations = await tx.translation.findMany({
            where: {
              isApproved: true,
            },
            include: {
              translationKey: true,
              language: true,
            },
          });

          console.log(
            `Publishing ${unpublishedTranslations.length} translations...`,
          );

          // Just count approved translations (can't update isPublished if it doesn't exist)
          publishedCount = { count: unpublishedTranslations.length };
        } else {
          throw error;
        }
      }

      // Try to create publication record, skip if table doesn't exist
      let publication;
      try {
        publication = await tx.translationPublication.create({
          data: {
            version,
            publishedBy: session.user.id,
            notes,
            deploymentStatus: triggerDeployment ? "pending" : "skipped",
          },
        });
      } catch (error: any) {
        // If TranslationPublication table doesn't exist, create a mock record
        if (error.code === 'P2021') {
          console.log("⚠️  TranslationPublication table not found, skipping publication record");
          publication = {
            id: `mock-${Date.now()}`,
            version,
            publishedBy: session.user.id,
            notes,
            deploymentStatus: triggerDeployment ? "pending" : "skipped",
          };
        } else {
          throw error;
        }
      }

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
        // Update publication status (only if not a mock ID)
        if (!result.publication.id.startsWith('mock-')) {
          try {
            await prisma.translationPublication.update({
              where: { id: result.publication.id },
              data: { deploymentStatus: "failed" },
            });
          } catch (updateError) {
            console.log("⚠️  Could not update publication status:", updateError);
          }
        }
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

    // Try to get publications, fall back if table doesn't exist
    let publications = [];
    try {
      publications = await prisma.translationPublication.findMany({
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
    } catch (error: any) {
      if (error.code === 'P2021') {
        console.log("⚠️  TranslationPublication table not found, returning empty publications");
        publications = [];
      } else {
        throw error;
      }
    }

    // Get counts of unpublished translations (with backward compatibility)
    let unpublishedCount = 0;
    let unapprovedCount = 0;
    
    try {
      unpublishedCount = await prisma.translation.count({
        where: {
          isApproved: true,
          isPublished: false,
        },
      });
    } catch (error: any) {
      // If isPublished column doesn't exist, assume all approved translations are "unpublished"
      if (error.code === 'P2022' && error.meta?.column?.includes('isPublished')) {
        console.log("⚠️  isPublished column not found, counting all approved translations as unpublished");
        unpublishedCount = await prisma.translation.count({
          where: {
            isApproved: true,
          },
        });
      } else {
        throw error;
      }
    }

    try {
      unapprovedCount = await prisma.translation.count({
        where: {
          isApproved: false,
        },
      });
    } catch (error: any) {
      // If there's an issue with isApproved, just set to 0
      console.log("⚠️  Could not count unapproved translations:", error.message);
      unapprovedCount = 0;
    }

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

  // Update publication with deployment info (only if not a mock ID)
  if (!publicationId.startsWith('mock-')) {
    try {
      await prisma.translationPublication.update({
        where: { id: publicationId },
        data: {
          deploymentStatus: "building",
          deploymentUrl: `https://vercel.com/deployments`, // You might want to parse the actual deployment URL from response
        },
      });
    } catch (updateError) {
      console.log("⚠️  Could not update publication deployment status:", updateError);
    }
  }

  console.log(`✅ Deployment triggered successfully for version ${version}`);
}
