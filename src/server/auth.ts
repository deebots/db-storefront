import { z } from 'zod'
import { createServerFn } from '@tanstack/react-start'
import { getSessionUser, setSession, clearSession, verifyPassword, createUser } from './auth.server'
import type { SessionUser } from './auth.server'

export type { SessionUser }

export const login = createServerFn({ method: 'POST' })
  .validator(z.object({ email: z.string().email(), password: z.string().min(1) }))
  .handler(async ({ data }) => {
    const sessionUser = await verifyPassword(data.email, data.password)
    if (!sessionUser) throw new Error('Invalid credentials')
    setSession(sessionUser)
    return sessionUser
  })

export const register = createServerFn({ method: 'POST' })
  .validator(z.object({
    email: z.string().email(),
    password: z.string().min(8),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
  }))
  .handler(async ({ data }) => {
    const sessionUser = await createUser({
      email: data.email,
      password: data.password,
      firstName: data.firstName ?? null,
      lastName: data.lastName ?? null,
    })
    setSession(sessionUser)
    return sessionUser
  })

export const logout = createServerFn({ method: 'POST' })
  .handler(async () => {
    clearSession()
    return { success: true }
  })

export const getCurrentUser = createServerFn({ method: 'GET' })
  .handler(async () => {
    return getSessionUser()
  })
