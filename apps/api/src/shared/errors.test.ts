import { describe, it, expect } from 'vitest'
import { GraphQLError } from 'graphql'
import { Errors } from './errors.js'

describe('Errors', () => {
  it('unauthenticated returns a GraphQLError with code UNAUTHENTICATED', () => {
    const err = Errors.unauthenticated()
    expect(err).toBeInstanceOf(GraphQLError)
    expect(err.extensions.code).toBe('UNAUTHENTICATED')
  })

  it('forbidden returns a GraphQLError with code FORBIDDEN', () => {
    const err = Errors.forbidden()
    expect(err).toBeInstanceOf(GraphQLError)
    expect(err.extensions.code).toBe('FORBIDDEN')
  })

  it('notFound includes the entity name and code NOT_FOUND', () => {
    const err = Errors.notFound('JobPost')
    expect(err).toBeInstanceOf(GraphQLError)
    expect(err.message).toContain('JobPost')
    expect(err.extensions.code).toBe('NOT_FOUND')
  })

  it('badInput uses the provided message and code BAD_USER_INPUT', () => {
    const err = Errors.badInput('too short')
    expect(err).toBeInstanceOf(GraphQLError)
    expect(err.message).toBe('too short')
    expect(err.extensions.code).toBe('BAD_USER_INPUT')
  })
})
