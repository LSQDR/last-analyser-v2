// vitest.config.js
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/__tests__/**/*.test.js'],
    coverage: {
      reporter: ['text', 'lcov'],
      include: [
        'src/utils/stats.js',
        'src/utils/computeCPTBlockMetrics.js',
        'src/utils/computeCPTSessionMetrics.js',
        'src/utils/calcSSRT.js',
        'src/utils/computeStroopMetrics.js',
        'src/utils/computeNBackMetrics.js',
      ],
    },
  },
})
