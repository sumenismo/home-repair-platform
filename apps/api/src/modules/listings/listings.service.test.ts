import { describe, it, expect } from 'vitest'
import { sql } from '@home-repair/db'
import { ListingsService } from './listings.service.js'
import { createUser, createJobPost, createBid } from '../../test/factories.js'

describe('ListingsService', () => {
  describe('createJobPost', () => {
    it('creates a post with the correct fields', async () => {
      const homeowner = await createUser({ role: 'HOMEOWNER' })

      const post = await ListingsService.createJobPost(sql, homeowner.id, {
        title: 'Fix leaking roof',
        description: 'Water coming through in heavy rain',
        category: 'roofing',
        barangay: 'Fort Bonifacio',
        cityMunicipality: 'Taguig',
        province: 'Metro Manila',
        region: 'NCR',
      })

      expect(post.homeownerId).toBe(homeowner.id)
      expect(post.title).toBe('Fix leaking roof')
      expect(post.category).toBe('roofing')
      expect(post.barangay).toBe('Fort Bonifacio')
      expect(post.cityMunicipality).toBe('Taguig')
      expect(post.province).toBe('Metro Manila')
      expect(post.region).toBe('NCR')
      expect(post.status).toBe('OPEN')
      expect(post.bidCount).toBe(0)
    })

    it('creates a post with null optional fields when omitted', async () => {
      const homeowner = await createUser({ role: 'HOMEOWNER' })

      const post = await ListingsService.createJobPost(sql, homeowner.id, {
        title: 'Fix tap',
        description: 'Dripping tap',
        category: 'plumbing',
      })

      expect(post.barangay).toBeNull()
      expect(post.region).toBeNull()
    })
  })

  describe('getJobPost', () => {
    it('returns null for an unknown id', async () => {
      const post = await ListingsService.getJobPost(sql, '00000000-0000-0000-0000-000000000000')
      expect(post).toBeNull()
    })

    it('returns the post with a live bidCount', async () => {
      const homeowner = await createUser({ role: 'HOMEOWNER' })
      const serviceProvider1 = await createUser({ role: 'SERVICE_PROVIDER' })
      const serviceProvider2 = await createUser({ role: 'SERVICE_PROVIDER' })
      const post = await createJobPost(homeowner.id)

      await createBid(post.id, serviceProvider1.id)
      await createBid(post.id, serviceProvider2.id)

      const fetched = await ListingsService.getJobPost(sql, post.id)
      expect(fetched).not.toBeNull()
      expect(fetched!.id).toBe(post.id)
      expect(fetched!.bidCount).toBe(2)
    })
  })

  describe('getJobPosts', () => {
    it('returns all posts when no filter is given', async () => {
      const homeowner = await createUser({ role: 'HOMEOWNER' })
      await createJobPost(homeowner.id, { category: 'plumbing' })
      await createJobPost(homeowner.id, { category: 'electrical' })

      const posts = await ListingsService.getJobPosts(sql)
      expect(posts.length).toBe(2)
    })

    it('filters by category', async () => {
      const homeowner = await createUser({ role: 'HOMEOWNER' })
      await createJobPost(homeowner.id, { category: 'plumbing' })
      await createJobPost(homeowner.id, { category: 'electrical' })

      const posts = await ListingsService.getJobPosts(sql, { category: 'plumbing' })
      expect(posts.length).toBe(1)
      expect(posts[0].category).toBe('plumbing')
    })

    it('filters by status', async () => {
      const homeowner = await createUser({ role: 'HOMEOWNER' })
      const post = await createJobPost(homeowner.id)
      await ListingsService.closeJobPost(sql, post.id, homeowner.id)

      const openPosts = await ListingsService.getJobPosts(sql, { status: 'OPEN' })
      const closedPosts = await ListingsService.getJobPosts(sql, { status: 'CLOSED' })

      expect(openPosts.length).toBe(0)
      expect(closedPosts.length).toBe(1)
    })
  })

  describe('closeJobPost', () => {
    it('sets status to CLOSED for the owning homeowner', async () => {
      const homeowner = await createUser({ role: 'HOMEOWNER' })
      const post = await createJobPost(homeowner.id)

      const closed = await ListingsService.closeJobPost(sql, post.id, homeowner.id)
      expect(closed.status).toBe('CLOSED')
    })

    it('returns undefined (does not throw) when called by a non-owner', async () => {
      const homeowner = await createUser({ role: 'HOMEOWNER' })
      const other = await createUser({ role: 'HOMEOWNER' })
      const post = await createJobPost(homeowner.id)

      // The service returns undefined; the resolver layer converts this to a notFound error
      const result = await ListingsService.closeJobPost(sql, post.id, other.id)
      expect(result).toBeUndefined()
    })
  })
})
