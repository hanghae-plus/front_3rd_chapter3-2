import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import { defineConfig as defineTestConfig, mergeConfig } from 'vitest/config';

export default mergeConfig(
  defineConfig({
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },
  }),
  defineTestConfig({
    test: {
      // e2e, integration 디렉토리와 node_modules 디렉토리 내부에 있는 테스트 파일 실행 제외 > 따로 명령어로 분리
      exclude: ['e2e/**', 'integration/**', 'node_modules/**'],
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.ts',
      coverage: {
        reportsDirectory: './.coverage',
        reporter: ['lcov', 'json', 'json-summary'],
      },
      testTimeout: 20000,
    },
  })
);
