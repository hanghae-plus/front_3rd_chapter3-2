import { http, HttpResponse } from 'msw';

import { events } from '../__mocks__/response/events.json' assert { type: 'json' };
import { Event } from '../entities/event/model/type.ts';

export const handlers = [
  http.get('/api/events', () => {
    return HttpResponse.json({ events });
  }),

  http.post('/api/events', async ({ request }) => {
    const newEvent = (await request.json()) as Event;
    newEvent.id = (events.length + 1).toString(); // 새로운 ID 생성

    return HttpResponse.json(newEvent, { status: 201 });
  }),

  http.put('/api/events/:id', async ({ params, request }) => {
    const { id } = params;
    const updatedEvent = (await request.json()) as Event;
    const eventIndex = events.findIndex((event) => event.id === id);

    if (eventIndex !== -1) {
      return HttpResponse.json({ ...events[eventIndex], ...updatedEvent });
    }

    return new HttpResponse(null, { status: 404 });
  }),

  http.delete('/api/events/:id', ({ params }) => {
    const { id } = params;
    const eventIndex = events.findIndex((event) => event.id === id);

    if (eventIndex !== -1) {
      return new HttpResponse(null, { status: 204 });
    }

    return new HttpResponse(null, { status: 404 });
  }),

  http.post('/api/events-list', async ({ request }) => {
    const newEvents = (await request.json()) as Event[];
    const repeatId = `repeat-${Date.now()}`;

    const createdEvents = newEvents.map((event, index) => {
      const isRepeatEvent = event.repeat.type !== 'none';
      return {
        ...event,
        id: (events.length + index + 1).toString(),
        repeat: {
          ...event.repeat,
          id: isRepeatEvent ? repeatId : undefined,
        },
      };
    });

    events.push(...createdEvents);

    return HttpResponse.json(createdEvents, { status: 201 });
  }),

  http.put('/api/events-list', async ({ request }) => {
    const updatedEvents = (await request.json()) as Event[];
    let isUpdated = false;

    updatedEvents.forEach((updatedEvent) => {
      const eventIndex = events.findIndex((event) => event.id === updatedEvent.id);

      if (eventIndex !== -1) {
        events[eventIndex] = { ...events[eventIndex], ...updatedEvent };
        isUpdated = true;
      }
    });

    return isUpdated
      ? HttpResponse.json(events, { status: 200 })
      : HttpResponse.json(null, { status: 404 });
  }),

  http.delete('/api/events-list', async ({ request }) => {
    const { eventIds } = await request.json();
    const initialLength = events.length;

    const remainingEvents = events.filter((event) => !eventIds.includes(event.id));

    const eventsDeleted = initialLength !== remainingEvents.length;

    events.splice(0, events.length, ...remainingEvents);

    return eventsDeleted
      ? new HttpResponse(null, { status: 204 })
      : new HttpResponse(null, { status: 404 });
  }),
];
