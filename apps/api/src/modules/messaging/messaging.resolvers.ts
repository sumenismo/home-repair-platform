import type { Resolvers } from '../../generated/resolvers.js'
import type { Context } from '../../shared/context.js'
import { MessagingService } from './messaging.service.js'
import { IdentityService } from '../identity/identity.service.js'
import { ListingsService } from '../listings/listings.service.js'
import { Errors } from '../../shared/errors.js'

async function assertPartyMembership(
  ctx: Context,
  jobPostId: string,
  serviceProviderId: string,
  user: { id: string; role: string },
) {
  if (user.role === 'SERVICE_PROVIDER') {
    if (user.id !== serviceProviderId) throw Errors.forbidden()
  } else if (user.role === 'HOMEOWNER') {
    const post = await ListingsService.getJobPost(ctx.sql, jobPostId)
    if (!post) throw Errors.notFound('JobPost')
    if (post.homeownerId !== user.id) throw Errors.forbidden()
  } else {
    throw Errors.forbidden()
  }
}

export const messagingResolvers: Resolvers = {
  Query: {
    messages: async (_, { jobPostId, serviceProviderId }, ctx) => {
      const user = await ctx.getUser()
      if (!user) throw Errors.unauthenticated()
      await assertPartyMembership(ctx, jobPostId, serviceProviderId, user)
      return MessagingService.getMessages(ctx.sql, jobPostId, serviceProviderId)
    },
  },

  Mutation: {
    sendMessage: async (_, { jobPostId, recipientId, body }, ctx) => {
      const user = await ctx.getUser()
      if (!user) throw Errors.unauthenticated()
      // Derive serviceProviderId from context: SP is the sender, homeowner is the recipient
      const serviceProviderId = user.role === 'SERVICE_PROVIDER' ? user.id : recipientId
      await assertPartyMembership(ctx, jobPostId, serviceProviderId, user)
      return MessagingService.sendMessage(ctx.sql, jobPostId, user.id, recipientId, body)
    },
  },

  Message: {
    sender: async (message, _, ctx) => {
      const user = await IdentityService.getUser(ctx.sql, message.senderId)
      if (!user) throw Errors.notFound('User')
      return user
    },
  },
}
