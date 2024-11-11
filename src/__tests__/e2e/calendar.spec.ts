import { test, expect } from '@playwright/test';

test('단일 일정 추가 시 이벤트 리스트에 등록한 일정의 정보가 표시된다.', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2024-11-12T10:00:00'));

  await page.goto('http://localhost:5173/');

  await page.getByLabel('제목').fill('테스트 제목');
  await page.getByLabel('날짜').fill('2024-11-15');
  await page.getByLabel('시작 시간').fill('12:00');
  await page.getByLabel('종료 시간').fill('13:00');
  await page.getByLabel('설명').fill('테스트 설명');
  await page.getByLabel('위치').fill('테스트 장소');
  await page.getByLabel('카테고리').selectOption({ label: '개인' });

  await page.getByRole('button', { name: '일정 추가' }).click();

  const eventList = await page.textContent('[data-testid="event-list"]');

  expect(eventList).toContain('테스트 제목');
  expect(eventList).toContain('2024-11-15');
  expect(eventList).toContain('12:00');
  expect(eventList).toContain('13:00');
  expect(eventList).toContain('테스트 설명');
  expect(eventList).toContain('테스트 장소');
  expect(eventList).toContain('개인');
});
