import { findEventIndexById } from '@utils/findUtil';
import { http, HttpResponse } from 'msw';

import { Event, EventForm } from '../types';
import { notFound } from './handlers';

// ! Hard
// ! 이벤트는 생성, 수정 되면 fetch를 다시 해 상태를 업데이트 합니다. 이를 위한 제어가 필요할 것 같은데요. 어떻게 작성해야 테스트가 병렬로 돌아도 안정적이게 동작할까요?
// ! 아래 이름을 사용하지 않아도 되니, 독립적이게 테스트를 구동할 수 있는 방법을 찾아보세요. 그리고 이 로직을 PR에 설명해주세요.
export const setupMockHandlers = (initEvents = [] as Event[]) => {
  let mockEvents = [...initEvents];

  return [
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
};
