import type { Sql } from '@home-repair/db'
import type { CreateJobPostInput, JobPostFilter } from '../../generated/resolvers.js'

export type JobPostRow = {
  id: string
  homeownerId: string
  title: string
  description: string
  category: string
  street: string | null
  barangay: string | null
  cityMunicipality: string | null
  province: string | null
  region: string | null
  status: string
  bidCount: number
  createdAt: Date
  updatedAt: Date
}

export const ListingsService = {
  async getJobPost(sql: Sql, id: string): Promise<JobPostRow | null> {
    const [post] = await sql<JobPostRow[]>`
      SELECT jp.*, COUNT(b.id)::int AS bid_count
      FROM job_posts jp
      LEFT JOIN bids b ON b.job_post_id = jp.id AND b.status = 'PENDING'
      WHERE jp.id = ${id}
      GROUP BY jp.id
    `
    return post ?? null
  },

  async getJobPostsForHomeowner(sql: Sql, homeownerId: string): Promise<JobPostRow[]> {
    return sql<JobPostRow[]>`
      SELECT jp.*, COUNT(b.id)::int AS bid_count
      FROM job_posts jp
      LEFT JOIN bids b ON b.job_post_id = jp.id AND b.status = 'PENDING'
      WHERE jp.homeowner_id = ${homeownerId}
      GROUP BY jp.id
      ORDER BY jp.created_at DESC
    `
  },

  async getJobPosts(
    sql: Sql,
    filter?: JobPostFilter | null,
    serviceCities?: string[],
  ): Promise<JobPostRow[]> {
    return sql<JobPostRow[]>`
      SELECT jp.*, COUNT(b.id)::int AS bid_count
      FROM job_posts jp
      LEFT JOIN bids b ON b.job_post_id = jp.id AND b.status = 'PENDING'
      WHERE TRUE
        ${filter?.category ? sql`AND jp.category         = ${filter.category}` : sql``}
        ${filter?.region ? sql`AND jp.region           = ${filter.region}` : sql``}
        ${filter?.province ? sql`AND jp.province         = ${filter.province}` : sql``}
        ${filter?.cityMunicipality ? sql`AND jp.city_municipality = ${filter.cityMunicipality}` : sql``}
        ${filter?.status ? sql`AND jp.status           = ${filter.status}` : sql``}
        ${serviceCities?.length ? sql`AND jp.city_municipality = ANY(${sql.array(serviceCities)})` : sql``}
      GROUP BY jp.id
      ORDER BY jp.created_at DESC
    `
  },

  async createJobPost(
    sql: Sql,
    homeownerId: string,
    input: CreateJobPostInput,
  ): Promise<JobPostRow> {
    const [post] = await sql<JobPostRow[]>`
      INSERT INTO job_posts (homeowner_id, title, description, category, street, barangay, city_municipality, province, region)
      VALUES (
        ${homeownerId},
        ${input.title},
        ${input.description},
        ${input.category},
        ${input.street ?? null},
        ${input.barangay ?? null},
        ${input.cityMunicipality ?? null},
        ${input.province ?? null},
        ${input.region ?? null}
      )
      RETURNING *, 0 AS bid_count
    `
    return post
  },

  async closeJobPost(sql: Sql, id: string, homeownerId: string): Promise<JobPostRow> {
    const [post] = await sql<JobPostRow[]>`
      UPDATE job_posts
      SET status = 'CLOSED', updated_at = now()
      WHERE id = ${id} AND homeowner_id = ${homeownerId}
      RETURNING *, 0 AS bid_count
    `
    return post
  },
}
