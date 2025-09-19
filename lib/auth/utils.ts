import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from './config'
import bcrypt from 'bcryptjs'

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }
  return user
}

export async function requireRole(allowedRoles: string[]) {
  const user = await requireAuth()
  if (!allowedRoles.includes(user.role)) {
    redirect('/unauthorized')
  }
  return user
}

export async function requireAdmin() {
  return requireRole(['ADMIN'])
}

export async function requireTutor() {
  return requireRole(['ADMIN', 'TUTOR'])
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return bcrypt.compare(password, hashedPassword)
}
