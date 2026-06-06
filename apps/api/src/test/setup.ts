import { sql } from '@home-repair/db'
import { afterAll, beforeEach } from 'vitest'

const dbUrl = process.env.DATABASE_URL ?? ''
if (!dbUrl.includes('_test')) {
  throw new Error(
    `Refusing to run tests: DATABASE_URL must point to a test database (must contain "_test").\nGot: ${dbUrl || '(not set)'}`,
  )
}

beforeEach(async () => {
  // Truncate in reverse dependency order
  await sql`TRUNCATE messages, bids, job_posts, service_provider_profiles, homeowner_profiles, users RESTART IDENTITY CASCADE`
})

afterAll(async () => {
  await sql.end()
})
