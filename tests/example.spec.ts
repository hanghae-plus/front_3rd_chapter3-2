import { test, expect } from '@playwright/test';

test.describe('캘린더 기본 기능', () => {
  test.describe('캘린더 기본 기능', () => {
    test.beforeAll(async () => {
      // 테스트 시작 전 서버가 준비될 때까지 대기
      await new Promise((resolve) => setTimeout(resolve, 5000));
    });

    test('페이지 로드', async ({ page }) => {
      // 절대 경로 대신 상대 경로 사용
      await page.goto('/');

      // 페이지가 완전히 로드될 때까지 대기
      await page.waitForLoadState('networkidle');

      await expect(page.getByRole('heading', { name: '일정 추가' })).toBeVisible();
    });
  });

  test('반복 일정 생성', async ({ page }) => {
    await page.goto('/');

    // 기본 정보 입력
    await page.getByLabel('제목').fill('심화 과제 테스트');
    await page.getByLabel('날짜').fill('2024-11-15');
    await page.getByLabel('시작 시간').fill('09:00');
    await page.getByLabel('종료 시간').fill('10:00');
    await page.getByLabel('설명').fill('PlayWright 테스트');
    await page.getByLabel('위치').fill('Space');
    await page.getByLabel('카테고리').selectOption('개인');

    // 반복 설정
    await page.locator('.chakra-checkbox__control').click();
    await page.getByLabel('반복 유형').selectOption('daily');

    // 저장 버튼 클릭
    await page.getByTestId('event-submit-button').click({ timeout: 3000 });

    // 이벤트 리스트에서 항목이 나타날 때까지 대기
    // const eventList = page.getByTestId('event-list');
    // await expect(eventList.getByText('심화 과제 테스트')).toBeVisible({ timeout: 10000 });
  });
});
