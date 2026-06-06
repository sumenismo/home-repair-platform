import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2')
  })

  it('resolves tailwind conflicts — last value wins', () => {
    expect(cn('px-4', 'px-8')).toBe('px-8')
  })

  it('ignores falsy values', () => {
    // eslint-disable-next-line no-constant-binary-expression
    expect(cn('px-4', false && 'py-2', undefined, null, '')).toBe('px-4')
  })

  it('handles conditional classes', () => {
    const isActive = true
    expect(cn('base', isActive && 'active')).toBe('base active')
  })
})
