import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'
import createBaseConfig from './base.js'

export default function reactConfig(tsconfigRootDir) {
  return tseslint.config(
    createBaseConfig(tsconfigRootDir),
    {
      plugins: { 'react-hooks': reactHooks },
      rules: {
        ...reactHooks.configs.recommended.rules,
      },
    },
    {
      // async event handlers (onClick, onSubmit, etc.) are idiomatic in React
      files: ['**/*.ts', '**/*.tsx'],
      plugins: { '@typescript-eslint': tseslint.plugin },
      rules: {
        '@typescript-eslint/no-misused-promises': [
          'error',
          { checksVoidReturn: { attributes: false } },
        ],
      },
    },
  )
}
