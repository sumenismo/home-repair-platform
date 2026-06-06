import type { Sql } from '@home-repair/db'

export type MessageRow = {
  id: string
  jobPostId: string
  senderId: string
  recipientId: string
  body: string
  createdAt: Date
}

export const MessagingService = {
  async getMessages(sql: Sql, jobPostId: string, serviceProviderId: string): Promise<MessageRow[]> {
    return sql<MessageRow[]>`
      SELECT id, job_post_id, sender_id, recipient_id, body, created_at
      FROM messages
      WHERE job_post_id = ${jobPostId}
        AND (sender_id = ${serviceProviderId} OR recipient_id = ${serviceProviderId})
      ORDER BY created_at ASC
    `
  },

  async sendMessage(
    sql: Sql,
    jobPostId: string,
    senderId: string,
    recipientId: string,
    body: string,
  ): Promise<MessageRow> {
    const [message] = await sql<MessageRow[]>`
      INSERT INTO messages (job_post_id, sender_id, recipient_id, body)
      VALUES (${jobPostId}, ${senderId}, ${recipientId}, ${body})
      RETURNING id, job_post_id, sender_id, recipient_id, body, created_at
    `
    return message
  },
}
