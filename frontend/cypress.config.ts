import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    retries: { runMode: 1, openMode: 0 },
    env: {
      apiBaseUrl: 'http://localhost:8000/api',
    },
  },
})