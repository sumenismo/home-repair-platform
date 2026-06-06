import js from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import tseslint from 'typescript-eslint'

export default function baseConfig(tsconfigRootDir) {
  return tseslint.config(
    js.configs.recommended,
    {
      files: ['**/*.ts', '**/*.tsx'],
      extends: tseslint.configs.recommendedTypeChecked,
      languageOptions: {
        parserOptions: {
          project: true,
          tsconfigRootDir,
        },
      },
      rules: {
        '@typescript-eslint/no-unused-vars': [
          'error',
          { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
        ],
      },
    },
    eslintConfigPrettier,
  )
}
