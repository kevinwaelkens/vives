# Translation Publish System

This document explains how the translation publish system works and how to set it up.

## Overview

The translation publish system allows administrators to:
1. **Stage translations** - Edit and approve translations in the CMS without affecting the live site
2. **Publish translations** - Deploy approved translations to production with a single click
3. **Track deployments** - Monitor publication history and deployment status

## How It Works

### 1. Translation States

Translations have two important states:
- **`isApproved`**: Translation is ready for publication (set by admins in CMS)
- **`isPublished`**: Translation is live on the production site

### 2. Publication Workflow

```
Draft → Approved → Published → Live
  ↓        ↓         ↓        ↓
 CMS   → Admin    → Publish → Build
       Review     Button    Process
```

1. **Draft**: Translations are created/edited in the CMS
2. **Approved**: Admin marks translations as approved (ready for publication)
3. **Published**: Admin clicks "Publish" button to mark translations as published
4. **Live**: Build process generates static files and deploys to production

### 3. Build Process

When translations are published:

1. **Database Update**: All approved translations are marked as `isPublished: true`
2. **File Generation**: `npm run i18n:build` generates static JSON files from database
3. **Deployment**: Vercel deployment is triggered (optional)
4. **Live Site**: New translations are available on the production site

## Setup Instructions

### 1. Database Migration

The system requires new database fields. Run:

```bash
# Generate Prisma client with new schema
npm run db:generate

# Push schema changes to database
npm run db:push
```

### 2. Environment Variables

Add to your `.env` file:

```bash
# Vercel Deploy Hook (optional)
VERCEL_DEPLOY_HOOK_URL="https://api.vercel.com/v1/integrations/deploy/YOUR_HOOK_ID"
```

To get a Vercel deploy hook:
1. Go to your Vercel project dashboard
2. Settings → Git → Deploy Hooks
3. Create a new deploy hook
4. Copy the URL to your environment variables

### 3. Build Configuration

The build process is already configured in `package.json`:

```json
{
  "scripts": {
    "build": "npm run i18n:generate && npm run i18n:build && prisma generate && next build",
    "i18n:build": "tsx scripts/generate-translations-from-db.ts"
  }
}
```

### 4. Seed Initial Data

If you have existing translations, mark them as published:

```sql
-- Mark all existing approved translations as published
UPDATE "Translation" 
SET "isPublished" = true, "publishedAt" = NOW() 
WHERE "isApproved" = true;
```

## Usage

### For Administrators

1. **Edit Translations**: Use the CMS to create/edit translations
2. **Approve Translations**: Check the "Approved" checkbox for ready translations
3. **Publish**: Click the "Publish" button to deploy approved translations
4. **Monitor**: View publication history and deployment status

### For Developers

1. **Local Development**: Translations are loaded from static files in `lib/i18n/locales/`
2. **Production**: Same static files, but generated from database during build
3. **API Access**: Published translations available via `/api/translations/namespace/[namespace]`

## File Structure

```
lib/i18n/locales/          # Generated translation files
├── en/
│   ├── common.json        # Generated from database
│   ├── groups.json
│   └── ...
├── fr/
│   └── ...
└── ...

scripts/
├── generate-translations-from-db.ts  # Build script
└── ...

src/app/api/translations/
├── publish/route.ts       # Publish API endpoint
└── ...
```

## API Endpoints

### `POST /api/translations/publish`

Publishes all approved translations and triggers deployment.

**Request Body:**
```json
{
  "notes": "Optional release notes",
  "triggerDeployment": true
}
```

**Response:**
```json
{
  "success": true,
  "version": "v1234567890",
  "publishedCount": 150,
  "newTranslations": 25,
  "publicationId": "abc123",
  "deploymentTriggered": true
}
```

### `GET /api/translations/publish`

Gets publication history and unpublished count.

**Response:**
```json
{
  "publications": [
    {
      "id": "abc123",
      "version": "v1234567890",
      "publishedAt": "2024-01-01T12:00:00Z",
      "user": { "name": "Admin", "email": "admin@example.com" },
      "deploymentStatus": "success",
      "notes": "Added new group translations"
    }
  ],
  "unpublishedCount": 5,
  "unapprovedCount": 12
}
```

## Deployment Integration

### Vercel

The system integrates with Vercel deploy hooks:

1. **Automatic**: When translations are published, a deployment is triggered
2. **Build Process**: `npm run build` generates fresh translation files from database
3. **Static Files**: Generated files are included in the deployment

### Other Platforms

For other deployment platforms:

1. **Manual**: Remove `triggerDeployment` or set to `false`
2. **CI/CD**: Integrate the publish API with your CI/CD pipeline
3. **Webhooks**: Use the publication API to trigger your own deployment process

## Troubleshooting

### Translations Not Updating

1. **Check Approval**: Ensure translations are marked as approved in CMS
2. **Check Publication**: Verify translations are published (not just approved)
3. **Check Build**: Ensure `npm run i18n:build` runs during deployment
4. **Check Files**: Verify generated files in `lib/i18n/locales/`

### Deployment Issues

1. **Check Hook URL**: Verify `VERCEL_DEPLOY_HOOK_URL` is correct
2. **Check Permissions**: Ensure the deploy hook has proper permissions
3. **Check Logs**: Review deployment logs in Vercel dashboard
4. **Manual Deploy**: Try manual deployment to test

### Database Issues

1. **Migration**: Ensure database schema is up to date
2. **Permissions**: Verify database user has UPDATE permissions
3. **Indexes**: Check that new indexes are created properly

## Security Considerations

1. **Admin Only**: Only users with `ADMIN` role can publish translations
2. **Audit Trail**: All publications are logged with user and timestamp
3. **Environment Variables**: Keep deploy hook URLs secret
4. **Database Access**: Ensure production database is properly secured

## Performance

1. **Static Files**: Published translations are served as static files (fast)
2. **Build Time**: Translation generation adds ~5-10 seconds to build time
3. **Database Load**: Publication process is optimized with transactions
4. **Caching**: Consider CDN caching for translation files

## Future Enhancements

Potential improvements:
- **Preview Mode**: Preview unpublished translations
- **Rollback**: Ability to rollback to previous publication
- **Staging**: Separate staging and production publications
- **Notifications**: Email/Slack notifications for publications
- **Approval Workflow**: Multi-step approval process
