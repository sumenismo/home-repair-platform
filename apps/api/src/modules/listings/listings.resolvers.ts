import type { Resolvers } from '../../generated/resolvers.js'
import { ListingsService } from './listings.service.js'
import { IdentityService } from '../identity/identity.service.js'
import { Errors } from '../../shared/errors.js'

export const listingsResolvers: Resolvers = {
  Query: {
    jobPost: async (_, { id }, ctx) => {
      return ListingsService.getJobPost(ctx.sql, id)
    },
    jobPosts: async (_, { filter }, ctx) => {
      const user = await ctx.getUser()
      if (user?.role === 'SERVICE_PROVIDER') {
        const spProfile = await IdentityService.getServiceProviderProfile(ctx.sql, user.id)
        return ListingsService.getJobPosts(ctx.sql, filter, spProfile?.serviceCities ?? [])
      }
      return ListingsService.getJobPosts(ctx.sql, filter)
    },
    myJobPosts: async (_, __, ctx) => {
      const user = await ctx.getUser()
      if (!user) throw Errors.unauthenticated()
      if (user.role !== 'HOMEOWNER') throw Errors.forbidden()
      return ListingsService.getJobPostsForHomeowner(ctx.sql, user.id)
    },
  },

  Mutation: {
    createJobPost: async (_, { input }, ctx) => {
      const user = await ctx.getUser()
      if (!user) throw Errors.unauthenticated()
      if (user.role !== 'HOMEOWNER') throw Errors.forbidden()
      return ListingsService.createJobPost(ctx.sql, user.id, input)
    },
    closeJobPost: async (_, { id }, ctx) => {
      const user = await ctx.getUser()
      if (!user) throw Errors.unauthenticated()
      if (user.role !== 'HOMEOWNER') throw Errors.forbidden()
      const existing = await ListingsService.getJobPost(ctx.sql, id)
      if (!existing) throw Errors.notFound('JobPost')
      if (existing.homeownerId !== user.id) throw Errors.forbidden()
      return ListingsService.closeJobPost(ctx.sql, id, user.id)
    },
  },

  JobPost: {
    homeowner: async (post, _, ctx) => {
      const user = await IdentityService.getUser(ctx.sql, post.homeownerId)
      if (!user) throw Errors.notFound('User')
      const caller = await ctx.getUser()
      if (!caller) return { ...user, phone: null }
      return user
    },
    createdAt: (post) => post.createdAt.toISOString(),
    updatedAt: (post) => post.updatedAt.toISOString(),
  },
}
