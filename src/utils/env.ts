import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  STRAPI_API_URL: z.string().url().optional(),
  STRAPI_API_TOKEN: z.string().optional(),
  SESSION_SECRET: z.string().min(32),
})

export const env = envSchema.parse(process.env)
