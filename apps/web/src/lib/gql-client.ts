import { createClient, fetchExchange } from 'urql'
import { authExchange } from '@urql/exchange-auth'
import { supabase, getAccessToken } from './supabase'

export const gqlClient = createClient({
  url: import.meta.env.VITE_API_URL ?? 'http://localhost:4000/graphql',
  exchanges: [
    authExchange(async (utils) => {
      let token = await getAccessToken()

      supabase.auth.onAuthStateChange((_, session) => {
        token = session?.access_token ?? null
      })

      return {
        addAuthToOperation: (operation) => {
          if (!token) return operation
          return utils.appendHeaders(operation, { Authorization: `Bearer ${token}` })
        },
        willAuthError: () => !token,
        didAuthError: (error) =>
          error.graphQLErrors.some((e) => e.extensions?.code === 'UNAUTHENTICATED'),
        refreshAuth: async () => {
          token = await getAccessToken()
        },
      }
    }),
    fetchExchange,
  ],
})
