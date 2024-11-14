import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    supportFile: 'src/cypress/support/e2e.ts',
    specPattern: 'src/cypress/e2e/**/*.cy.{js,ts,jsx,tsx}', // 테스트 파일 경로 지정
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    defaultCommandTimeout: 10000,
  },
});
