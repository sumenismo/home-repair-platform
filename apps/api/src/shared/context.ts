import type { YogaInitialContext } from 'graphql-yoga'
import { sql } from '@home-repair/db'
import { getSupabaseUser, getAuthUser, type SupabaseUser } from './auth.js'

export type AuthUser = {
  id: string
  email: string
  role: 'HOMEOWNER' | 'SERVICE_PROVIDER'
}

export type Context = {
  supabaseUser: SupabaseUser | null
  getUser: () => Promise<AuthUser | null>
  sql: typeof sql
}

export async function buildContext(ctx: YogaInitialContext): Promise<Context> {
  const supabaseUser = await getSupabaseUser(ctx.request)
  let userPromise: Promise<AuthUser | null> | undefined
  return {
    supabaseUser,
    getUser: () => {
      if (!userPromise) userPromise = getAuthUser(supabaseUser)
      return userPromise
    },
    sql,
  }
}
