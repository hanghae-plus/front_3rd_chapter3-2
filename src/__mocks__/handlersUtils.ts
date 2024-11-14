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
    })
  );
};

export const setupMockHandlerUpdating = () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '기존 회의',
      date: '2024-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '기존 회의2',
      date: '2024-10-15',
      startTime: '11:00',
      endTime: '12:00',
      description: '기존 팀 미팅 2',
      location: '회의실 C',
      category: '업무 회의',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 5,
    },
  ];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents });
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

export const setupMockHandlerDeletion = () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '삭제할 이벤트',
      date: '2024-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '삭제할 이벤트입니다',
      location: '어딘가',
      category: '기타',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents });
    }),
    http.delete('/api/events/:id', ({ params }) => {
      const { id } = params;
      const index = mockEvents.findIndex((event) => event.id === id);

      mockEvents.splice(index, 1);
      return new HttpResponse(null, { status: 204 });
    })
  );
};

export const setupMockHandlerBulkCreation = () => {
  const mockEvents: Event[] = [];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents });
    }),
    http.post('/api/events-list', async ({ request }) => {
      const body = (await request.json()) as { events: Event[] };
      const newEvents = body.events.map((event, index) => {
        const isRepeatEvent = event.repeat.type !== 'none';
        const repeatId = isRepeatEvent ? String(mockEvents.length + 1) : undefined;
        return {
          ...event,
          id: String(mockEvents.length + index + 1),
          repeat: {
            ...event.repeat,
            id: repeatId,
          },
        };
      });
      mockEvents.push(...newEvents);
      return HttpResponse.json(newEvents, { status: 201 });
    })
  );
};

export const setupMockHandlerBulkUpdating = () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '수정할 회의 1',
      date: '2024-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '수정할 팀 미팅 1',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '수정할 회의 2',
      date: '2024-10-15',
      startTime: '11:00',
      endTime: '12:00',
      description: '수정할 팀 미팅 2',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 5,
    },
  ];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents });
    }),
    http.put('/api/events-list', async ({ request }) => {
      const body = (await request.json()) as { events: Event[] };
      let isUpdated = false;

      body.events.forEach((event) => {
        const index = mockEvents.findIndex((target) => target.id === event.id);
        if (index !== -1) {
          isUpdated = true;
          mockEvents[index] = { ...mockEvents[index], ...event };
        }
      });

      if (isUpdated) {
        return HttpResponse.json(mockEvents);
      }
      return HttpResponse.json({ message: 'Event not found' }, { status: 404 });
    })
  );
};

export const setupMockHandlerBulkDeletion = () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '삭제할 회의 1',
      date: '2024-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '삭제할 팀 미팅 1',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '삭제할 회의 2',
      date: '2024-10-15',
      startTime: '11:00',
      endTime: '12:00',
      description: '삭제할 팀 미팅 2',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 5,
    },
  ];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents });
    }),
    http.delete('/api/events-list', async ({ request }) => {
      const body = (await request.json()) as { eventIds: string[] };
      const hasEvent = mockEvents.some((event) => body.eventIds.includes(event.id));

      if (hasEvent) {
        mockEvents.length = 0;
        return new HttpResponse(null, { status: 204 });
      }
      return new HttpResponse(null, { status: 404 });
    })
  );
};
