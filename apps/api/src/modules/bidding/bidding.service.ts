import type { Sql } from '@home-repair/db'

const MAX_BIDS_PER_POST = 5

export type BidRow = {
  id: string
  jobPostId: string
  serviceProviderId: string
  status: string
  message: string | null
  createdAt: Date
}

export const BiddingService = {
  async getBidsForPost(sql: Sql, jobPostId: string): Promise<BidRow[]> {
    return sql<BidRow[]>`
      SELECT id, job_post_id, service_provider_id, status, message, created_at
      FROM bids WHERE job_post_id = ${jobPostId}
      ORDER BY created_at ASC
    `
  },

  async placeBid(
    sql: Sql,
    jobPostId: string,
    serviceProviderId: string,
    message?: string | null,
  ): Promise<BidRow> {
    const [{ count }] = await sql<{ count: number }[]>`
      SELECT COUNT(*)::int AS count FROM bids
      WHERE job_post_id = ${jobPostId} AND status = 'PENDING'
    `
    if (count >= MAX_BIDS_PER_POST) {
      throw new Error('This job post has reached its maximum number of bids')
    }

    const [bid] = await sql<BidRow[]>`
      INSERT INTO bids (job_post_id, service_provider_id, message)
      VALUES (${jobPostId}, ${serviceProviderId}, ${message ?? null})
      RETURNING id, job_post_id, service_provider_id, status, message, created_at
    `
    return bid
  },

  async acceptBid(sql: Sql, bidId: string, homeownerId: string): Promise<BidRow> {
    // Verify the homeowner owns the job post this bid belongs to
    const [bid] = await sql<BidRow[]>`
      UPDATE bids SET status = 'ACCEPTED'
      FROM job_posts jp
      WHERE bids.id = ${bidId}
        AND bids.job_post_id = jp.id
        AND jp.homeowner_id = ${homeownerId}
        AND bids.status = 'PENDING'
      RETURNING bids.id, bids.job_post_id, bids.service_provider_id, bids.status, bids.message, bids.created_at
    `
    if (!bid) throw new Error('Bid not found or not authorised')

    // Move job post to ACCEPTED
    await sql`
      UPDATE job_posts SET status = 'ACCEPTED', updated_at = now()
      WHERE id = ${bid.jobPostId}
    `
    return bid
  },

  async rejectBid(sql: Sql, bidId: string, homeownerId: string): Promise<BidRow> {
    const [bid] = await sql<BidRow[]>`
      UPDATE bids SET status = 'REJECTED'
      FROM job_posts jp
      WHERE bids.id = ${bidId}
        AND bids.job_post_id = jp.id
        AND jp.homeowner_id = ${homeownerId}
        AND bids.status = 'PENDING'
      RETURNING bids.id, bids.job_post_id, bids.service_provider_id, bids.status, bids.message, bids.created_at
    `
    if (!bid) throw new Error('Bid not found or not authorised')
    return bid
  },
}
