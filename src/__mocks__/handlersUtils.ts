import { http, HttpResponse } from 'msw';

import { server } from '../setupTests';
import { Event, EventForm } from '../types';

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

export const setupMockHandlerRepeatCreation = () => {
  const mockEvents: Event[] = [];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents });
    }),

    http.post('/api/events-list', async ({ request }) => {
      const { events } = (await request.json()) as { events: EventForm[] };

      events.forEach((event) => {
        mockEvents.push({ ...event, id: String(mockEvents.length + 1) });
      });

      return HttpResponse.json(mockEvents, { status: 201 });
    })
  );
};

export const 반복일정조회모킹 = () => {
  const mockRepeatEvents: Event[] = [
    {
      id: '1',
      title: '데일리 미팅',
      date: '2024-10-14',
      startTime: '09:00',
      endTime: '10:00',
      description: '일일 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { id: '1', type: 'daily', interval: 1, endDate: '2024-10-18' },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '데일리 미팅',
      date: '2024-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '일일 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { id: '1', type: 'daily', interval: 1, endDate: '2024-10-18' },
      notificationTime: 10,
    },
    {
      id: '3',
      title: '데일리 미팅',
      date: '2024-10-16',
      startTime: '09:00',
      endTime: '10:00',
      description: '일일 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { id: '1', type: 'daily', interval: 1, endDate: '2024-10-18' },
      notificationTime: 10,
    },
    {
      id: '4',
      title: '데일리 미팅',
      date: '2024-10-17',
      startTime: '09:00',
      endTime: '10:00',
      description: '일일 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { id: '1', type: 'daily', interval: 1, endDate: '2024-10-18' },
      notificationTime: 10,
    },
    {
      id: '5',
      title: '데일리 미팅',
      date: '2024-10-18',
      startTime: '09:00',
      endTime: '10:00',
      description: '일일 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { id: '1', type: 'daily', interval: 1, endDate: '2024-10-18' },
      notificationTime: 10,
    },
    {
      id: '100',
      title: '월간 미팅',
      date: '2024-10-21',
      startTime: '15:00',
      endTime: '16:00',
      description: '월간 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
  ];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({
        events: mockRepeatEvents,
      });
    })
  );
};

export const 반복일정삭제모킹 = () => {
  const repeatId = '1';

  let mockRepeatEvents: Event[] = [
    {
      id: '1',
      title: '데일리 미팅',
      date: '2024-10-14',
      startTime: '09:00',
      endTime: '10:00',
      description: '일일 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { id: repeatId, type: 'daily', interval: 1, endDate: '2024-10-18' },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '데일리 미팅',
      date: '2024-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '일일 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { id: repeatId, type: 'daily', interval: 1, endDate: '2024-10-18' },
      notificationTime: 10,
    },
    {
      id: '3',
      title: '데일리 미팅',
      date: '2024-10-16',
      startTime: '09:00',
      endTime: '10:00',
      description: '일일 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { id: repeatId, type: 'daily', interval: 1, endDate: '2024-10-18' },
      notificationTime: 10,
    },
    {
      id: '4',
      title: '데일리 미팅',
      date: '2024-10-17',
      startTime: '09:00',
      endTime: '10:00',
      description: '일일 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { id: repeatId, type: 'daily', interval: 1, endDate: '2024-10-18' },
      notificationTime: 10,
    },
    {
      id: '5',
      title: '데일리 미팅',
      date: '2024-10-18',
      startTime: '09:00',
      endTime: '10:00',
      description: '일일 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { id: repeatId, type: 'daily', interval: 1, endDate: '2024-10-18' },
      notificationTime: 10,
    },
  ];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({
        events: mockRepeatEvents,
      });
    }),

    http.delete('/api/events/:id', ({ params }) => {
      const { id } = params;
      // const index = mockRepeatEvents.findIndex((event) => event.id === id);
      // mockRepeatEvents.splice(index, 1);

      mockRepeatEvents = mockRepeatEvents.filter((event) => event.id !== id);

      return new HttpResponse(null, { status: 204 });
    })
  );
};

export const 반복일정수정모킹 = () => {
  const repeatId = '1';

  let mockRepeatEvents: Event[] = [
    {
      id: '1',
      title: '데일리 미팅',
      date: '2024-10-14',
      startTime: '09:00',
      endTime: '10:00',
      description: '일일 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { id: repeatId, type: 'daily', interval: 1, endDate: '2024-10-18' },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '데일리 미팅',
      date: '2024-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '일일 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { id: repeatId, type: 'daily', interval: 1, endDate: '2024-10-18' },
      notificationTime: 10,
    },
    {
      id: '3',
      title: '데일리 미팅',
      date: '2024-10-16',
      startTime: '09:00',
      endTime: '10:00',
      description: '일일 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { id: repeatId, type: 'daily', interval: 1, endDate: '2024-10-18' },
      notificationTime: 10,
    },
    {
      id: '4',
      title: '데일리 미팅',
      date: '2024-10-17',
      startTime: '09:00',
      endTime: '10:00',
      description: '일일 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { id: repeatId, type: 'daily', interval: 1, endDate: '2024-10-18' },
      notificationTime: 10,
    },
    {
      id: '5',
      title: '데일리 미팅',
      date: '2024-10-18',
      startTime: '09:00',
      endTime: '10:00',
      description: '일일 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { id: repeatId, type: 'daily', interval: 1, endDate: '2024-10-18' },
      notificationTime: 10,
    },
  ];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({
        events: mockRepeatEvents,
      });
    }),

    http.put('/api/events/:id', async ({ params, request }) => {
      const { id } = params;
      const updatedEvent = (await request.json()) as Event;
      const index = mockRepeatEvents.findIndex((event) => event.id === id);

      if (index === -1) {
        return new HttpResponse(null, { status: 404 });
      }

      mockRepeatEvents = mockRepeatEvents.map((event) => {
        if (event.id !== id) return event;

        return {
          ...event,
          ...updatedEvent,
        };
      });

      return HttpResponse.json(mockRepeatEvents[index]);
    })
  );
};
