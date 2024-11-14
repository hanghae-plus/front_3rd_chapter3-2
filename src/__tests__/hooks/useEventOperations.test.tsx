import { ChakraProvider } from '@chakra-ui/react';
import { render, renderHook, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { ReactElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useEventOperations } from '../../hooks/useEventOperations';
import { generateRepeatingEvents } from '../../hooks/useGenerateRepeatingEvents';
import { server } from '../../setupTests';

const setup = (element: ReactElement) => {
  const user = userEvent.setup();

  return { ...render(<ChakraProvider>{element}</ChakraProvider>), user }; // ? Med: 왜 ChakraProvider로 감싸는지 물어보자
};

// Mock useToast
vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => vi.fn(),
  };
});

describe('useEventOperations', () => {
  const mockEvent = {
    id: '1',
    title: '반복 회의',
    date: '2024-11-20',
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 회의',
    location: '회의실',
    category: '업무',
    repeat: {
      type: 'weekly' as const,
      interval: 1,
      endDate: '2024-12-20',
    },
    notificationTime: 10,
    originalStartDate: '2024-11-20',
  };

  beforeEach(() => {
    server.resetHandlers();
  });

  it('fetchEvents 성공', async () => {
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: [mockEvent] });
      })
    );

    const { result } = renderHook(() => useEventOperations(false, new Date(), vi.fn()));

    await waitFor(() => {
      expect(result.current.events.length).toBeGreaterThan(0);
    });
  });

  it('saveEvent 성공 (신규)', async () => {
    const mockResponse = vi.fn();
    server.use(
      http.post('/api/events', async ({ request }) => {
        const body = await request.json();
        mockResponse(body);
        return HttpResponse.json(body);
      })
    );

    const { result } = renderHook(() => useEventOperations(false, new Date(), vi.fn()));
    await result.current.saveEvent({ ...mockEvent, id: undefined });

    expect(mockResponse).toHaveBeenCalled();
  });

  it('saveEvent 성공 (수정)', async () => {
    const mockResponse = vi.fn();
    server.use(
      http.put('/api/events/:id', async ({ request }) => {
        const body = await request.json();
        mockResponse(body);
        return HttpResponse.json(body);
      })
    );

    const { result } = renderHook(() => useEventOperations(true, new Date(), vi.fn()));
    await result.current.saveEvent(mockEvent);

    expect(mockResponse).toHaveBeenCalled();
  });

  it('deleteEvent 성공', async () => {
    const mockResponse = vi.fn();
    server.use(
      http.delete('/api/events/:id', () => {
        mockResponse();
        return new HttpResponse(null, { status: 204 });
      })
    );

    const { result } = renderHook(() => useEventOperations(false, new Date(), vi.fn()));
    await result.current.deleteEvent('1');

    expect(mockResponse).toHaveBeenCalled();
  });

  it('반복 이벤트 생성', () => {
    const baseEvent = {
      title: 'Test Event',
      date: '2024-01-01',
      repeat: {
        type: 'weekly' as const,
        interval: 1,
        endDate: '2024-01-15',
      },
    };

    const events = generateRepeatingEvents(baseEvent as any, baseEvent.repeat.endDate);
    expect(events.length).toBeGreaterThan(1);
  });

  it('반복 일정 단일 수정', async () => {
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: [mockEvent] });
      }),
      http.put('/api/events/:id', () => {
        return HttpResponse.json({
          ...mockEvent,
          title: '수정된 회의',
          repeat: { type: 'none', interval: 0 },
        });
      })
    );

    const { result } = renderHook(() => useEventOperations(true, new Date(), vi.fn()));
    await result.current.saveEvent({
      ...mockEvent,
      title: '수정된 회의',
    });

    expect(result.current.events).toBeDefined();
  });

  it('반복 일정 단일 삭제', async () => {
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: [mockEvent] });
      }),
      http.delete('/api/events/:id', () => {
        return new HttpResponse(null, { status: 204 });
      })
    );

    const { result } = renderHook(() => useEventOperations(false, new Date(), vi.fn()));
    await result.current.deleteEvent(mockEvent.id, mockEvent);

    expect(result.current.events).toBeDefined();
  });

  it('새 일정 추가', async () => {
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: [] });
      }),
      http.post('/api/events', () => {
        return HttpResponse.json(mockEvent);
      })
    );

    const { result } = renderHook(() => useEventOperations(false, new Date(), vi.fn()));
    await result.current.saveEvent({
      ...mockEvent,
      id: undefined,
    });

    expect(result.current.events).toBeDefined();
  });

  it('에러 처리', async () => {
    server.use(
      http.get('/api/events', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useEventOperations(false, new Date(), vi.fn()));
    await result.current.fetchEvents();

    expect(result.current.events).toEqual([]);
  });
});
