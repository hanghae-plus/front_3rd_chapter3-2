import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

import { Event } from '../../entities/event/model/type';
import CalendarView from '../../features/calendar/ui/CalendarView';

describe('CalendarView 컴포넌트', () => {
  const sampleEvents: Event[] = [
    {
      id: '1',
      title: '첫 번째 이벤트',
      date: '2024-11-07',
      startTime: '10:00',
      endTime: '11:00',
      description: '첫 번째 설명',
      location: '서울',
      category: '업무',
      repeat: { type: 'none', interval: 0, endDate: '' },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '두 번째 이벤트',
      date: '2024-11-08',
      startTime: '14:00',
      endTime: '15:00',
      description: '두 번째 설명',
      location: '부산',
      category: '개인',
      repeat: { type: 'weekly', interval: 1, endDate: '2023-12-31' },
      notificationTime: 60,
    },
  ];

  const updatedEvents: Event[] = [
    {
      id: '3',
      title: '세 번째 이벤트',
      date: '2023-11-10',
      startTime: '09:00',
      endTime: '10:00',
      description: '세 번째 설명',
      location: '대전',
      category: '가족',
      repeat: { type: 'monthly', interval: 1, endDate: '2024-11-10' },
      notificationTime: 120,
    },
  ];

  beforeEach(() => {
    vi.setSystemTime('2024-11-01');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const renderComponent = (events: Event[]) =>
    render(
      <ChakraProvider>
        <CalendarView events={events} />
      </ChakraProvider>
    );

  it('초기 events prop에 따라 올바르게 렌더링된다', () => {
    renderComponent(sampleEvents);

    expect(screen.getByText('첫 번째 이벤트')).toBeInTheDocument();

    expect(screen.getByText('두 번째 이벤트')).toBeInTheDocument();
  });

  it('events prop이 변경될 때 올바르게 렌더링된다', () => {
    const { rerender } = renderComponent(sampleEvents);

    expect(screen.getByText('첫 번째 이벤트')).toBeInTheDocument();
    expect(screen.getByText('두 번째 이벤트')).toBeInTheDocument();

    rerender(
      <ChakraProvider>
        <CalendarView events={updatedEvents} />
      </ChakraProvider>
    );

    waitFor(() => {
      expect(screen.queryByText('첫 번째 이벤트')).not.toBeInTheDocument();
      expect(screen.queryByText('두 번째 이벤트')).not.toBeInTheDocument();

      expect(screen.getByText('세 번째 이벤트')).toBeInTheDocument();
    });
  });
});
