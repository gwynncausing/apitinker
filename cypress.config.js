import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'chrome-extension://YOUR_EXTENSION_ID',
    supportFile: false,
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
  },
})
