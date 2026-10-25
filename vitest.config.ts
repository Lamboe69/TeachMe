import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'

// Vitest is configured separately from vite.config.ts because the two tools
// bundle different Vite versions (Vite 8 / rolldown vs. Vitest's Vite 7 /
// rollup), whose plugin types are not interchangeable. Keeping them apart
// avoids a hard-to-diagnose type mismatch at `tsc -b` time.

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    restoreMocks: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
})