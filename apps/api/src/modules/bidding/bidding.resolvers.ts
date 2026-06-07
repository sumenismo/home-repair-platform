import type { Resolvers } from '../../generated/resolvers.js'
import { BiddingService } from './bidding.service.js'
import { IdentityService } from '../identity/identity.service.js'
import { ListingsService } from '../listings/listings.service.js'
import { Errors } from '../../shared/errors.js'

export const biddingResolvers: Resolvers = {
  Query: {
    bids: async (_, { jobPostId }, ctx) => {
      const user = await ctx.getUser()
      if (!user) throw Errors.unauthenticated()
      // Only the homeowner of this post can list all bids
      const post = await ListingsService.getJobPost(ctx.sql, jobPostId)
      if (!post) throw Errors.notFound('JobPost')
      if (post.homeownerId !== user.id) throw Errors.forbidden()
      return BiddingService.getBidsForPost(ctx.sql, jobPostId)
    },
    myBids: async (_, __, ctx) => {
      const user = await ctx.getUser()
      if (!user) throw Errors.unauthenticated()
      if (user.role !== 'SERVICE_PROVIDER') throw Errors.forbidden()
      return BiddingService.getBidsForServiceProvider(ctx.sql, user.id)
    },
  },

  Mutation: {
    placeBid: async (_, { jobPostId, message }, ctx) => {
      const user = await ctx.getUser()
      if (!user) throw Errors.unauthenticated()
      if (user.role !== 'SERVICE_PROVIDER') throw Errors.forbidden()
      const post = await ListingsService.getJobPost(ctx.sql, jobPostId)
      if (!post) throw Errors.notFound('JobPost')
      if (post.status !== 'OPEN') throw Errors.badInput('This job post is no longer accepting bids')
      return BiddingService.placeBid(ctx.sql, jobPostId, user.id, message)
    },
    acceptBid: async (_, { bidId }, ctx) => {
      const user = await ctx.getUser()
      if (!user) throw Errors.unauthenticated()
      if (user.role !== 'HOMEOWNER') throw Errors.forbidden()
      return BiddingService.acceptBid(ctx.sql, bidId, user.id)
    },
    rejectBid: async (_, { bidId }, ctx) => {
      const user = await ctx.getUser()
      if (!user) throw Errors.unauthenticated()
      if (user.role !== 'HOMEOWNER') throw Errors.forbidden()
      return BiddingService.rejectBid(ctx.sql, bidId, user.id)
    },
  },

  Bid: {
    createdAt: (bid) => bid.createdAt.toISOString(),
    jobPost: async (bid, _, ctx) => {
      const post = await ListingsService.getJobPost(ctx.sql, bid.jobPostId)
      if (!post) throw Errors.notFound('JobPost')
      return post
    },
    serviceProvider: async (bid, _, ctx) => {
      // Contact details are gated: only visible if the requesting user is the homeowner of this post
      const user = await IdentityService.getUser(ctx.sql, bid.serviceProviderId)
      if (!user) throw Errors.notFound('User')

      const ctxUser = await ctx.getUser()
      const isHomeownerOfPost =
        ctxUser?.role === 'HOMEOWNER' &&
        (await ListingsService.getJobPost(ctx.sql, bid.jobPostId))?.homeownerId === ctxUser.id

      if (!isHomeownerOfPost) {
        // Strip contact details for non-owners
        return { ...user, phone: null, email: '(contact details hidden)' }
      }
      return user
    },
  },
}
