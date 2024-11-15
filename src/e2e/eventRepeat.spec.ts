import { test, expect } from '@playwright/test';

test.describe('반복 일정 E2E 테스트', () => {
  // let initialEvents: Event;

  test.beforeEach(async ({ page }) => {
    // initialEvents = await readData();
    await page.goto('http://localhost:5173');
  });

  test('반복 간격이 0일 경우 자동으로 1로 설정됨', async ({ page }) => {
    await page.locator('.chakra-checkbox').click();
    await page.getByLabel('반복 유형').selectOption('daily');
    await page.getByLabel('반복 간격').fill('0');

    const repeatInterval = page.getByLabel('반복 간격');
    await expect(repeatInterval).toHaveValue('1');
  });
});
