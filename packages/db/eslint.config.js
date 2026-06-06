import baseConfig from '@home-repair/eslint-config/base'

export default [{ ignores: ['dist/'] }, ...baseConfig(import.meta.dirname)]
