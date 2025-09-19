# School Management System

A comprehensive school management platform built with Next.js 15, TypeScript, Prisma, and TanStack Query. This system manages students, groups, tasks, assessments, and includes features for attendance tracking, bulk operations, and automated notifications.

## Features

- 🎓 **Student Management**: Track students, groups, and parent contacts
- 📚 **Task & Assessment**: Create tasks, grade assessments, provide feedback
- 📊 **Analytics Dashboard**: Performance tracking, attendance reports, grade analytics
- 👥 **Multi-Role System**: Admin, Tutor, Viewer, and Parent roles
- 📧 **Email Notifications**: Automated notifications for tasks, grades, and summaries
- 📁 **Bulk Operations**: Import/export CSV, bulk grading, mass assignments
- 🔒 **Secure Authentication**: JWT-based auth with role-based access control
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile devices

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5
- **State Management**: TanStack Query v5
- **UI Components**: shadcn/ui with Tailwind CSS
- **Email**: Resend with React Email
- **File Storage**: Uploadthing
- **Charts**: Recharts

## Prerequisites

- Node.js 18+ 
- Docker and Docker Compose (for local database)
- npm or yarn package manager

## Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd school-management
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Copy the example environment file:
```bash
cp env.example .env
```

The default `.env` file is configured to work with the Docker PostgreSQL setup:
```env
# Database - PostgreSQL running in Docker
DATABASE_URL="postgresql://school_user:school_password@localhost:5432/school_management"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-replace-in-production"
```

4. **Start the PostgreSQL database with Docker**

```bash
# Start the database container
docker-compose up -d

# Verify it's running
docker-compose ps
```

5. **Set up the database schema**

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push
```

6. **Seed the database** (optional, for demo data)
```bash
npm run db:seed
```

This will create:
- Admin account: `admin@school.com` / `admin123`
- Tutor accounts: `john.tutor@school.com` / `tutor123`
- Sample students, groups, and tasks

6. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run linter
- `npm run format` - Format code
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio

## Project Structure

```
school-management/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Main application pages
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── features/         # Feature-specific components
├── lib/                   # Utility functions
│   ├── auth/             # Authentication utilities
│   └── prisma.ts         # Prisma client
├── data/                  # Data layer
│   ├── api/              # API client functions
│   └── hooks/            # TanStack Query hooks
├── prisma/               # Database schema
│   ├── schema.prisma     # Prisma schema
│   └── seed.ts           # Database seed script
└── types/                # TypeScript type definitions
```

## Database Schema

The system uses the following main entities:
- **User**: System users with different roles
- **Group**: Class groups
- **Student**: Student records
- **Task**: Assignments, quizzes, exams
- **Assessment**: Student submissions and grades
- **Attendance**: Daily attendance tracking
- **ParentContact**: Parent/guardian information

## Authentication

The system uses NextAuth.js with credentials provider. Users can log in with email and password. Different roles have different access levels:

- **Admin**: Full system access
- **Tutor**: Manage students, tasks, and assessments
- **Viewer**: Read-only access
- **Parent**: View their children's information

## API Routes

- `/api/auth/*` - Authentication endpoints
- `/api/students` - Student CRUD operations
- `/api/groups` - Group management
- `/api/tasks` - Task creation and management
- `/api/assessments` - Grading and feedback
- `/api/attendance` - Attendance marking
- `/api/bulk` - Bulk operations

## Development Tips

1. **Database Management**
   - Use Prisma Studio to view and edit data: `npm run db:studio`
   - Reset database: `npx prisma migrate reset`

2. **Type Safety**
   - Types are auto-generated from Prisma schema
   - Run `npm run db:generate` after schema changes

3. **Testing**
   - Use the seeded accounts for testing different roles
   - Check browser console for API errors

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

### Manual Deployment

1. Build the application:
```bash
npm run build
```

2. Set production environment variables

3. Start the server:
```bash
npm run start
```

## Free Hosting Options

- **Frontend**: Vercel (free tier)
- **Database**: Neon PostgreSQL (free tier - 3GB)
- **File Storage**: Uploadthing (free tier - 2GB)
- **Email**: Resend (free tier - 100 emails/day)

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env.local
- Try `npx prisma db push` to sync schema

### Authentication Issues
- Ensure NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches your domain
- Clear cookies and try again

### Build Errors
- Run `npm run db:generate` to regenerate Prisma client
- Delete `.next` folder and rebuild
- Check for TypeScript errors: `npx tsc --noEmit`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License - feel free to use this project for educational or commercial purposes.

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

Built with ❤️ using Next.js, Prisma, and modern web technologies.