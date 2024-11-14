const fs = require('fs');
const path = require('path');

const { defineConfig } = require('cypress');

module.exports = defineConfig({
  projectId: '244xfm',
  e2e: {
    setupNodeEvents(on, config) {
      on('task', {
        resetDb() {
          const source = path.join(__dirname, 'src/__mocks__/response/initialEvents.json');
          const destination = path.join(__dirname, 'src/__mocks__/response/realEvents.json');
          fs.copyFileSync(source, destination);
          return null;
        },
      });
    },
    defaultCommandTimeout: 10000,
    baseUrl: 'http://localhost:5173',
  },
});
