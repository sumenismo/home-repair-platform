import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: './schema/**/*.graphql',
  generates: {
    './src/types.ts': {
      plugins: ['typescript'],
      config: {
        enumsAsTypes: true,
        strictScalars: false,
      },
    },
    '../../apps/api/src/generated/resolvers.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        contextType: '../shared/context.js#Context',
        enumsAsTypes: true,
        useIndexSignature: true,
        mappers: {
          Bid: '../modules/bidding/bidding.service.js#BidRow',
          JobPost: '../modules/listings/listings.service.js#JobPostRow',
          User: '../modules/identity/identity.service.js#UserRow',
          HomeownerProfile: '../modules/identity/identity.service.js#HomeownerProfileRow',
          ServiceProviderProfile:
            '../modules/identity/identity.service.js#ServiceProviderProfileRow',
          Message: '../modules/messaging/messaging.service.js#MessageRow',
        },
      },
    },
    '../../apps/web/src/generated/graphql.ts': {
      documents: '../../apps/web/src/**/*.graphql',
      plugins: ['typescript', 'typescript-operations', 'typescript-urql'],
      config: {
        withHooks: true,
        enumsAsTypes: true,
      },
    },
  },
}

export default config
