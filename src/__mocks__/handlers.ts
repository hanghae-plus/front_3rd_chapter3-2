import { http, HttpResponse } from 'msw';

import { Event } from '../types';
import { events } from './response/events.json' assert { type: 'json' };

// ! HARD
// ! 각 응답에 대한 MSW 핸들러를 작성해주세요. GET 요청은 이미 작성되어 있는 events json을 활용해주세요.

// 요구사항에 따라 작성했으나 독립적 테스트 운영 및 적절한 initial events를 상황에 따라 심어주기 위해
// handlerUtils.ts 파일의 setupMockHandler 함수로 대체하여 사용
export const handlers = [
  http.get('/api/events', () => {
    return HttpResponse.json({ events });
  }),

  http.post('/api/events', async ({ request }) => {
    const body = await request.json();

    const newEvent = { ...(body as Event), id: String(events.length + 1) };

    return HttpResponse.json(newEvent, { status: 201 });
  }),

  http.put('/api/events/:id', async ({ request, params }) => {
    const { id } = params;
    const updates = await request.json();

    const eventIndex = events.findIndex((event) => event.id === id);

    if (eventIndex === -1) {
      return HttpResponse.json({ message: 'Event not found' }, { status: 404 });
    }
    return HttpResponse.json(updates);
  }),

  http.delete('/api/events/:id', () => {
    return HttpResponse.json(null, { status: 204 });
  }),
];
