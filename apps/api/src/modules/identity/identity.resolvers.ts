import type { Resolvers } from '../../generated/resolvers.js'
import { IdentityService } from './identity.service.js'
import { Errors } from '../../shared/errors.js'

export const identityResolvers: Resolvers = {
  Query: {
    me: async (_, __, ctx) => {
      const user = await ctx.getUser()
      if (!user) return null
      return IdentityService.getUser(ctx.sql, user.id)
    },
  },

  Mutation: {
    registerUser: async (_, { input }, ctx) => {
      if (!ctx.supabaseUser) throw Errors.unauthenticated()
      return IdentityService.createUser(ctx.sql, ctx.supabaseUser.id, ctx.supabaseUser.email, input)
    },
    updateProfile: async (_, { input }, ctx) => {
      const user = await ctx.getUser()
      if (!user) throw Errors.unauthenticated()
      return IdentityService.updateProfile(ctx.sql, user.id, input)
    },
  },

  User: {
    homeownerProfile: async (user, _, ctx) => {
      const caller = await ctx.getUser()
      if (caller?.id !== user.id) return null
      return IdentityService.getHomeownerProfile(ctx.sql, user.id)
    },
    serviceProviderProfile: async (user, _, ctx) => {
      const caller = await ctx.getUser()
      if (!caller) return null
      return IdentityService.getServiceProviderProfile(ctx.sql, user.id)
    },
  },
}
