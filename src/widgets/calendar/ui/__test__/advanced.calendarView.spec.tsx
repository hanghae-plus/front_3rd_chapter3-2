import { ChakraProvider } from '@chakra-ui/react';
import { Event } from '@entities/event/model/types';
import { render, screen } from '@testing-library/react';
import { CalendarView } from '@widgets/calendar/ui';
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../model/hooks', () => ({
  useCalendarView: () => ({
    view: 'month',
    setView: vi.fn(),
    currentDate: new Date('2024-11-15'),
    setCurrentDate: vi.fn(),
    holidays: {},
    navigate: vi.fn(),
  }),
}));

const filteredEvents: Event[] = [
  {
    id: '1',
    title: '팀 미팅',
    date: '2024-11-15',
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 팀 미팅',
    location: '회의실 A',
    category: '업무',
    notificationTime: 10,
    repeat: {
      type: 'none',
      interval: 0,
    },
  },
];

const mockProps = {
  view: 'month',
  setView: vi.fn(),
  navigate: vi.fn(),
  currentDate: new Date('2024-11-15'),
  holidays: {},
  filteredEvents,
  notifiedEvents: ['1'],
};

describe('CalendarView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('달력 컴포넌트가 정상적으로 렌더링되는지 확인', () => {
    render(
      <ChakraProvider>
        <CalendarView {...mockProps} />
      </ChakraProvider>
    );

    expect(screen.getByText('일정 보기')).toBeDefined();
    expect(screen.getByLabelText('Previous')).toBeDefined();
    expect(screen.getByLabelText('Next')).toBeDefined();
    expect(screen.getByLabelText('view')).toBeDefined();
  });

  it('월간 뷰가 기본으로 표시되는지 확인', () => {
    render(
      <ChakraProvider>
        <CalendarView {...mockProps} />
      </ChakraProvider>
    );

    expect(screen.getByTestId('month-view')).toBeDefined();
    expect(screen.queryByTestId('week-view')).toBeNull();
  });
});
