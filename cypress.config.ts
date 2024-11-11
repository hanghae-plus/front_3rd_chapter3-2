const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // Node 이벤트 리스너 구현
    },
    baseUrl: 'http://localhost:5173',
  },
});
