import { describe, it, expect } from 'vitest'
import { randomUUID } from 'node:crypto'
import { sql } from '@home-repair/db'
import { IdentityService } from './identity.service.js'

describe('IdentityService', () => {
  describe('createUser', () => {
    it('creates a user with the correct fields', async () => {
      const id = randomUUID()
      const user = await IdentityService.createUser(sql, id, 'alice@example.com', {
        role: 'HOMEOWNER',
        fullName: 'Alice Smith',
      })

      expect(user.id).toBe(id)
      expect(user.email).toBe('alice@example.com')
      expect(user.role).toBe('HOMEOWNER')
      expect(user.fullName).toBe('Alice Smith')
    })

    it('upserts on conflict — updates email for an existing id', async () => {
      const id = randomUUID()
      await IdentityService.createUser(sql, id, 'first@example.com', { role: 'SERVICE_PROVIDER' })
      const updated = await IdentityService.createUser(sql, id, 'second@example.com', {
        role: 'SERVICE_PROVIDER',
      })

      expect(updated.id).toBe(id)
      expect(updated.email).toBe('second@example.com')
    })
  })

  describe('getUser', () => {
    it('returns null for an unknown id', async () => {
      const user = await IdentityService.getUser(sql, '00000000-0000-0000-0000-000000000000')
      expect(user).toBeNull()
    })

    it('returns the correct user', async () => {
      const id = randomUUID()
      await IdentityService.createUser(sql, id, 'bob@example.com', {
        role: 'SERVICE_PROVIDER',
        fullName: 'Bob Jones',
      })

      const user = await IdentityService.getUser(sql, id)
      expect(user).not.toBeNull()
      expect(user!.email).toBe('bob@example.com')
      expect(user!.role).toBe('SERVICE_PROVIDER')
    })
  })

  describe('getHomeownerProfile', () => {
    it('returns null when no profile exists', async () => {
      const id = randomUUID()
      await IdentityService.createUser(sql, id, 'carol@example.com', { role: 'HOMEOWNER' })

      const profile = await IdentityService.getHomeownerProfile(sql, id)
      expect(profile).toBeNull()
    })

    it('returns the profile after updateProfile creates it', async () => {
      const id = randomUUID()
      await IdentityService.createUser(sql, id, 'carol@example.com', { role: 'HOMEOWNER' })

      await IdentityService.updateProfile(sql, id, {
        address: '12 Main St',
        barangay: 'Poblacion',
        region: 'NCR',
      })

      const profile = await IdentityService.getHomeownerProfile(sql, id)
      expect(profile).not.toBeNull()
      expect(profile!.barangay).toBe('Poblacion')
      expect(profile!.region).toBe('NCR')
    })
  })

  describe('getServiceProviderProfile', () => {
    it('returns null when no profile exists', async () => {
      const id = randomUUID()
      await IdentityService.createUser(sql, id, 'dave@example.com', { role: 'SERVICE_PROVIDER' })

      const profile = await IdentityService.getServiceProviderProfile(sql, id)
      expect(profile).toBeNull()
    })

    it('returns the profile with correct tradeCategories array', async () => {
      const id = randomUUID()
      await IdentityService.createUser(sql, id, 'dave@example.com', { role: 'SERVICE_PROVIDER' })

      await IdentityService.updateProfile(sql, id, {
        businessName: 'Dave Plumbing',
        tin: '123456789000',
        isCompany: false,
        tradeCategories: ['plumbing', 'gas-fitting'],
        bio: 'Experienced plumber',
      })

      const profile = await IdentityService.getServiceProviderProfile(sql, id)
      expect(profile).not.toBeNull()
      expect(profile!.businessName).toBe('Dave Plumbing')
      expect(profile!.tradeCategories).toEqual(['plumbing', 'gas-fitting'])
      expect(profile!.verified).toBe(false)
    })
  })

  describe('updateProfile', () => {
    it('updates fullName and phone on the user row', async () => {
      const id = randomUUID()
      await IdentityService.createUser(sql, id, 'eve@example.com', { role: 'HOMEOWNER' })

      const updated = await IdentityService.updateProfile(sql, id, {
        fullName: 'Eve Updated',
        phone: '0400000001',
      })

      expect(updated.fullName).toBe('Eve Updated')
      expect(updated.phone).toBe('0400000001')
    })

    it('preserves existing fields when omitted (COALESCE behaviour)', async () => {
      const id = randomUUID()
      await IdentityService.createUser(sql, id, 'frank@example.com', { role: 'SERVICE_PROVIDER' })

      await IdentityService.updateProfile(sql, id, {
        businessName: 'Frank Electrical',
        tradeCategories: ['electrical'],
      })

      // Update only bio — businessName should be preserved
      await IdentityService.updateProfile(sql, id, { bio: 'Licensed electrician' })

      const profile = await IdentityService.getServiceProviderProfile(sql, id)
      expect(profile!.businessName).toBe('Frank Electrical')
      expect(profile!.bio).toBe('Licensed electrician')
    })
  })
})
