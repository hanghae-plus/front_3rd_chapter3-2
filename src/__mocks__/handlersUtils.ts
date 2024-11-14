import { http, HttpResponse } from 'msw';

import { server } from '../setupTests';
import { Event } from '../types';

// ! Hard 여기 제공 안함
export const setupMockHandlerCreation = (initEvents = [] as Event[]) => {
  const mockEvents: Event[] = [...initEvents];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents });
    }),
    http.post('/api/events', async ({ request }) => {
      const newEvent = (await request.json()) as Event;
      newEvent.id = String(mockEvents.length + 1); // 간단한 ID 생성
      mockEvents.push(newEvent);
      return HttpResponse.json(newEvent, { status: 201 });
    }),
    http.post('/api/events-list', async ({ request }) => {
      const res = await request.json();
      const newEvents = (res as Record<string, Event[]>).events;
      newEvents.forEach((event) => {
        event.id = String(mockEvents.length + 1);
        mockEvents.push(event);
      });
      return HttpResponse.json(newEvents, { status: 201 });
    })
  );
};

export const setupMockHandlerUpdating = (initEvents = [] as Event[]) => {
  const mockEvents: Event[] = [...initEvents];

  server.use(
    http.get('/api/events', () => {
      const res = HttpResponse.json({ events: mockEvents });
      return res;
    }),
    http.post('/api/events-list', async ({ request }) => {
      const res = await request.json();
      const newEvents = (res as Record<string, Event[]>).events;
      newEvents.forEach((event) => {
        event.id = String(mockEvents.length + 1);
        mockEvents.push(event);
      });
      return HttpResponse.json(newEvents, { status: 201 });
    }),
    http.put('/api/events/:id', async ({ params, request }) => {
      const { id } = params;
      const updatedEvent = (await request.json()) as Event;
      const index = mockEvents.findIndex((event) => event.id === id);

      mockEvents[index] = { ...mockEvents[index], ...updatedEvent };
      return HttpResponse.json(mockEvents[index]);
    })
  );
};

export const setupMockHandlerDeletion = (initEvents = [] as Event[]) => {
  const mockEvents: Event[] = [...initEvents];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents });
    }),
    http.post('/api/events-list', async ({ request }) => {
      const res = await request.json();
      const newEvents = (res as Record<string, Event[]>).events;
      newEvents.forEach((event) => {
        event.id = String(mockEvents.length + 1);
        mockEvents.push(event);
      });
      return HttpResponse.json(newEvents, { status: 201 });
    }),
    http.delete('/api/events/:id', ({ params }) => {
      const { id } = params;
      const index = mockEvents.findIndex((event) => event.id === id);

      mockEvents.splice(index, 1);
      return new HttpResponse(null, { status: 204 });
    })
  );
};
