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
  } = {},
) {
  const [post] = await sql<{ id: string; homeownerId: string; status: string }[]>`
    INSERT INTO job_posts (homeowner_id, title, description, category)
    VALUES (
      ${homeownerId},
      ${overrides.title ?? 'Fix leaking tap'},
      'Needs urgent repair',
      ${overrides.category ?? 'plumbing'}
    )
    RETURNING *
  `
  return post
}

export async function createBid(jobPostId: string, serviceProviderId: string, message?: string) {
  const [bid] = await sql<{
    id: string
    jobPostId: string
    serviceProviderId: string
    status: string
  }[]>`
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
  const [message] = await sql<{
    id: string
    jobPostId: string
    senderId: string
    recipientId: string
    body: string
  }[]>`
    INSERT INTO messages (job_post_id, sender_id, recipient_id, body)
    VALUES (${jobPostId}, ${senderId}, ${recipientId}, ${body ?? 'Hello'})
    RETURNING *
  `
  return message
}
