import { test, expect } from '@playwright/test';
import { http } from 'msw';
import { setupServer } from 'msw/node';

import { Event } from '../entities/event/model/type.ts';

const initialEvents: Event[] = [
  {
    id: '1',
    title: '회의',
    date: '2024-10-01',
    startTime: '10:00',
    endTime: '11:00',
    description: 'Description 1',
    location: 'Location 1',
    category: '',
    repeat: { type: 'daily', interval: 1 },
    notificationTime: 30,
  },
];

const server = setupServer(
  http.get('/api/events', (req, res, ctx) => {
    return res(ctx.json({ events: initialEvents }));
  }),
  http.post('/api/events', async (req, res, ctx) => {
    const newEvent = (await req.json()) as Event;
    newEvent.id = (initialEvents.length + 1).toString();
    initialEvents.push(newEvent);
    return res(ctx.status(201), ctx.json(newEvent));
  })
);

test.describe('반복 이벤트 e2e 테스트', () => {
  test.beforeAll(() => {
    server.listen({ onUnhandledRequest: 'bypass' });
  });

  test.afterEach(() => {
    server.resetHandlers();
  });

  test.afterAll(() => {
    server.close();
  });

  test('이벤트 생성 후 목록에 표시되는지 확인', async ({ page }) => {
    await page.goto('http://localhost:5173/');

    const eventList = await page.getByTestId('event-list');

    await page.getByLabel('제목').fill('일정');
    await page.getByLabel('날짜').fill('2024-11-15');
    await page.getByLabel('시작 시간').fill('18:56');
    await page.getByLabel('종료 시간').fill('18:59');
    await page.locator('.chakra-checkbox__control').click();
    await page.getByLabel('반복 유형').selectOption('daily');

    await page.getByTestId('event-submit-button').click();

    server.use(
      http.get('/api/events', (req, res, ctx) => {
        return res(
          ctx.json({
            events: [
              ...initialEvents,
              {
                id: '2',
                title: '일정',
                date: '2024-11-15',
                startTime: '07:22',
                endTime: '07:30',
                location: '',
                category: '',
                repeat: { type: 'daily', interval: 1, endDate: '' },
                notificationTime: 30,
              },
            ],
          })
        );
      })
    );

    await page.reload();
    await expect(eventList).toContainText('일정');
    await expect(eventList).toContainText('2024-11-15');
    await expect(eventList).toContainText('18:56');
    await expect(eventList).toContainText('18:59');
    await expect(eventList).toContainText('1일마다');
    await expect(eventList).toContainText('2024-11-16');
    await expect(eventList).toContainText('2024-11-17');
  });
});
