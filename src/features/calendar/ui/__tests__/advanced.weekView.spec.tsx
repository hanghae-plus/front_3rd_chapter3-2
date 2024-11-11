import { ChakraProvider } from '@chakra-ui/react';
import { Event } from '@entities/event/model/types';
import { WeekView } from '@features/calendar/ui';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

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
  currentDate: new Date('2024-11-15'),
  notifiedEvents: ['1'],
  filteredEvents,
};

const renderApp = () => {
  return render(
    <ChakraProvider>
      <WeekView {...mockProps} />
    </ChakraProvider>
  );
};

describe('WeekView', () => {
  it('주간 보기 컴포넌트가 정상적으로 렌더링되는지 확인', () => {
    renderApp();
    expect(screen.getByTestId('week-view')).toBeInTheDocument();
    expect(screen.getByText('2024년 11월 2주')).toBeInTheDocument();
  });

  it('요일 헤더가 모두 표시되는지 확인', () => {
    renderApp();
    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
    weekDays.forEach((day) => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });

  it('현재 주의 모든 날짜가 표시되는지 확인', () => {
    renderApp();
    // 2024년 11월 15일이 포함된 주의 날짜들
    const expectedDates = [
      { date: '10', day: '일' },
      { date: '11', day: '월' },
      { date: '12', day: '화' },
      { date: '13', day: '수' },
      { date: '14', day: '목' },
      { date: '15', day: '금' },
      { date: '16', day: '토' },
    ];

    // 각 날짜와 요일이 올바르게 매칭되어 표시되는지 확인
    expectedDates.forEach(({ date, day }) => {
      const dateElement = screen.getByText(date);
      expect(dateElement).toBeInTheDocument();

      // 해당 날짜의 셀이 올바른 요일 컬럼 아래에 있는지 확인
      const dayHeader = screen.getByText(day);
      const dayColumnIndex = Array.from(dayHeader.parentElement?.children || []).indexOf(dayHeader);
      const dateColumnIndex = Array.from(
        dateElement.closest('td')?.parentElement?.children || []
      ).indexOf(dateElement.closest('td')!);

      expect(dayColumnIndex).toBe(dateColumnIndex);
    });
  });

  it('알림이 설정된 일정에 벨 아이콘이 표시되는지 확인', () => {
    renderApp();
    const bellIcon =
      document.querySelector('[aria-label="bell"]') || document.querySelector('.chakra-icon');
    expect(bellIcon).toBeInTheDocument();
  });

  it('알림이 설정된 일정과 설정되지 않은 일정의 스타일이 다르게 표시되는지 확인', () => {
    const nonNotifiedEvent = {
      ...filteredEvents[0],
      id: '2',
      title: '알림 없는 미팅',
      date: '2024-11-15',
    };

    const updatedProps = {
      ...mockProps,
      filteredEvents: [...filteredEvents, nonNotifiedEvent],
      notifiedEvents: ['1'], // 첫 번째 일정만 알림 설정
    };

    render(
      <ChakraProvider>
        <WeekView {...updatedProps} />
      </ChakraProvider>
    );

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

  it('일정이 없는 경우 주간 달력이 정상적으로 표시되는지 확인', () => {
    render(
      <ChakraProvider>
        <WeekView {...{ ...mockProps, filteredEvents: [] }} />
      </ChakraProvider>
    );

    // 주차 제목이 올바르게 표시되는지 확인
    expect(screen.getByText('2024년 11월 2주')).toBeInTheDocument();

    // 요일 헤더가 모두 표시되는지 확인
    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
    weekDays.forEach((day) => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });

    // 해당 주의 모든 날짜가 표시되는지 확인
    const expectedDates = ['10', '11', '12', '13', '14', '15', '16'];
    expectedDates.forEach((date) => {
      const dateElement = screen.getByText(date);
      expect(dateElement).toBeInTheDocument();

      // 날짜가 표시된 셀에 일정 관련 엘리먼트가 없는지 확인
      const cell = dateElement.closest('td');
      expect(cell?.querySelectorAll('.chakra-icon')).toHaveLength(0); // 알림 아이콘 없음
      expect(cell?.querySelectorAll('[data-testid="event-box"]')).toHaveLength(0); // 일정 박스 없음
    });
  });

  it('같은 날짜에 여러 일정이 있는 경우 모두 표시되는지 확인', () => {
    const multipleEvents = [
      ...filteredEvents,
      {
        ...filteredEvents[0],
        id: '2',
        title: '두 번째 미팅',
        date: '2024-11-15',
      },
      {
        ...filteredEvents[0],
        id: '3',
        title: '세 번째 미팅',
        date: '2024-11-15',
      },
    ];

    const updatedProps = {
      ...mockProps,
      filteredEvents: multipleEvents,
      notifiedEvents: ['1', '2'],
    };

    render(
      <ChakraProvider>
        <WeekView {...updatedProps} />
      </ChakraProvider>
    );

    expect(screen.getByText('팀 미팅')).toBeInTheDocument();
    expect(screen.getByText('두 번째 미팅')).toBeInTheDocument();
    expect(screen.getByText('세 번째 미팅')).toBeInTheDocument();
  });
});
