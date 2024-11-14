import { test, expect } from '@playwright/test';
import { exec } from 'child_process';
import waitOn from 'wait-on';
import { promisify } from 'util';

const waitOnPromise = promisify(waitOn);

let serverProcess;

test.describe.serial('e2e 테스트', () => {
  test.beforeAll(async () => {
    serverProcess = exec('pnpm dev');

    await waitOnPromise({
      resources: ['http://localhost:5173'],
      timeout: 10000,
    });
  });

  test('1. 사용자에게 웹서비스가 정상적으로 로드 되어야한다.', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await expect(page).toHaveURL('http://localhost:5173/');
  });

  test.afterAll(() => {
    if (serverProcess) {
      serverProcess.kill();
    }
  });
});
