import baseConfig from '@home-repair/eslint-config/base'

export default [
  { ignores: ['dist/', 'src/generated/', 'vitest.config.ts'] },
  ...baseConfig(import.meta.dirname),
]
