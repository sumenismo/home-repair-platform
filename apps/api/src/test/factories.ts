import { randomUUID } from 'node:crypto'
import { sql } from '@home-repair/db'

export async function createUser(
  overrides: {
    role?: 'HOMEOWNER' | 'SERVICE_PROVIDER'
    email?: string
    fullName?: string
  } = {},
) {
  const id = randomUUID()
  const [user] = await sql<{ id: string; email: string; role: string }[]>`
    INSERT INTO users (id, email, role, full_name)
    VALUES (
      ${id},
      ${overrides.email ?? `test-${id}@example.com`},
      ${overrides.role ?? 'HOMEOWNER'},
      ${overrides.fullName ?? 'Test User'}
    )
    RETURNING *
  `
  return user
}

export async function createJobPost(
  homeownerId: string,
  overrides: {
    category?: string
    title?: string
    status?: string
    cityMunicipality?: string
  } = {},
) {
  const [post] = await sql<
    { id: string; homeownerId: string; status: string; cityMunicipality: string | null }[]
  >`
    INSERT INTO job_posts (homeowner_id, title, description, category, city_municipality)
    VALUES (
      ${homeownerId},
      ${overrides.title ?? 'Fix leaking tap'},
      'Needs urgent repair',
      ${overrides.category ?? 'plumbing'},
      ${overrides.cityMunicipality ?? null}
    )
    RETURNING *
  `
  return post
}

export async function createSPProfile(
  userId: string,
  overrides: {
    serviceCities?: string[]
    tradeCategories?: string[]
  } = {},
) {
  const [profile] = await sql<{ userId: string; serviceCities: string[] }[]>`
    INSERT INTO service_provider_profiles (user_id, service_cities, trade_categories)
    VALUES (
      ${userId},
      ${sql.array(overrides.serviceCities ?? [])},
      ${sql.array(overrides.tradeCategories ?? [])}
    )
    ON CONFLICT (user_id) DO UPDATE SET
      service_cities   = EXCLUDED.service_cities,
      trade_categories = EXCLUDED.trade_categories
    RETURNING *
  `
  return profile
}

export async function createBid(jobPostId: string, serviceProviderId: string, message?: string) {
  const [bid] = await sql<
    {
      id: string
      jobPostId: string
      serviceProviderId: string
      status: string
    }[]
  >`
    INSERT INTO bids (job_post_id, service_provider_id, message)
    VALUES (${jobPostId}, ${serviceProviderId}, ${message ?? null})
    RETURNING *
  `
  return bid
}

export async function createMessage(
  jobPostId: string,
  senderId: string,
  recipientId: string,
  body?: string,
) {
  const [message] = await sql<
    {
      id: string
      jobPostId: string
      senderId: string
      recipientId: string
      body: string
    }[]
  >`
    INSERT INTO messages (job_post_id, sender_id, recipient_id, body)
    VALUES (${jobPostId}, ${senderId}, ${recipientId}, ${body ?? 'Hello'})
    RETURNING *
  `
  return message
}
