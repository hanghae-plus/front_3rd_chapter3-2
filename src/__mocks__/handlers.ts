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

// app.post('/api/events-list', async (req, res) => {
//   const events = await getEvents();
//   const repeatId = randomUUID();
//   const newEvents = req.body.events.map((event) => {
//     const isRepeatEvent = event.repeat.type !== 'none';
//     return {
//       id: randomUUID(),
//       ...event,
//       repeat: {
//         ...event.repeat,
//         id: isRepeatEvent ? repeatId : undefined,
//       },
//     };
//   });

//   fs.writeFileSync(
//     `${__dirname}/src/__mocks__/response/realEvents.json`,
//     JSON.stringify({
//       events: [...events.events, ...newEvents],
//     })
//   );

//   res.status(201).json(newEvents);
// });

// app.put('/api/events-list', async (req, res) => {
//   const events = await getEvents();
//   let isUpdated = false;

//   const newEvents = [...events.events];
//   req.body.events.forEach((event) => {
//     const eventIndex = events.events.findIndex((target) => target.id === event.id);
//     if (eventIndex > -1) {
//       isUpdated = true;
//       newEvents[eventIndex] = { ...events.events[eventIndex], ...event };
//     }
//   });

//   if (isUpdated) {
//     fs.writeFileSync(
//       `${__dirname}/src/__mocks__/response/realEvents.json`,
//       JSON.stringify({
//         events: newEvents,
//       })
//     );

//     res.json(events.events);
//   } else {
//     res.status(404).send('Event not found');
//   }
// });

// app.delete('/api/events-list', async (req, res) => {
//   const events = await getEvents();
//   const newEvents = events.events.filter((event) => !req.body.eventIds.includes(event.id)); // ? ids를 전달하면 해당 아이디를 기준으로 events에서 제거

//   fs.writeFileSync(
//     `${__dirname}/src/__mocks__/response/realEvents.json`,
//     JSON.stringify({
//       events: newEvents,
//     })
//   );

//   res.status(204).send();
// });
