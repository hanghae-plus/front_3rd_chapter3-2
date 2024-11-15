import { test, expect } from '@playwright/test';
import { readData, writeData } from './db.js';

test.describe('반복 일정 E2E 테스트', () => {
  let initialEvents;

  test.beforeEach(async ({ page }) => {
    // 기본 이벤트 데이터 로드
    initialEvents = await readData();
    await page.goto('http://localhost:5173');
  });

  const fillEventForm = async (page, eventData) => {
    await page.getByLabel('제목').fill(eventData.title);
    await page.getByLabel('날짜').fill(eventData.date);
    await page.getByLabel('시작 시간').fill(eventData.startTime || '10:00');
    await page.getByLabel('종료 시간').fill(eventData.endTime || '11:00');

    if (eventData.repeat?.type !== 'none') {
      await page.locator('.chakra-checkbox').click();
      await page.getByLabel('반복 유형').selectOption(eventData.repeat.type);
      await page.getByLabel('반복 간격').fill(String(eventData.repeat.interval));
      if (eventData.repeat.endDate) {
        await page.getByLabel('반복 종료일').fill(eventData.repeat.endDate);
      }
    }
  };

  const getLastDayOfMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate(); // month는 0부터 시작
  };

  const expectEventOnDate = async (page, date, eventTitle, shouldExist = true) => {
    const [year, month] = date.split('-').map(Number);
    const day = parseInt(date.split('-')[2], 10) || getLastDayOfMonth(year, month - 1);
    console.log(day, 'day');
    const dateCell = page.getByTestId(day.toString());
    console.log(dateCell, 'dateCell');
    if (shouldExist) {
      await expect(dateCell.getByText(eventTitle)).toBeVisible();
    } else {
      await expect(dateCell.getByText(eventTitle)).not.toBeVisible();
    }
  };

  test('반복 간격이 0일 경우 자동으로 1로 설정됨', async ({ page }) => {
    await page.locator('.chakra-checkbox').click();
    await page.getByLabel('반복 유형').selectOption('daily');
    await page.getByLabel('반복 간격').fill('0');

    const repeatInterval = page.getByLabel('반복 간격');
    await expect(repeatInterval).toHaveValue('1');
  });
});
