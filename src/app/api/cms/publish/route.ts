import { NextRequest, NextResponse } from "next/server";
import { exportTranslations } from "../../../../../scripts/export-translations";

/**
 * CMS Publish API - Exports translations and triggers Vercel deployment
 *
 * This endpoint:
 * 1. Exports current database translations to static JSON files
 * 2. Triggers a Vercel deployment using a deploy hook
 * 3. Returns the deployment status
 */
export async function POST(request: NextRequest) {
  try {
    console.log("🚀 CMS Publish triggered...");

    // Step 1: Export translations from database to static files
    console.log("📤 Step 1: Exporting translations...");
    const exportSummary = await exportTranslations();

    // Step 2: Trigger Vercel deployment (if deploy hook is configured)
    const vercelDeployHook = process.env.VERCEL_DEPLOY_HOOK_URL;
    let deploymentResult = null;

    if (vercelDeployHook) {
      console.log("🚀 Step 2: Triggering Vercel deployment...");

      try {
        const deployResponse = await fetch(vercelDeployHook, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reason: "CMS Translation Publish",
            timestamp: new Date().toISOString(),
            summary: exportSummary,
          }),
        });

        if (deployResponse.ok) {
          deploymentResult = await deployResponse.json();
          console.log("✅ Vercel deployment triggered successfully!");
        } else {
          console.error(
            "⚠️ Vercel deployment trigger failed:",
            deployResponse.statusText,
          );
          deploymentResult = {
            error: `Deploy hook failed: ${deployResponse.statusText}`,
            status: deployResponse.status,
          };
        }
      } catch (deployError) {
        console.error("❌ Error triggering deployment:", deployError);
        deploymentResult = {
          error: "Failed to trigger deployment",
          details:
            deployError instanceof Error
              ? deployError.message
              : String(deployError),
        };
      }
    } else {
      console.log(
        "⚠️ No VERCEL_DEPLOY_HOOK_URL configured, skipping deployment trigger",
      );
      deploymentResult = {
        skipped: true,
        reason: "No deploy hook configured",
      };
    }

    // Step 3: Return success response
    return NextResponse.json({
      success: true,
      message: "Translations published successfully!",
      export: exportSummary,
      deployment: deploymentResult,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("💥 CMS Publish failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to publish translations",
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

/**
 * GET endpoint to check publish status and configuration
 */
export async function GET() {
  return NextResponse.json({
    status: "ready",
    hasDeployHook: !!process.env.VERCEL_DEPLOY_HOOK_URL,
    timestamp: new Date().toISOString(),
  });
}
