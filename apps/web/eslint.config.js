import reactConfig from '@home-repair/eslint-config/react'

export default [
  { ignores: ['dist/', 'src/generated/', 'vitest.config.ts'] },
  ...reactConfig(import.meta.dirname),
  {
    files: ['**/__tests__/**', '**/*.test.ts', '**/*.test.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
    },
  },
]
