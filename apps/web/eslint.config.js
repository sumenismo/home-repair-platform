import reactConfig from '@home-repair/eslint-config/react'

export default [
  { ignores: ['dist/', 'src/generated/', 'vitest.config.ts'] },
  ...reactConfig(import.meta.dirname),
]
