import { test, expect } from '@playwright/test';
import { exec } from 'child_process';
import waitOn from 'wait-on';
import { promisify } from 'util';

const waitOnPromise = promisify(waitOn);

let serverProcess;

test.describe.serial('통합 테스트', () => {
  test.beforeAll(async () => {
    serverProcess = exec('pnpm dev');

    await waitOnPromise({
      resources: ['http://localhost:5173'],
      timeout: 10000,
    });
  });


  test.afterAll(() => {
    if (serverProcess) {
      serverProcess.kill();
    }
  });
});
