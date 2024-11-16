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
    const repeatId = String(events.length);
    newEvents.forEach((event) => {
      const isRepeatEvent = event.repeat.type !== 'none';
      event.id = String(events.length + 1);
      event.repeat.id = isRepeatEvent ? repeatId : undefined;
    });
    return HttpResponse.json(newEvents, { status: 201 });
  }),

  http.put('/api/events-list', async ({ request }) => {
    const updatedEvents = (await request.json()) as Event[];
    const eventsRespose = updatedEvents.reduce((acc: Event[], curr: Event) => {
      const index = events.findIndex((event) => event.id === curr.id);
      if (index !== -1) {
        acc.push({ ...events[index], ...curr });
      }
      return acc;
    }, []);

    if (updatedEvents.length === eventsRespose.length) return HttpResponse.json(eventsRespose);

    return new HttpResponse(null, { status: 404 });
  }),

  http.delete('/api/events-list', async ({ request }) => {
    const deletedEvents = (await request.json()) as Event[];
    const eventsRespose = deletedEvents.reduce((acc: Event[], curr: Event) => {
      const index = events.findIndex((event) => event.id === curr.id);
      if (index === -1) {
        acc.push({ ...events[index], ...curr });
      }
      return acc;
    }, []);

    if (eventsRespose.length === 0) return new HttpResponse(null, { status: 204 });

    return new HttpResponse(null, { status: 404 });
  }),
];
