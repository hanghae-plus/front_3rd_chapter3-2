import { http, HttpResponse } from 'msw';

import { events } from '../__mocks__/response/events.json' assert { type: 'json' };
import { Event } from '../types';

export const handlers = [
  http.get('/api/events', () => {
    return HttpResponse.json({ events });
  }),

  http.post('/api/events-list', async ({ request }) => {
    type RequestBody = { events: Event[] };
    const requestBody = (await request.json()) as RequestBody;
    const newEvents = requestBody.events.map((event, index) => {
      const isRepeatEvent = event.repeat.type !== 'none';
      return {
        ...event,
        id: String(index + 1),
        repeat: {
          ...event.repeat,
          id: isRepeatEvent ? String(index + 1) : undefined,
        },
      };
    });

    return HttpResponse.json(newEvents, { status: 201 });
  }),

  http.put('/api/events/:id', async ({ params, request }) => {
    const { id } = params;
    const updatedEvent = (await request.json()) as Event;
    const index = events.findIndex((event) => event.id === id);

    if (index !== -1) {
      return HttpResponse.json({ ...events[index], ...updatedEvent });
    }

    return new HttpResponse(null, { status: 404 });
  }),

  http.delete('/api/events/:id', ({ params }) => {
    const { id } = params;
    const index = events.findIndex((event) => event.id === id);

    if (index !== -1) {
      return new HttpResponse(null, { status: 204 });
    }

    return new HttpResponse(null, { status: 404 });
  }),
];
