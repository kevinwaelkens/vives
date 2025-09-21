#!/usr/bin/env tsx
/**
 * Deployment Setup Script
 * Run this after deploying to set up the database
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Setting up production database...");

  try {
    // Test database connection
    await prisma.$connect();
    console.log("✅ Database connection successful");

    // Check if database is already seeded
    const userCount = await prisma.user.count();

    if (userCount === 0) {
      console.log("📊 Database is empty, running seed...");

      // Import and run seed
      const { default: seedTranslations } = await import(
        "../prisma/translation-seed"
      );
      const { seedPermissions } = await import("../prisma/permissions-seed");

      // Run the main seed script
      const seedModule = await import("../prisma/seed");

      console.log("✅ Database seeded successfully!");
    } else {
      console.log(`📊 Database already has ${userCount} users, skipping seed`);
    }

    console.log("🎉 Production setup complete!");
  } catch (error) {
    console.error("❌ Setup failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("❌ Unexpected error:", error);
  process.exit(1);
});
