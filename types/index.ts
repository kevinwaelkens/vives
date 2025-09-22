import type { 
  User, 
  Group, 
  Student, 
  Task, 
  Assessment, 
  Attendance,
  ParentContact,
  Comment,
  Notification,
  Attachment,
  Role,
  StudentStatus,
  TaskType,
  AssessmentStatus,
  AttendanceStatus,
  NotificationType,
  BulkOperationType,
  BulkOperationStatus
} from '@prisma/client'

// Re-export Prisma types
export type {
  User,
  Group,
  Student,
  Task,
  Assessment,
  Attendance,
  ParentContact,
  Comment,
  Notification,
  Attachment,
  Role,
  StudentStatus,
  TaskType,
  AssessmentStatus,
  AttendanceStatus,
  NotificationType,
  BulkOperationType,
  BulkOperationStatus
}

// Extended types with relations
export interface StudentWithRelations extends Student {
  group: Group
  assessments?: (Assessment & { task: Task })[]
  attendance?: Attendance[]
  parentContacts?: ParentContact[]
  _count?: {
    assessments: number
    attendance: number
  }
}

export interface GroupWithRelations extends Group {
  tutors: User[]
  students: Student[]
  tasks?: Task[]
}

export interface TaskWithRelations extends Task {
  groups: Group[]
  students: Student[]
  assessments?: Assessment[]
  attachments?: Attachment[]
}

export interface AssessmentWithRelations extends Assessment {
  task: Task
  student: Student
  comments?: Comment[]
  attachments?: Attachment[]
}

export interface AttendanceWithRelations extends Attendance {
  student: Student
  group: Group
}

// Form types
export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export interface StudentFormData {
  name: string
  email: string
  studentId?: string
  groupId: string
  dateOfBirth?: Date
  notes?: string
}

export interface TaskFormData {
  title: string
  description: string
  instructions?: string
  type: TaskType
  category?: string
  points?: number
  weight?: number
  dueDate?: Date
  groupIds: string[]
  studentIds?: string[]
  allowLateSubmission: boolean
}

export interface AssessmentFormData {
  taskId: string
  studentId: string
  score?: number
  grade?: string
  feedback?: string
  status: AssessmentStatus
}

// API Response types
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Filter types
export interface StudentFilters {
  groupId?: string
  status?: StudentStatus
  search?: string
  page?: number
  pageSize?: number
}

export interface TaskFilters {
  groupId?: string
  type?: TaskType
  isPublished?: boolean
  search?: string
  page?: number
  pageSize?: number
}

export interface AttendanceFilters {
  groupId?: string
  studentId?: string
  date?: Date
  status?: AttendanceStatus
  page?: number
  pageSize?: number
}

// Dashboard statistics
export interface DashboardStats {
  totalStudents: number
  totalGroups: number
  totalTasks: number
  pendingAssessments: number
  todayAttendance: {
    present: number
    absent: number
    late: number
    excused: number
  }
  recentActivity: Activity[]
}

export interface Activity {
  id: string
  type: 'task_created' | 'assessment_submitted' | 'grade_released' | 'attendance_marked'
  description: string
  timestamp: Date
  userId?: string
  metadata?: Record<string, any>
}

// Chart data types
export interface ChartDataPoint {
  name: string
  value: number
}

export interface AttendanceChartData {
  date: string
  present: number
  absent: number
  late: number
  excused: number
}

export interface GradeDistribution {
  grade: string
  count: number
  percentage: number
}
