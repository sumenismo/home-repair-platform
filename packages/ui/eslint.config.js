import reactConfig from '@home-repair/eslint-config/react'

export default [
  { ignores: ['storybook-static/'] },
  ...reactConfig(import.meta.dirname),
]
