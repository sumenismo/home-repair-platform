import { GraphQLError } from 'graphql'

export const Errors = {
  unauthenticated: () =>
    new GraphQLError('Not authenticated', {
      extensions: { code: 'UNAUTHENTICATED' },
    }),
  forbidden: () =>
    new GraphQLError('Not authorized', {
      extensions: { code: 'FORBIDDEN' },
    }),
  notFound: (entity: string) =>
    new GraphQLError(`${entity} not found`, {
      extensions: { code: 'NOT_FOUND' },
    }),
  badInput: (message: string) =>
    new GraphQLError(message, {
      extensions: { code: 'BAD_USER_INPUT' },
    }),
}
