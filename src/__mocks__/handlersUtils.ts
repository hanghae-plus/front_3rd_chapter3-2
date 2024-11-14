import { Event } from '@entities/event/model/types';
import { http, HttpResponse } from 'msw';

import { server } from '../setupTests';

export const setupMockHandlers = (initEvents: Event[] = []) => {
  let mockEvents = [...initEvents];

  server.use(
    // 조회 - 항상 최신 mockEvents 상태 반환
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents });
    }),

    // 생성시 여러 이벤트 처리
    http.post('/api/events-list', async ({ request }) => {
      const body = (await request.json()) as { events: Event[] };

      body.events.forEach((event: Event) => {
        mockEvents.push({
          ...event,
          id: String(mockEvents.length + 1),
          repeat: {
            ...event.repeat,
          },
        });
      });

      return HttpResponse.json(body.events, { status: 201 });
    }),

    // 생성
    http.post('/api/events', async ({ request }) => {
      const newEvent = (await request.json()) as Event;
      newEvent.id = String(mockEvents.length + 1);
      mockEvents = [...mockEvents, newEvent];
      return HttpResponse.json(newEvent, { status: 201 });
    }),

    // 수정
    http.put('/api/events/:id', async ({ params, request }) => {
      const { id } = params;
      const updatedEvent = (await request.json()) as Event;
      mockEvents = mockEvents.map((event) => (event.id === id ? updatedEvent : event));
      return HttpResponse.json(updatedEvent);
    }),

    // 삭제
    http.delete('/api/events/:id', ({ params }) => {
      const { id } = params;
      mockEvents = mockEvents.filter((event) => event.id !== id);
      return new HttpResponse(null, { status: 204 });
    })
  );
  return {
    // 핸들러 초기화
    reset: () => {
      mockEvents = [...initEvents];
      server.resetHandlers();
    },
    // 현재 상태 확인 (테스트용)
    getCurrentEvents: () => [...mockEvents],
  };
};

export const setupMockHandlerCreation = (initEvents: Event[] = []) => {
  return setupMockHandlers(initEvents);
};

export const setupMockHandlerUpdating = (initEvents: Event[] = []) => {
  return setupMockHandlers(initEvents);
};

export const setupMockHandlerDeletion = (initEvents: Event[] = []) => {
  return setupMockHandlers(initEvents);
};
