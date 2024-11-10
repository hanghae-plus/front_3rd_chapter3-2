import { findEventIndexById } from '@utils/findUtil';
import { http, HttpResponse } from 'msw';

import { Event, EventForm } from '../types';
import { events } from './response/events.json' assert { type: 'json' };

export function notFound() {
  return new HttpResponse(null, { status: 404 });
}

let mockEvents = [...events];
beforeEach(() => {
  mockEvents = [...events]; // 원본 데이터로 초기화
});

export const handlers = [
  // GET: 모든 이벤트 조회
  http.get('/api/events', async () => {
    return HttpResponse.json({ events: mockEvents });
  }),

  // POST: 새로운 이벤트 추가
  http.post('/api/events', async ({ request }) => {
    const newEvent = (await request.json()) as EventForm;
    const updatedEvent = { ...newEvent, id: String(mockEvents.length + 1) };
    mockEvents = [...mockEvents, updatedEvent];
    return HttpResponse.json(updatedEvent, { status: 201 });
  }),

  // PUT: 특정 ID 이벤트 업데이트
  http.put('/api/events/:id', async ({ params, request }) => {
    const { id } = params;
    const updatedEvent = (await request.json()) as Event;
    const index = findEventIndexById(mockEvents, id as string);
    if (index === -1) return notFound();
    mockEvents[index] = { ...mockEvents[index], ...updatedEvent };

    return HttpResponse.json(mockEvents[index]);
  }),

  // DELETE: 특정 ID의 이벤트 삭제
  http.delete('/api/events/:id', ({ params }) => {
    const { id } = params;
    const index = findEventIndexById(mockEvents, id as string);
    if (index === -1) return notFound();

    mockEvents = mockEvents.filter((event) => event.id !== id);
    return new HttpResponse(null, { status: 204 });
  }),
];
