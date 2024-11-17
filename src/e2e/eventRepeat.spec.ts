import { test, expect } from '@playwright/test';

test.describe('반복 일정 E2E 테스트', () => {
  // let initialEvents: Event;

  test.beforeEach(async ({ page }) => {
    // initialEvents = await readData();
    await page.goto('http://localhost:5173');
  });

  test('반복 간격이 0일 경우 자동으로 1로 설정된다.', async ({ page }) => {
    await page.locator('.chakra-checkbox').click();
    await page.getByLabel('반복 유형').selectOption('daily');
    await page.getByLabel('반복 간격').fill('0');

    const repeatInterval = page.getByLabel('반복 간격');
    await expect(repeatInterval).toHaveValue('1');
  });

  test('반복 종료일이 시작일보다 이전일 때 에러 메시지가 뜬다.', async ({ page }) => {
    await page.locator('label:has-text("제목")').fill('테스트 이벤트');
    await page.locator('label:has-text("날짜")').fill('2024-11-01');
    await page.locator('label:has-text("시작 시간")').fill('10:00');
    await page.locator('label:has-text("종료 시간")').fill('11:00');

    await page.locator('label:has-text("반복 일정")').click();
    await page.locator('label:has-text("반복 유형")').selectOption('monthly');
    await page.locator('label:has-text("반복 종료일")').fill('2024-10-01');

    await page.locator('button:has-text("일정 추가")').click();

    const errorToast = page.locator('.chakra-alert[data-status="error"] .chakra-alert__title');
    await expect(errorToast).toHaveText('반복 종료일이 일정 시작일보다 늦어야 합니다.');
  });
});
