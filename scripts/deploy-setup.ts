#!/usr/bin/env tsx
/**
 * Deployment Setup Script
 * Run this after deploying to set up the database using the migration system
 */

import { PrismaClient } from "@prisma/client";
import { MigrationManager } from "./migration-system";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Setting up production database...");

  try {
    // Test database connection
    await prisma.$connect();
    console.log("✅ Database connection successful");

    // Use migration system for setup
    const migrationManager = new MigrationManager();

    // Check if database is already initialized
    const userCount = await prisma.user.count();

    if (userCount === 0) {
      console.log("📊 Database is empty, running initial migrations...");
      await migrationManager.runMigrations();
    } else {
      console.log(
        `📊 Database already has ${userCount} users, running incremental migrations...`,
      );
      await migrationManager.runMigrations();
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
