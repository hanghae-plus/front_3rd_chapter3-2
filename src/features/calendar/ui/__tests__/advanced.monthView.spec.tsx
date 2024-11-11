import { ChakraProvider } from '@chakra-ui/react';
import { Event } from '@entities/event/model/types';
import { MonthView } from '@features/calendar/ui';
import { render, screen } from '@testing-library/react';

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

const holidays = {
  '2024-11-01': '개천절',
};

interface RenderAppProps {
  currentDate: Date;
  holidays: Record<string, string>;
  notifiedEvents: string[];
  filteredEvents: Event[];
}

const renderApp = (props: RenderAppProps) => {
  return render(
    <ChakraProvider>
      <MonthView {...props} />
    </ChakraProvider>
  );
};

describe('MonthView', () => {
  const mockProps = {
    currentDate: new Date('2024-11-15'),
    holidays,
    notifiedEvents: ['1'],
    filteredEvents,
  };
  it('월간 보기 컴포넌트가 정상적으로 렌더링되는지 확인', () => {
    renderApp(mockProps);
    expect(screen.getByTestId('month-view')).toBeInTheDocument();
    expect(screen.getByText('2024년 11월')).toBeInTheDocument();
  });

  it('요일 헤더가 모두 표시되는지 확인', () => {
    renderApp(mockProps);
    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
    weekDays.forEach((day) => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });

  it('공휴일이 올바르게 표시되는지 확인', () => {
    renderApp(mockProps);
    expect(screen.getByText('개천절')).toBeInTheDocument();
  });

  it('일정이 올바른 스타일로 표시되는지 확인', () => {
    renderApp(mockProps);
    const eventElement = screen.getByText('팀 미팅');
    expect(eventElement).toBeInTheDocument();

    const eventContainer = eventElement.closest('div');
    expect(eventContainer).toHaveStyle({
      backgroundColor: 'var(--chakra-colors-red-100)',
    });
  });

  it('알림이 설정된 일정에 벨 아이콘이 표시되는지 확인', () => {
    renderApp(mockProps);
    const bellIcon =
      document.querySelector('[aria-label="bell"]') || document.querySelector('.chakra-icon');
    expect(bellIcon).toBeInTheDocument();
  });

  it('달력의 주차가 올바르게 표시되는지 확인', () => {
    renderApp(mockProps);
    const weeks = screen.getAllByRole('row').slice(1); // 요일 헤더 제외
    expect(weeks.length).toBeGreaterThan(0); // 최소 4주 이상
  });

  it('여러 날짜에 걸친 일정이 올바르게 표시되는지 확인', () => {
    const multiDayEvent = {
      ...filteredEvents[0],
      id: '2',
      startTime: '2024-11-15 10:00',
      endTime: '2024-11-16 11:00',
      title: '이틀 간의 미팅',
    };

    const updatedProps = {
      ...mockProps,
      filteredEvents: [...filteredEvents, multiDayEvent],
    };

    renderApp(updatedProps);

    expect(screen.getByText('이틀 간의 미팅')).toBeInTheDocument();
  });

  it('일정이 없는 경우 달력이 정상적으로 표시되는지 확인', () => {
    render(
      <ChakraProvider>
        <MonthView {...{ ...mockProps, filteredEvents: [] }} />
      </ChakraProvider>
    );

    expect(screen.getByText('2024년 11월')).toBeInTheDocument();
  });

  it('날짜가 정상적으로 표시되는지 확인', () => {
    renderApp(mockProps);
    // 15일이 표시되어 있는지 확인 (currentDate가 15일이므로)
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('알림이 설정된 일정과 설정되지 않은 일정의 스타일이 다르게 표시되는지 확인', () => {
    const nonNotifiedEvent = {
      ...filteredEvents[0],
      id: '3',
      title: '알림 없는 미팅',
    };

    const updatedProps = {
      ...mockProps,
      filteredEvents: [...filteredEvents, nonNotifiedEvent],
      notifiedEvents: ['1'], // 첫 번째 일정만 알림 설정
    };

    renderApp(updatedProps);

    const notifiedEvent = screen.getByText('팀 미팅');
    const nonNotifiedEventElement = screen.getByText('알림 없는 미팅');

    const notifiedContainer = notifiedEvent.closest('div');
    const nonNotifiedContainer = nonNotifiedEventElement.closest('div');

    expect(notifiedContainer).toHaveStyle({
      backgroundColor: 'var(--chakra-colors-red-100)',
    });
    expect(nonNotifiedContainer).toHaveStyle({
      backgroundColor: 'var(--chakra-colors-gray-100)',
    });
  });
});
