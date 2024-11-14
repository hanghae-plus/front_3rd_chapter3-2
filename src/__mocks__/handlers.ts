import { http, HttpResponse } from 'msw';

import { events } from '../__mocks__/response/events.json' assert { type: 'json' };
import { Event } from '../types';

export const handlers = [
  http.get('/api/events', () => {
    return HttpResponse.json({ events });
  }),

  http.post('/api/events', async ({ request }) => {
    const newEvent = (await request.json()) as Event;
    newEvent.id = String(events.length + 1);
    return HttpResponse.json(newEvent, { status: 201 });
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

  http.post('/api/events-list', async ({ request }) => {
    const newEvents = (await request.json()) as Event[];
    return HttpResponse.json(newEvents, { status: 200 });
  }),

  http.put('/api/events-list', async ({ request }) => {
    const needUpdateEvents = (await request.json()) as Event[];

    const isEventsAllAvaliable = needUpdateEvents.every(({ id }) => {
      const index = events.findIndex((event) => event.id === id);
      return index !== -1;
    });

    if (!isEventsAllAvaliable) {
      return new HttpResponse(null, { status: 404 });
    }

    const updatedEvents = needUpdateEvents.map((updateEvent) => {
      const { id } = updateEvent;
      const index = events.findIndex((event) => event.id === id);

      return { ...events[index], ...updateEvent };
    });

    return HttpResponse.json(updatedEvents, { status: 200 });
  }),

  http.delete('/api/events-list', async ({ request }) => {
    const needDeleteEventIds = (await request.json()) as Event['id'][];

    const isEventsAllAvaliable = needDeleteEventIds.every((id) => {
      const index = events.findIndex((event) => event.id === id);
      return index !== -1;
    });

    if (!isEventsAllAvaliable) {
      return new HttpResponse(null, { status: 404 });
    }

    const deletedEvents = events.filter((event) => !needDeleteEventIds.includes(event.id));

    return HttpResponse.json(deletedEvents, { status: 200 });
  }),
];
