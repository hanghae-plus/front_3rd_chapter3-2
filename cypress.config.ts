import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    supportFile: false,
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
});
