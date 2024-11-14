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

export const setupMockHandlerRepeatUpdating = () => {
  let mockEvents: Event[] = [
    {
      id: '1',
      title: '단일 수정',
      date: '2024-11-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '설명',
      location: '위치',
      category: '업무',
      repeat: { type: 'daily', interval: 1, endDate: '2024-11-17', id: '1' },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '단일 수정',
      date: '2024-11-16',
      startTime: '09:00',
      endTime: '10:00',
      description: '설명',
      location: '위치',
      category: '업무',
      repeat: { type: 'daily', interval: 1, endDate: '2024-11-17', id: '1' },
      notificationTime: 10,
    },
    {
      id: '3',
      title: '단일 수정',
      date: '2024-11-17',
      startTime: '09:00',
      endTime: '10:00',
      description: '설명',
      location: '위치',
      category: '업무',
      repeat: { type: 'daily', interval: 1, endDate: '2024-11-17', id: '1' },
      notificationTime: 10,
    },
  ];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents });
    }),
    http.put('/api/events/:id', async ({ request }) => {
      const updatedEvent = (await request.json()) as Event;
      mockEvents = mockEvents.map((event) =>
        event.id === updatedEvent.id
          ? { ...updatedEvent, repeat: { type: 'none', interval: 0 } }
          : event
      );
      return HttpResponse.json(mockEvents);
    })
  );
};

export const setupMockHandlerRepeatDeletion = () => {
  let mockEvents: Event[] = [
    {
      id: '1',
      title: '단일 삭제',
      date: '2024-11-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '설명',
      location: '위치',
      category: '업무',
      repeat: { type: 'daily', interval: 1, endDate: '2024-11-17', id: '1' },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '단일 삭제',
      date: '2024-11-16',
      startTime: '09:00',
      endTime: '10:00',
      description: '설명',
      location: '위치',
      category: '업무',
      repeat: { type: 'daily', interval: 1, endDate: '2024-11-17', id: '1' },
      notificationTime: 10,
    },
    {
      id: '3',
      title: '단일 삭제',
      date: '2024-11-17',
      startTime: '09:00',
      endTime: '10:00',
      description: '설명',
      location: '위치',
      category: '업무',
      repeat: { type: 'daily', interval: 1, endDate: '2024-11-17', id: '1' },
      notificationTime: 10,
    },
  ];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents });
    }),
    http.delete('/api/events/:id', async ({ params }) => {
      const { id } = params;
      mockEvents = mockEvents.filter((event) => event.id !== id);
      return new HttpResponse(null, { status: 204 });
    })
  );
};
