import { http, HttpResponse } from 'msw';

import { server } from '../setupTests';
import { Event } from '../types';

// ! Hard
// ! 이벤트는 생성, 수정 되면 fetch를 다시 해 상태를 업데이트 합니다. 이를 위한 제어가 필요할 것 같은데요. 어떻게 작성해야 테스트가 병렬로 돌아도 안정적이게 동작할까요?
// ! 아래 이름을 사용하지 않아도 되니, 독립적이게 테스트를 구동할 수 있는 방법을 찾아보세요. 그리고 이 로직을 PR에 설명해주세요.
export const setupMockHandler = (initEvents = [] as Event[]) => {
  let events = [...initEvents];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events });
    }),

    http.post('/api/events', async ({ request }) => {
      const body = await request.json();

      const newEvent = { ...(body as Event), id: String(events.length + 1) };
      events.push(newEvent);

      return HttpResponse.json(newEvent, { status: 201 });
    }),

    http.put('/api/events/:id', async ({ request, params }) => {
      const { id } = params;

      const updatedEvent = await request.json();
      events = events.map((event) => (event.id === id ? (updatedEvent as Event) : event));

      const eventIndex = events.findIndex((event) => event.id === id);

      if (eventIndex === -1) {
        return HttpResponse.json({ message: 'Event not found' }, { status: 404 });
      }

      return HttpResponse.json(updatedEvent);
    }),

    http.delete('/api/events/:id', ({ params }) => {
      const { id } = params;

      events.splice(
        events.findIndex((event) => event.id === id),
        1
      );

      return new HttpResponse(null, { status: 204 });
    })
  );
};
