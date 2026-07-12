import { getCookie, setCookie, deleteCookie } from '@tanstack/react-start/server'
import { db } from '#/db'
import { users } from '#/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

const SESSION_COOKIE = 'dl_session'

export interface SessionUser {
  id: number
  email: string
  role: 'customer' | 'admin' | 'superadmin'
  firstName: string | null
  lastName: string | null
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const token = getCookie(SESSION_COOKIE)
  if (!token) return null
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString('utf-8')) as SessionUser
    return payload
  } catch {
    return null
  }
}

export async function requireAuth() {
  const user = await getSessionUser()
  if (!user) throw new Error('Unauthorized')
  return user
}

export async function requireAdmin() {
  const user = await requireAuth()
  if (user.role === 'customer') throw new Error('Forbidden')
  return user
}

export function setSession(user: SessionUser) {
  const token = Buffer.from(JSON.stringify(user)).toString('base64')
  setCookie(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
  })
}

export function clearSession() {
  deleteCookie(SESSION_COOKIE)
}

export async function verifyPassword(email: string, password: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)
  if (!user) return null
  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) return null
  const sessionUser: SessionUser = {
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
  }
  return sessionUser
}

export async function createUser(data: {
  email: string
  password: string
  firstName: string | null
  lastName: string | null
}) {
  const existing = await db.select().from(users).where(eq(users.email, data.email)).limit(1)
  if (existing.length > 0) throw new Error('Email already in use')
  const hash = await bcrypt.hash(data.password, 10)
  const [user] = await db.insert(users).values({
    email: data.email,
    passwordHash: hash,
    firstName: data.firstName,
    lastName: data.lastName,
    role: 'customer',
  }).returning()
  const sessionUser: SessionUser = {
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
  }
  return sessionUser
}
