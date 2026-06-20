import { describe, it, expect } from 'vitest'
import { sql } from '@home-repair/db'
import { MessagingService } from './messaging.service.js'
import { createUser, createJobPost, createMessage } from '../../test/factories.js'

describe('MessagingService', () => {
  describe('sendMessage', () => {
    it('persists a message with the correct fields', async () => {
      const homeowner = await createUser({ role: 'HOMEOWNER' })
      const serviceProvider = await createUser({ role: 'SERVICE_PROVIDER' })
      const post = await createJobPost(homeowner.id)

      const message = await MessagingService.sendMessage(
        sql,
        post.id,
        homeowner.id,
        serviceProvider.id,
        'Is Tuesday okay?',
      )

      expect(message.jobPostId).toBe(post.id)
      expect(message.senderId).toBe(homeowner.id)
      expect(message.recipientId).toBe(serviceProvider.id)
      expect(message.body).toBe('Is Tuesday okay?')
    })
  })

  describe('getMessages', () => {
    it('returns an empty array when no messages exist', async () => {
      const homeowner = await createUser({ role: 'HOMEOWNER' })
      const serviceProvider = await createUser({ role: 'SERVICE_PROVIDER' })
      const post = await createJobPost(homeowner.id)

      const messages = await MessagingService.getMessages(sql, post.id, serviceProvider.id)
      expect(messages).toEqual([])
    })

    it('returns messages in ascending chronological order', async () => {
      const homeowner = await createUser({ role: 'HOMEOWNER' })
      const serviceProvider = await createUser({ role: 'SERVICE_PROVIDER' })
      const post = await createJobPost(homeowner.id)

      const m1 = await createMessage(post.id, homeowner.id, serviceProvider.id, 'First')
      const m2 = await createMessage(post.id, serviceProvider.id, homeowner.id, 'Second')

      const messages = await MessagingService.getMessages(sql, post.id, serviceProvider.id)
      expect(messages.map((m) => m.id)).toEqual([m1.id, m2.id])
    })

    it('filters to messages where serviceProviderId is sender or recipient', async () => {
      const homeowner = await createUser({ role: 'HOMEOWNER' })
      const serviceProvider = await createUser({ role: 'SERVICE_PROVIDER' })
      const otherServiceProvider = await createUser({ role: 'SERVICE_PROVIDER' })
      const post = await createJobPost(homeowner.id)

      await createMessage(post.id, homeowner.id, serviceProvider.id, 'For service provider')
      await createMessage(
        post.id,
        homeowner.id,
        otherServiceProvider.id,
        'For other service provider',
      )

      const messages = await MessagingService.getMessages(sql, post.id, serviceProvider.id)
      expect(messages.length).toBe(1)
      expect(messages[0].body).toBe('For service provider')
    })
  })
})
