# 🗄️ Database Migration System

This project includes a comprehensive migration system for managing database updates in production environments. The system provides versioned migrations, rollback capabilities, and safe deployment practices.

## Overview

The migration system tracks database changes through versioned migration files. Each migration can be applied incrementally, and the system keeps track of which migrations have been run to avoid duplicate executions.

## Migration Commands

### Basic Commands

```bash
# Run all pending migrations
npm run migrate run

# Run migrations up to a specific version
npm run migrate run 001

# List all migrations and their status
npm run migrate list

# Rollback a specific migration
npm run migrate rollback 002

# Clear entire database (DANGEROUS!)
npm run migrate clear
```

### Production Deployment

```bash
# For initial deployment
npm run deploy:setup

# For updates to existing deployment
npm run migrate run
```

## Migration Structure

Each migration includes:
- **Version**: Sequential version number (001, 002, etc.)
- **Name**: Descriptive name for the migration
- **Description**: What the migration does
- **Up function**: Code to apply the migration
- **Down function**: Code to rollback the migration (optional)

## Current Migrations

### 001 - Initial Setup
- Sets up base database schema
- Creates initial users, roles, and permissions
- Seeds translation system
- **Rollback**: Clears all base data

### 002 - Student Detail Translations
- Adds comprehensive translations for student detail pages
- Updates translation keys for all supported languages
- **Rollback**: Removes student detail translation keys

## Adding New Migrations

To add a new migration, edit `scripts/migration-system.ts` and add to the `migrations` array:

```typescript
{
  version: "003",
  name: "new_feature",
  description: "Add new feature to the system",
  up: async () => {
    // Your migration code here
    console.log("🔧 Adding new feature...");
    
    // Example: Add new translation keys
    const { default: seedTranslations } = await import("../prisma/translation-seed");
    await seedTranslations();
    
    console.log("✅ New feature added");
  },
  down: async () => {
    // Optional rollback code
    console.log("⚠️  Rolling back new feature...");
    // Rollback logic here
    console.log("✅ New feature rolled back");
  }
}
```

## Production Deployment Workflow

### Initial Deployment

1. **Deploy Application**:
   ```bash
   # Deploy to Vercel/your platform
   git push origin main
   ```

2. **Setup Database**:
   ```bash
   # Run initial setup (includes all migrations)
   npm run deploy:setup
   ```

### Updating Existing Deployment

1. **Deploy Code Changes**:
   ```bash
   git push origin main
   ```

2. **Run Migrations**:
   ```bash
   # Connect to production database
   vercel env pull .env.local  # For Vercel
   
   # Run pending migrations
   npm run migrate run
   ```

3. **Regenerate i18n Files** (if translations changed):
   ```bash
   npm run i18n:generate
   ```

## Environment-Specific Commands

### Development
```bash
# Run migrations in development
npm run migrate run

# Reset development database
npm run migrate clear
npm run migrate run
```

### Production (Vercel)
```bash
# Pull production environment
vercel env pull .env.local

# Run migrations on production database
npm run migrate run

# Check migration status
npm run migrate list
```

### Production (Other Platforms)
```bash
# Set production DATABASE_URL
export DATABASE_URL="your-production-database-url"

# Run migrations
npm run migrate run
```

## Safety Features

### Migration Tracking
- Each migration is recorded in the `_migrations` table
- Prevents duplicate execution of migrations
- Tracks when migrations were applied

### Checksums
- Each migration has a checksum to detect changes
- Prevents accidental modification of applied migrations

### Rollback Support
- Migrations can include rollback functions
- Safe way to undo changes if needed
- Not all migrations support rollback (data loss risk)

### Confirmation Prompts
- Dangerous operations require confirmation
- Clear database operation requires typing "CONFIRM"

## Best Practices

### Writing Migrations

1. **Make migrations idempotent**: They should be safe to run multiple times
2. **Test rollbacks**: If you provide a rollback, test it thoroughly
3. **Backup before rollback**: Always backup production data before rollbacks
4. **Small incremental changes**: Keep migrations focused and small

### Deployment Process

1. **Test locally first**: Always test migrations in development
2. **Backup production**: Create database backup before running migrations
3. **Run during maintenance window**: Schedule migrations during low-traffic periods
4. **Monitor after deployment**: Check application health after migrations

### Translation Updates

When updating translations:

1. **Update seed file**: Add new keys to `prisma/translation-seed.ts`
2. **Create migration**: Add migration to run translation seed
3. **Test generation**: Verify `npm run i18n:generate` works
4. **Deploy**: Run migration in production

## Troubleshooting

### Migration Fails
```bash
# Check migration status
npm run migrate list

# If safe, rollback problematic migration
npm run migrate rollback 003

# Fix the issue and try again
npm run migrate run
```

### Database Connection Issues
```bash
# Verify database connection
npx prisma db push

# Check environment variables
echo $DATABASE_URL
```

### Translation Issues
```bash
# Regenerate i18n files
npm run i18n:generate

# Check if translations are in database
npx prisma studio
```

### Emergency Database Reset
```bash
# DANGER: This deletes ALL data
npm run migrate clear

# Rebuild from scratch
npm run migrate run
```

## Monitoring

### Check Migration Status
```bash
npm run migrate list
```

### Verify Database Health
```bash
# Open Prisma Studio
npx prisma studio

# Check specific tables
npx prisma db seed --preview-feature
```

### Application Health
- Monitor application logs after migrations
- Check that translations are loading correctly
- Verify all features work as expected

## Advanced Usage

### Conditional Migrations
```typescript
up: async () => {
  // Check if feature already exists
  const existingFeature = await prisma.someTable.findFirst();
  if (existingFeature) {
    console.log("Feature already exists, skipping...");
    return;
  }
  
  // Apply migration
  // ...
}
```

### Data Migrations
```typescript
up: async () => {
  // Migrate existing data
  const users = await prisma.user.findMany();
  
  for (const user of users) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        // Update user data
      }
    });
  }
}
```

### Complex Rollbacks
```typescript
down: async () => {
  // Backup data before rollback
  const backupData = await prisma.someTable.findMany();
  
  // Store backup somewhere safe
  await fs.writeFile(
    'backup.json', 
    JSON.stringify(backupData, null, 2)
  );
  
  // Perform rollback
  // ...
}
```

## Integration with CI/CD

### GitHub Actions Example
```yaml
name: Deploy with Migrations

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run migrations
        run: npm run migrate run
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

This migration system provides a robust foundation for managing database changes in production while maintaining data integrity and providing rollback capabilities when needed.
