import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: [
        'src/features/**',
        'src/hooks/**',
        'src/lib/**',
        'src/services/**',
        'src/store/**',
        'src/pages/**',
        'src/components/shared/**',
      ],
      exclude: [
        'src/**/__tests__/**',
        'src/**/*.test.*',
        'src/test/**',
        'src/types/**',
        'src/pages/dashboard/**',
        'src/pages/home/**',
        'src/pages/proposal-create/**',
        'src/hooks/use-mobile.ts',
      ],
    },
  },
})
