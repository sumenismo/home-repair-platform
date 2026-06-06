import { createSchema } from 'graphql-yoga'
import { typeDefs } from '@home-repair/gql'
import type { Context } from './shared/context.js'
import { identityResolvers } from './modules/identity/identity.resolvers.js'
import { listingsResolvers } from './modules/listings/listings.resolvers.js'
import { biddingResolvers } from './modules/bidding/bidding.resolvers.js'
import { messagingResolvers } from './modules/messaging/messaging.resolvers.js'

export const schema = createSchema<Context>({
  typeDefs,
  resolvers: [identityResolvers, listingsResolvers, biddingResolvers, messagingResolvers],
})
