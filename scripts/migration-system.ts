#!/usr/bin/env tsx
/**
 * Database Migration System
 *
 * This system provides versioned database migrations for production deployments.
 * It tracks which migrations have been applied and can run incremental updates.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface Migration {
  version: string;
  name: string;
  description: string;
  up: () => Promise<void>;
  down?: () => Promise<void>;
}

// Migration definitions
const migrations: Migration[] = [
  {
    version: "001",
    name: "initial_setup",
    description: "Initial database setup with base schema",
    up: async () => {
      console.log("🔧 Running initial database setup...");

      // Import and run the main seed
      const { default: seedTranslations } = await import(
        "../prisma/translation-seed"
      );
      const { seedPermissions } = await import("../prisma/permissions-seed");
      await import("../prisma/seed");

      await seedTranslations();
      await seedPermissions();

      console.log("✅ Initial setup completed");
    },
    down: async () => {
      console.log("⚠️  Rolling back initial setup...");
      // Clear all data (use with caution!)
      await prisma.translation.deleteMany();
      await prisma.translationKey.deleteMany();
      await prisma.language.deleteMany();
      await prisma.userRole.deleteMany();
      await prisma.permission.deleteMany();
      await prisma.user.deleteMany();
      console.log("✅ Initial setup rolled back");
    },
  },
  {
    version: "002",
    name: "student_detail_translations",
    description: "Add comprehensive student detail page translations",
    up: async () => {
      console.log("🔧 Adding student detail translations...");

      // Re-run translation seed to get latest translations
      const { default: seedTranslations } = await import(
        "../prisma/translation-seed"
      );
      await seedTranslations();

      console.log("✅ Student detail translations added");
    },
    down: async () => {
      console.log("⚠️  Rolling back student detail translations...");

      // Remove student detail translations
      await prisma.translation.deleteMany({
        where: {
          translationKey: {
            key: {
              startsWith: "students.detail.",
            },
          },
        },
      });

      await prisma.translationKey.deleteMany({
        where: {
          key: {
            startsWith: "students.detail.",
          },
        },
      });

      console.log("✅ Student detail translations rolled back");
    },
  },
];

class MigrationManager {
  private async ensureMigrationTable(): Promise<void> {
    // Create migration tracking table if it doesn't exist
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "_migrations" (
          id SERIAL PRIMARY KEY,
          version VARCHAR(255) NOT NULL UNIQUE,
          name VARCHAR(255) NOT NULL,
          applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          checksum VARCHAR(255) NOT NULL
        );
      `;
    } catch {
      // Table might already exist, that's fine
    }
  }

  private async getAppliedMigrations(): Promise<string[]> {
    await this.ensureMigrationTable();

    try {
      const result = await prisma.$queryRaw<{ version: string }[]>`
        SELECT version FROM "_migrations" ORDER BY version ASC;
      `;
      return result.map((r) => r.version);
    } catch {
      console.warn("Could not fetch applied migrations, assuming none applied");
      return [];
    }
  }

  private async recordMigration(migration: Migration): Promise<void> {
    const checksum = this.generateChecksum(migration);

    await prisma.$executeRaw`
      INSERT INTO "_migrations" (version, name, checksum)
      VALUES (${migration.version}, ${migration.name}, ${checksum});
    `;
  }

  private async removeMigrationRecord(version: string): Promise<void> {
    await prisma.$executeRaw`
      DELETE FROM "_migrations" WHERE version = ${version};
    `;
  }

  private generateChecksum(migration: Migration): string {
    // Simple checksum based on migration content
    const content = migration.version + migration.name + migration.description;
    return Buffer.from(content).toString("base64").substring(0, 32);
  }

  async runMigrations(targetVersion?: string): Promise<void> {
    console.log("🚀 Starting database migrations...");

    const appliedMigrations = await this.getAppliedMigrations();
    console.log(`📊 Found ${appliedMigrations.length} applied migrations`);

    const migrationsToRun = migrations.filter((m) => {
      if (targetVersion && m.version > targetVersion) {
        return false;
      }
      return !appliedMigrations.includes(m.version);
    });

    if (migrationsToRun.length === 0) {
      console.log("✅ No new migrations to run");
      return;
    }

    console.log(`🔄 Running ${migrationsToRun.length} migrations...`);

    for (const migration of migrationsToRun) {
      console.log(
        `\n📦 Running migration ${migration.version}: ${migration.name}`,
      );
      console.log(`   ${migration.description}`);

      try {
        await migration.up();
        await this.recordMigration(migration);
        console.log(`✅ Migration ${migration.version} completed successfully`);
      } catch (error) {
        console.error(`❌ Migration ${migration.version} failed:`, error);
        throw error;
      }
    }

    console.log("\n🎉 All migrations completed successfully!");
  }

  async rollbackMigration(version: string): Promise<void> {
    console.log(`🔄 Rolling back migration ${version}...`);

    const migration = migrations.find((m) => m.version === version);
    if (!migration) {
      throw new Error(`Migration ${version} not found`);
    }

    if (!migration.down) {
      throw new Error(`Migration ${version} does not support rollback`);
    }

    const appliedMigrations = await this.getAppliedMigrations();
    if (!appliedMigrations.includes(version)) {
      throw new Error(`Migration ${version} is not applied`);
    }

    try {
      await migration.down();
      await this.removeMigrationRecord(version);
      console.log(`✅ Migration ${version} rolled back successfully`);
    } catch (error) {
      console.error(`❌ Rollback of migration ${version} failed:`, error);
      throw error;
    }
  }

  async listMigrations(): Promise<void> {
    const appliedMigrations = await this.getAppliedMigrations();

    console.log("\n📋 Migration Status:");
    console.log("=".repeat(80));

    for (const migration of migrations) {
      const isApplied = appliedMigrations.includes(migration.version);
      const status = isApplied ? "✅ APPLIED" : "⏳ PENDING";

      console.log(`${status} | ${migration.version} | ${migration.name}`);
      console.log(`         ${migration.description}`);
      console.log("");
    }
  }

  async clearDatabase(): Promise<void> {
    console.log("🗑️  Clearing entire database...");
    console.log("⚠️  This will delete ALL data!");

    // Ask for confirmation in interactive mode
    if (process.stdin.isTTY) {
      const readline = require("readline");
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      const answer = await new Promise<string>((resolve) => {
        rl.question('Type "CONFIRM" to proceed: ', resolve);
      });

      rl.close();

      if (answer !== "CONFIRM") {
        console.log("❌ Operation cancelled");
        return;
      }
    }

    // Clear all data
    const tableNames = [
      "Assessment",
      "Attendance",
      "ParentContact",
      "Student",
      "Task",
      "Group",
      "Translation",
      "TranslationKey",
      "Language",
      "UserRole",
      "Role",
      "Permission",
      "User",
      "AuditLog",
    ];

    for (const tableName of tableNames) {
      try {
        await prisma.$executeRawUnsafe(`DELETE FROM "${tableName}";`);
        console.log(`✅ Cleared ${tableName}`);
      } catch (error) {
        console.warn(`⚠️  Could not clear ${tableName}:`, error);
      }
    }

    // Clear migration records
    try {
      await prisma.$executeRaw`DELETE FROM "_migrations";`;
      console.log("✅ Cleared migration records");
    } catch (error) {
      console.warn("⚠️  Could not clear migration records:", error);
    }

    console.log("🎉 Database cleared successfully!");
  }
}

// CLI Interface
async function main() {
  const command = process.argv[2];
  const manager = new MigrationManager();

  try {
    await prisma.$connect();

    switch (command) {
      case "run": {
        const targetVersion = process.argv[3];
        await manager.runMigrations(targetVersion);
        break;
      }

      case "rollback": {
        const rollbackVersion = process.argv[3];
        if (!rollbackVersion) {
          console.error("❌ Please specify a migration version to rollback");
          process.exit(1);
        }
        await manager.rollbackMigration(rollbackVersion);
        break;
      }

      case "list":
        await manager.listMigrations();
        break;

      case "clear":
        await manager.clearDatabase();
        break;

      default:
        console.log(`
🗄️  Database Migration System

Usage:
  npm run migrate run [version]     - Run all pending migrations (or up to version)
  npm run migrate rollback <version> - Rollback a specific migration
  npm run migrate list              - List all migrations and their status
  npm run migrate clear             - Clear entire database (DANGEROUS!)

Examples:
  npm run migrate run               - Run all pending migrations
  npm run migrate run 001           - Run migrations up to version 001
  npm run migrate rollback 002      - Rollback migration 002
  npm run migrate list              - Show migration status
  npm run migrate clear             - Clear database (requires confirmation)
        `);
        break;
    }
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

export { MigrationManager, migrations };
