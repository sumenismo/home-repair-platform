import baseConfig from '@home-repair/eslint-config/base'

export default [
  { ignores: ['dist/', 'src/types.ts', 'codegen.ts'] },
  ...baseConfig(import.meta.dirname),
]
