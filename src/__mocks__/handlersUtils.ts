import { http, HttpResponse } from 'msw';

import { server } from '../setupTests';
import { Event, EventForm } from '../types';

// ! Hard
// ! 이벤트는 생성, 수정 되면 fetch를 다시 해 상태를 업데이트 합니다. 이를 위한 제어가 필요할 것 같은데요. 어떻게 작성해야 테스트가 병렬로 돌아도 안정적이게 동작할까요?
// ! 아래 이름을 사용하지 않아도 되니, 독립적이게 테스트를 구동할 수 있는 방법을 찾아보세요. 그리고 이 로직을 PR에 설명해주세요.

export const createRepeatEventResolver = (
  initEvents = [] as Event[],
  events: (EventForm | Event)[]
) => {
  const newEvents = events.map((event, i) => {
    const isRepeatEvent = event.repeat.type !== 'none';
    return {
      ...event,
      id: `${+initEvents[initEvents.length - 1].id + 1}-${i}`,
      repeat: {
        ...event.repeat,
        id: isRepeatEvent ? `repeat-${+initEvents[initEvents.length - 1].id + 1}-${i}` : undefined,
      },
    };
  });
  initEvents.push(...newEvents);
  return { list: initEvents, newEvents: [...initEvents, ...newEvents] };
};

export const updateRepeatEventResolver = (initEvents = [] as Event[], events: Event[]) => {
  let isUpdated = false;
  const newEvents = [...events];
  newEvents.forEach((event) => {
    const eventIndex = initEvents.findIndex((target) => target.id === event.id);
    if (eventIndex > -1) {
      isUpdated = true;
      newEvents[eventIndex] = { ...initEvents[eventIndex], ...event };
    }
  });
  return { updatedEvents: newEvents, isUpdated };
};

// ================================================

export const createEventResolver = (initEvents = [] as Event[], event: EventForm) => {
  const newEventWithId = { ...event, id: `${+initEvents[initEvents.length - 1].id + 1}` };
  initEvents.push(newEventWithId);
  return { list: initEvents, newEventWithId };
};

export const updateEventResolver = (initEvents = [] as Event[], event: Event) => {
  const findEventIndex = initEvents.findIndex((e) => e.id === event.id);
  if (findEventIndex === -1) {
    return { status: 404, message: 'Event not found' };
  }
  const updatedEvent = { ...initEvents[findEventIndex], ...event };
  initEvents[findEventIndex] = updatedEvent;
  return { status: 200, updatedEvent, list: initEvents };
};

export const deleteEventResolver = (initEvents = [] as Event[], id: string) => {
  const findIndex = initEvents.findIndex((e) => e.id === id);
  if (findIndex === -1) {
    return { status: 404, message: 'Event not found' };
  }
  initEvents.splice(findIndex, 1);
  return { status: 204, list: initEvents };
};

// ================================================

export const setupCreateHandler = (initEvents = [] as Event[]) => {
  const _initEvents = [...initEvents];

  server.use(
    http.get('/api/events', async () => {
      return HttpResponse.json({ events: _initEvents });
    }),
    http.post('/api/events', async ({ request }) => {
      const event = (await request.json()) as EventForm;
      const { newEventWithId } = createEventResolver(_initEvents, event);
      return HttpResponse.json(newEventWithId, { status: 201 });
    }),
    http.post('/api/events-list', async ({ request }) => {
      const event = (await request.json()) as { events: EventForm[] };
      const { newEvents } = createRepeatEventResolver(_initEvents, event.events);
      return HttpResponse.json(newEvents, { status: 201 });
    })
  );
};

export const setupUpdateHandler = (initEvents = [] as Event[]) => {
  const _initEvents = [...initEvents];

  server.use(
    http.get('/api/events', async () => {
      return HttpResponse.json({ events: _initEvents });
    }),
    http.put('/api/events/:id', async ({ request }) => {
      const event = (await request.json()) as Event;
      const { updatedEvent, status, message } = updateEventResolver(_initEvents, event);

      if (status === 404) {
        return HttpResponse.json({ message }, { status });
      }

      return HttpResponse.json(updatedEvent, { status });
    }),
    http.put('/api/events-list', async ({ request }) => {
      const event = (await request.json()) as { events: Event[] };
      const { updatedEvents } = updateRepeatEventResolver(_initEvents, event.events);
      return HttpResponse.json(updatedEvents, { status: 200 });
    }),
    http.post('/api/events-list', async ({ request }) => {
      const event = (await request.json()) as { events: EventForm[] };
      const { newEvents } = createRepeatEventResolver(_initEvents, event.events);
      return HttpResponse.json(newEvents, { status: 201 });
    })
  );
};

export const setupDeleteHandler = (initEvents = [] as Event[]) => {
  const _initEvents = [...initEvents];
  server.use(
    http.get('/api/events', async () => {
      return HttpResponse.json({ events: _initEvents });
    }),
    http.delete('/api/events/:id', ({ params }) => {
      const id = params.id as string;
      deleteEventResolver(_initEvents, id);
      return new Response(null, { status: 204 });
    })
  );
};
