# 🚀 Deployment Guide

## Prerequisites
- GitHub account
- Supabase account (free)
- Vercel account (free)

## Step 1: Database Setup (Supabase)

1. **Create Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Click "New project"
   - Name: `vives-school-management`
   - Generate a strong database password (save it!)
   - Choose your region
   - Click "Create new project"

2. **Get Database URL**:
   - Go to Project Settings → Database
   - Copy the connection string (URI format)
   - It looks like: `postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres`

## Step 2: Prepare Repository

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Create Environment Variables File**:
   Create `.env.production` with:
   ```env
   DATABASE_URL="your-supabase-connection-string"
   NEXTAUTH_URL="https://your-app-name.vercel.app"
   NEXTAUTH_SECRET="generate-a-long-random-secret-key"
   ```

## Step 3: Deploy to Vercel

1. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub
   - Click "New Project"
   - Import your repository

2. **Configure Environment Variables**:
   - In Vercel dashboard, go to Settings → Environment Variables
   - Add these variables:
     - `DATABASE_URL`: Your Supabase connection string
     - `NEXTAUTH_URL`: Your Vercel app URL (e.g., `https://your-app.vercel.app`)
     - `NEXTAUTH_SECRET`: A long random string (generate with: `openssl rand -base64 32`)

3. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete

## Step 4: Database Migration

After deployment, you need to set up the database:

1. **Run Prisma Commands**:
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Push schema to database
   npx prisma db push
   
   # Seed the database
   npx prisma db seed
   ```

2. **Or use Vercel CLI** (recommended):
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login to Vercel
   vercel login
   
   # Run commands on production
   vercel env pull .env.local
   npx prisma db push
   npx prisma db seed
   ```

## Step 5: Test Deployment

1. Visit your deployed app
2. Try logging in with:
   - Admin: `admin@school.com` / `admin123`
   - Tutor: `john.tutor@school.com` / `tutor123`

## Troubleshooting

### Common Issues:

1. **Build Errors**:
   - Check build logs in Vercel dashboard
   - Ensure all environment variables are set

2. **Database Connection Issues**:
   - Verify DATABASE_URL is correct
   - Check Supabase project is running

3. **Authentication Issues**:
   - Verify NEXTAUTH_URL matches your domain
   - Ensure NEXTAUTH_SECRET is set

### Useful Commands:

```bash
# Check deployment status
vercel --prod

# View logs
vercel logs

# Run database commands on production
vercel env pull .env.local
npx prisma studio --browser none
```

## Free Tier Limits

**Supabase Free Tier**:
- 500MB database storage
- 2GB bandwidth per month
- 50MB file uploads
- 50,000 monthly active users

**Vercel Free Tier**:
- 100GB bandwidth per month
- 100 deployments per day
- Serverless function execution time: 10 seconds

## Next Steps

1. **Custom Domain** (optional):
   - Add your domain in Vercel dashboard
   - Update NEXTAUTH_URL environment variable

2. **Monitoring**:
   - Set up Vercel Analytics
   - Monitor Supabase usage

3. **Backups**:
   - Supabase provides automatic backups
   - Consider exporting data regularly
