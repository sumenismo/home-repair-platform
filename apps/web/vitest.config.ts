import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify('http://localhost:54321'),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify('test-anon-key'),
      'import.meta.env.VITE_API_URL': JSON.stringify('http://localhost:4000/graphql'),
    },
  },
  resolve: {
    alias: { '@': resolve(__dirname, 'src') },
  },
})
