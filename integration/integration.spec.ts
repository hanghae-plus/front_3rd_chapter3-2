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

  test('1. 반복 일정을 등록할 때, 유저가 설정한 올바른 반복 주기로 등록되어야한다.', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.getByRole('button', { name: '모든 일정 삭제' }).click();
    await page.reload();

    {/* 반복 일정 등록하기 */}
    await page.getByLabel('제목').click();
    await page.getByLabel('제목').fill('정원이랑 경복궁 야간개장');
    await page.getByLabel('날짜').fill('2024-11-13');
    await page.getByLabel('시작 시간').click();
    await page.getByLabel('시작 시간').press('ArrowUp');
    await page.getByLabel('시작 시간').press('ArrowUp');
    await page.getByLabel('시작 시간').press('ArrowRight');
    await page.getByLabel('시작 시간').fill('13:00');
    await page.getByLabel('종료 시간').click();
    await page.getByLabel('종료 시간').press('ArrowUp');
    await page.getByLabel('종료 시간').press('ArrowUp');
    await page.getByLabel('종료 시간').press('ArrowRight');
    await page.getByLabel('종료 시간').fill('22:00');
    await page.getByLabel('설명').click();
    await page.getByLabel('설명').fill('경복궁에서 야간개장 데이트하기');
    await page.getByLabel('위치').click();
    await page.getByLabel('위치').fill('경복궁');
    await page.getByLabel('카테고리').selectOption('개인');
    await page.locator('span').first().click();
    await page.getByLabel('반복 유형').selectOption('monthly');
    await page.getByTestId('event-submit-button').click();

    {/* 반복 일정이 내가 원하는 주기대로 제대로 등록되었는지 확인하기 */}
    await page.getByTestId('event-list').locator('div').filter({ hasText: /^정원이랑 경복궁 야간개장$/ }).click();
    await page.getByTestId('event-list').locator('div').filter({ hasText: '정원이랑 경복궁 야간개장2024-11-1213:00' }).nth(1).click();
  });


  test.afterAll(() => {
    if (serverProcess) {
      serverProcess.kill();
    }
  });
});
