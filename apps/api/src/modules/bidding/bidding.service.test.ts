import { describe, it, expect } from 'vitest'
import { sql } from '@home-repair/db'
import { BiddingService } from './bidding.service.js'
import { createUser, createJobPost, createBid } from '../../test/factories.js'

describe('BiddingService', () => {
  describe('placeBid', () => {
    it('allows a service provider to place a bid', async () => {
      const homeowner = await createUser({ role: 'HOMEOWNER' })
      const serviceProvider = await createUser({ role: 'SERVICE_PROVIDER' })
      const post = await createJobPost(homeowner.id)

      const bid = await BiddingService.placeBid(
        sql,
        post.id,
        serviceProvider.id,
        'I can fix this today',
      )

      expect(bid.status).toBe('PENDING')
      expect(bid.serviceProviderId).toBe(serviceProvider.id)
      expect(bid.jobPostId).toBe(post.id)
    })

    it('rejects a bid when 5 pending bids already exist', async () => {
      const homeowner = await createUser({ role: 'HOMEOWNER' })
      const post = await createJobPost(homeowner.id)

      for (let i = 0; i < 5; i++) {
        const serviceProvider = await createUser({ role: 'SERVICE_PROVIDER' })
        await createBid(post.id, serviceProvider.id)
      }

      const sixthServiceProvider = await createUser({ role: 'SERVICE_PROVIDER' })
      await expect(BiddingService.placeBid(sql, post.id, sixthServiceProvider.id)).rejects.toThrow(
        'maximum number of bids',
      )
    })

    it('allows a new bid after a rejection frees a slot', async () => {
      const homeowner = await createUser({ role: 'HOMEOWNER' })
      const post = await createJobPost(homeowner.id)

      const serviceProviders = await Promise.all(
        Array.from({ length: 5 }, () => createUser({ role: 'SERVICE_PROVIDER' })),
      )
      const bids = await Promise.all(serviceProviders.map((t) => createBid(post.id, t.id)))

      // Homeowner rejects one
      await BiddingService.rejectBid(sql, bids[0].id, homeowner.id)

      // A new service provider can now bid
      const newServiceProvider = await createUser({ role: 'SERVICE_PROVIDER' })
      const newBid = await BiddingService.placeBid(sql, post.id, newServiceProvider.id)
      expect(newBid.status).toBe('PENDING')
    })

    it('prevents a service provider from bidding twice on the same post', async () => {
      const homeowner = await createUser({ role: 'HOMEOWNER' })
      const serviceProvider = await createUser({ role: 'SERVICE_PROVIDER' })
      const post = await createJobPost(homeowner.id)

      await createBid(post.id, serviceProvider.id)

      await expect(BiddingService.placeBid(sql, post.id, serviceProvider.id)).rejects.toThrow()
    })
  })

  describe('getBidsForPost', () => {
    it('returns an empty array when no bids exist', async () => {
      const homeowner = await createUser({ role: 'HOMEOWNER' })
      const post = await createJobPost(homeowner.id)

      const bids = await BiddingService.getBidsForPost(sql, post.id)
      expect(bids).toEqual([])
    })

    it('returns bids in insertion order', async () => {
      const homeowner = await createUser({ role: 'HOMEOWNER' })
      const post = await createJobPost(homeowner.id)
      const serviceProvider1 = await createUser({ role: 'SERVICE_PROVIDER' })
      const serviceProvider2 = await createUser({ role: 'SERVICE_PROVIDER' })

      const bid1 = await createBid(post.id, serviceProvider1.id)
      const bid2 = await createBid(post.id, serviceProvider2.id)

      const bids = await BiddingService.getBidsForPost(sql, post.id)
      expect(bids.map((b) => b.id)).toEqual([bid1.id, bid2.id])
    })
  })

  describe('rejectBid', () => {
    it('marks the bid as REJECTED', async () => {
      const homeowner = await createUser({ role: 'HOMEOWNER' })
      const serviceProvider = await createUser({ role: 'SERVICE_PROVIDER' })
      const post = await createJobPost(homeowner.id)
      const bid = await createBid(post.id, serviceProvider.id)

      const rejected = await BiddingService.rejectBid(sql, bid.id, homeowner.id)
      expect(rejected.status).toBe('REJECTED')
    })

    it('throws when a non-owner attempts to reject', async () => {
      const homeowner = await createUser({ role: 'HOMEOWNER' })
      const otherHomeowner = await createUser({ role: 'HOMEOWNER' })
      const serviceProvider = await createUser({ role: 'SERVICE_PROVIDER' })
      const post = await createJobPost(homeowner.id)
      const bid = await createBid(post.id, serviceProvider.id)

      await expect(BiddingService.rejectBid(sql, bid.id, otherHomeowner.id)).rejects.toThrow(
        'not authorised',
      )
    })
  })

  describe('getBidsForServiceProvider', () => {
    it('returns an empty array when the service provider has placed no bids', async () => {
      const serviceProvider = await createUser({ role: 'SERVICE_PROVIDER' })

      const bids = await BiddingService.getBidsForServiceProvider(sql, serviceProvider.id)
      expect(bids).toEqual([])
    })

    it('only returns bids belonging to the requesting service provider', async () => {
      const homeowner = await createUser({ role: 'HOMEOWNER' })
      const sp1 = await createUser({ role: 'SERVICE_PROVIDER' })
      const sp2 = await createUser({ role: 'SERVICE_PROVIDER' })
      const post = await createJobPost(homeowner.id)

      const bid1 = await createBid(post.id, sp1.id)
      await createBid(post.id, sp2.id)

      const bids = await BiddingService.getBidsForServiceProvider(sql, sp1.id)
      expect(bids).toHaveLength(1)
      expect(bids[0].id).toBe(bid1.id)
    })

    it('returns bids newest-first', async () => {
      const homeowner = await createUser({ role: 'HOMEOWNER' })
      const sp = await createUser({ role: 'SERVICE_PROVIDER' })
      const post1 = await createJobPost(homeowner.id)
      const post2 = await createJobPost(homeowner.id)

      const bid1 = await createBid(post1.id, sp.id)
      const bid2 = await createBid(post2.id, sp.id)

      const bids = await BiddingService.getBidsForServiceProvider(sql, sp.id)
      expect(bids.map((b) => b.id)).toEqual([bid2.id, bid1.id])
    })
  })

  describe('acceptBid', () => {
    it('marks the bid as accepted and the job post as ACCEPTED', async () => {
      const homeowner = await createUser({ role: 'HOMEOWNER' })
      const serviceProvider = await createUser({ role: 'SERVICE_PROVIDER' })
      const post = await createJobPost(homeowner.id)
      const bid = await createBid(post.id, serviceProvider.id)

      const accepted = await BiddingService.acceptBid(sql, bid.id, homeowner.id)
      expect(accepted.status).toBe('ACCEPTED')

      const [updatedPost] = await sql<{ status: string }[]>`
        SELECT status FROM job_posts WHERE id = ${post.id}
      `
      expect(updatedPost.status).toBe('ACCEPTED')
    })

    it('rejects acceptance from a non-owner', async () => {
      const homeowner = await createUser({ role: 'HOMEOWNER' })
      const otherHomeowner = await createUser({ role: 'HOMEOWNER' })
      const serviceProvider = await createUser({ role: 'SERVICE_PROVIDER' })
      const post = await createJobPost(homeowner.id)
      const bid = await createBid(post.id, serviceProvider.id)

      await expect(BiddingService.acceptBid(sql, bid.id, otherHomeowner.id)).rejects.toThrow(
        'not authorised',
      )
    })
  })
})
