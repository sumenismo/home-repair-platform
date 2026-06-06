import { createRemoteJWKSet, jwtVerify } from 'jose'
import { sql } from '@home-repair/db'
import type { AuthUser } from './context.js'

if (!process.env.SUPABASE_URL) {
  throw new Error('SUPABASE_URL must be set in .env')
}

const JWKS = createRemoteJWKSet(
  new URL(`${process.env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`),
)

export type SupabaseUser = { id: string; email: string }

export async function getSupabaseUser(request: Request): Promise<SupabaseUser | null> {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null

  const token = authHeader.slice(7)
  try {
    const { payload } = await jwtVerify(token, JWKS)
    const id = payload.sub
    const email = payload.email as string | undefined
    if (!id || !email) return null
    return { id, email }
  } catch {
    return null
  }
}

export async function getAuthUser(supabaseUser: SupabaseUser | null): Promise<AuthUser | null> {
  if (!supabaseUser) return null
  const [user] = await sql<{ id: string; email: string; role: string }[]>`
    SELECT id, email, role FROM users WHERE id = ${supabaseUser.id}
  `
  if (!user) return null
  return { id: user.id, email: user.email, role: user.role as AuthUser['role'] }
}
