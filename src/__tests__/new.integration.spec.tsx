import { act, render, screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import React from 'react';

import {
  setupCreateHandler,
  setupDeleteHandler,
  setupUpdateHandler,
} from '@/__mocks__/handlersUtils';
import App from '@/App';
import { Providers } from '@/app/providers';
import { Event, EventForm } from '@/types';

const Provider = ({ children }: { children: React.ReactNode }) => <Providers>{children}</Providers>;

const initialEvents = [
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
] as Event[];

const renderComponent = () => {
  render(
    <Provider>
      <App />
    </Provider>
  );
};

describe('반복 일정 테스트', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  const saveEvent = async (newEvent: EventForm) => {
    const titleInput = screen.getByLabelText('제목');
    const dateInput = screen.getByLabelText('날짜');
    const startTimeInput = screen.getByLabelText('시작 시간');
    const endTimeInput = screen.getByLabelText('종료 시간');
    const descriptionInput = screen.getByLabelText('설명');
    const locationInput = screen.getByLabelText('위치');
    const categoryInput = screen.getByLabelText('카테고리');
    const notificationTimeSelect = screen.getByLabelText('알림 설정');
    const endRepeatDateInput = screen.queryByLabelText('반복 종료일');

    // 반복 일정 체크 시 추가되는 요소들
    const repeatTypeSelect = screen.queryByLabelText('반복 유형');
    const repeatIntervalInput = screen.queryByLabelText('반복 간격');

    // 일정 추가 버튼
    const addEventButton = screen.getByTestId('event-submit-button');
    // 제목을 지우고 수정된 제목 입력
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, newEvent.title);

    // 날짜를 지우고 수정된 날짜 입력
    await userEvent.clear(dateInput);
    await userEvent.type(dateInput, newEvent.date);

    // 시작 시간을 지우고 수정된 시작 시간 입력
    await userEvent.clear(startTimeInput);
    await userEvent.type(startTimeInput, newEvent.startTime);

    // 종료 시간을 지우고 수정된 종료 시간 입력
    await userEvent.clear(endTimeInput);
    await userEvent.type(endTimeInput, newEvent.endTime);

    // 설명을 지우고 수정된 설명 입력
    await userEvent.clear(descriptionInput);
    await userEvent.type(descriptionInput, newEvent.description);

    // 장소를 지우고 수정한 장소 입력
    await userEvent.clear(locationInput);
    await userEvent.type(locationInput, newEvent.location);

    // 카테고리를 수정된 카테고리 입력
    await userEvent.selectOptions(categoryInput, newEvent.category);

    // 알림 시간을 수정된 알림 시간 입력
    await userEvent.selectOptions(notificationTimeSelect, newEvent.notificationTime.toString());

    if (newEvent.repeat.type !== 'none') {
      if (repeatTypeSelect) {
        await userEvent.selectOptions(repeatTypeSelect, newEvent.repeat.type);
      }
      if (repeatIntervalInput) {
        await userEvent.clear(repeatIntervalInput);
        await userEvent.type(repeatIntervalInput, newEvent.repeat.interval.toString());
      }

      if (newEvent.repeat.endDate && endRepeatDateInput) {
        await userEvent.clear(endRepeatDateInput);
        await userEvent.type(endRepeatDateInput, newEvent.repeat.endDate);
      }
    }

    // 일정 추가
    await userEvent.click(addEventButton);
  };

  const diffDate = (date1: Date, date2: Date) => {
    return date1.getTime() - date2.getTime();
  };

  const navigate = async (from: Date, to: Date) => {
    const fromDate = new Date(from);
    const toDate = new Date(to);

    const nextButton = screen.getByLabelText('Next');
    const prevButton = screen.getByLabelText('Previous');

    const fromMonth = new Date(fromDate.getFullYear(), fromDate.getMonth(), 1);
    const toMonth = new Date(toDate.getFullYear(), toDate.getMonth(), 1);

    const yearGap = toMonth.getFullYear() - fromMonth.getFullYear();
    const monthGap = toMonth.getMonth() - fromMonth.getMonth();

    let totalMove = yearGap * 12 + monthGap;
    for (let i = 0; i < totalMove; i++) {
      if (diffDate(fromDate, toDate) < 0) {
        await userEvent.click(nextButton);
      } else {
        await userEvent.click(prevButton);
      }
    }
    vi.setSystemTime(fromDate);
  };

  const dailyEvent = {
    type: 'daily',
    name: '2일간 반복 일정',
    interval: 2,
    expectDate: ['2024-10-15', '2024-10-17'],
  };

  const weeklyEvent = {
    type: 'weekly',
    name: '2주간 반복 일정',
    interval: 2,
    expectDate: ['2024-10-15', '2024-10-29'],
  };

  const monthlyEvent = {
    type: 'monthly',
    name: '2달간 반복 일정',
    interval: 2,
    expectDate: ['2024-10-15', '2024-12-15'],
  };

  const yearlyEvent = {
    type: 'yearly',
    name: '2년간 반복 일정',
    interval: 2,
    expectDate: ['2024-10-15', '2026-10-15'],
  };

  it.each([dailyEvent, weeklyEvent, monthlyEvent, yearlyEvent])(
    '$name 반복 일정 신규 생성 시 리스트에 정확히 노출된다.',
    async ({ type, interval, expectDate }) => {
      const _initialEvents = [...initialEvents];
      setupCreateHandler(_initialEvents);

      renderComponent();

      const newEvent = {
        title: '새로운 일정',
        date: '2024-10-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '새로운 일정 설명',
        location: '새로운 장소',
        category: '업무',
        notificationTime: 10,
        repeat: { type, interval },
      } as EventForm;

      await act(async () => {
        await saveEvent(newEvent);
      });

      for (let i = 0; i < expectDate.length; i++) {
        const prevDate = i === 0 ? new Date() : new Date(expectDate[i - 1]);
        await navigate(prevDate, new Date(expectDate[i]));

        const calendarView = screen.getByTestId('month-view');
        expect(
          within(calendarView).getByText(`반복 일정 캘린더 ${expectDate[i]}`)
        ).toBeInTheDocument();
      }
    }
  );

  it('반복 일정 신규 생성시 캘린더에 아이콘이 노출된다.', async () => {
    const _initialEvents = [...initialEvents];
    setupCreateHandler(_initialEvents);

    renderComponent();

    const newEvent = {
      title: '새로운 일정',
      date: '2024-10-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '새로운 일정 설명',
      location: '새로운 장소',
      category: '업무',
      notificationTime: 10,
      repeat: { type: 'daily', interval: 2 },
    } as EventForm;

    await act(async () => {
      await saveEvent(newEvent);
    });

    const calendarView = screen.getByTestId('month-view');

    await screen.findAllByText(/반복 일정이 추가되었습니다./i);

    expect(within(calendarView).getAllByText(/반복 일정 캘린더/i)).toHaveLength(9);

    // 날짜별로 확인 잘 들어갔는지 확인
    expect(within(calendarView).getByText('반복 일정 캘린더 2024-10-15')).toBeInTheDocument();
    expect(within(calendarView).getByText('반복 일정 캘린더 2024-10-17')).toBeInTheDocument();
    expect(within(calendarView).getByText('반복 일정 캘린더 2024-10-19')).toBeInTheDocument();
    expect(within(calendarView).getByText('반복 일정 캘린더 2024-10-21')).toBeInTheDocument();
    expect(within(calendarView).getByText('반복 일정 캘린더 2024-10-23')).toBeInTheDocument();
    expect(within(calendarView).getByText('반복 일정 캘린더 2024-10-25')).toBeInTheDocument();
    expect(within(calendarView).getByText('반복 일정 캘린더 2024-10-27')).toBeInTheDocument();
    expect(within(calendarView).getByText('반복 일정 캘린더 2024-10-29')).toBeInTheDocument();
    expect(within(calendarView).getByText('반복 일정 캘린더 2024-10-31')).toBeInTheDocument();
  });
  it('반복 종료일 설정 신규 생성시 정상 동작한다.', async () => {
    const _initialEvents = [...initialEvents];
    setupCreateHandler(_initialEvents);

    renderComponent();

    const newEvent = {
      title: '새로운 일정',
      date: '2024-10-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '새로운 일정 설명',
      location: '새로운 장소',
      category: '업무',
      notificationTime: 10,
      repeat: { type: 'daily', interval: 2, endDate: '2024-10-20' },
    } as EventForm;

    await act(async () => {
      await saveEvent(newEvent);
    });

    const calendarView = screen.getByTestId('month-view');

    await screen.findAllByText(/반복 일정이 추가되었습니다./i);

    expect(within(calendarView).getAllByText(/반복 일정 캘린더/i)).toHaveLength(3);

    // 날짜별로 확인, 의도한 날짜만 존재하는지 확인
    expect(within(calendarView).getByText('반복 일정 캘린더 2024-10-15')).toBeInTheDocument();
    expect(within(calendarView).getByText('반복 일정 캘린더 2024-10-17')).toBeInTheDocument();
    expect(within(calendarView).getByText('반복 일정 캘린더 2024-10-19')).toBeInTheDocument();
    expect(within(calendarView).queryByText('반복 일정 캘린더 2024-10-21')).not.toBeInTheDocument();
    expect(within(calendarView).queryByText('반복 일정 캘린더 2024-10-23')).not.toBeInTheDocument();
  });
  it('기존 일정에 반복 일정 추가 시 정상 동작한다.', async () => {
    const _initialEvents = [
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
    ] as Event[];
    setupUpdateHandler(_initialEvents);

    const updatedEvent = {
      ...initialEvents[0],
      repeat: { type: 'daily', interval: 2, endDate: '2024-10-20' },
    } as Event;

    renderComponent();

    const calendarView = screen.getByTestId('month-view');

    await waitFor(() => {
      expect(within(calendarView).getAllByText(_initialEvents[0].title)).toHaveLength(1);
    });

    const eventList = screen.getByTestId('event-list');

    const editButton = within(eventList).getAllByLabelText(/edit event/i);
    await userEvent.click(editButton[0]);

    const repeatCheckbox = screen.getByLabelText('반복 일정');
    await userEvent.click(repeatCheckbox);

    await waitFor(() => {
      expect(within(calendarView).queryAllByText(/반복 일정 캘린더/i)).toHaveLength(0);
    });

    await act(async () => {
      await saveEvent(updatedEvent);
    });

    await waitFor(() => {
      expect(within(calendarView).getByText('반복 일정 캘린더 2024-10-15')).toBeInTheDocument();
      expect(within(calendarView).getByText('반복 일정 캘린더 2024-10-17')).toBeInTheDocument();
      expect(within(calendarView).getByText('반복 일정 캘린더 2024-10-19')).toBeInTheDocument();
    });
  });
  it('반복 일정 삭제 시 해당 일정만 삭제된다.', async () => {
    const initialEvents = [
      {
        id: '1',
        title: '새로운 일정',
        date: '2024-10-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '새로운 일정 설명',
        location: '새로운 장소',
        category: '업무',
        notificationTime: 10,
        repeat: { type: 'daily', interval: 2, endDate: '2024-10-20' },
      },
      {
        id: '2',
        title: '새로운 일정',
        date: '2024-10-17',
        startTime: '10:00',
        endTime: '11:00',
        description: '새로운 일정 설명',
        location: '새로운 장소',
        category: '업무',
        notificationTime: 10,
        repeat: { type: 'daily', interval: 2, endDate: '2024-10-20' },
      },
      {
        id: '2',
        title: '새로운 일정',
        date: '2024-10-19',
        startTime: '10:00',
        endTime: '11:00',
        description: '새로운 일정 설명',
        location: '새로운 장소',
        category: '업무',
        notificationTime: 10,
        repeat: { type: 'daily', interval: 2, endDate: '2024-10-20' },
      },
    ] as Event[];

    setupDeleteHandler(initialEvents);
    renderComponent();

    const calendarView = screen.getByTestId('month-view');

    await waitFor(() => {
      expect(within(calendarView).getAllByText(/반복 일정 캘린더/i)).toHaveLength(3);
    });

    const eventList = within(screen.getByTestId('event-list'));
    const deleteButton = eventList.getAllByLabelText(/delete event/i);
    await userEvent.click(deleteButton[1]);

    // 삭제한 일정이 더 이상 조회되지 않는지 확인
    await waitFor(() => {
      expect(within(calendarView).queryByText('반복 일정 캘린더 2024-10-15')).toBeInTheDocument();
      expect(
        within(calendarView).queryByText('반복 일정 캘린더 2024-10-17')
      ).not.toBeInTheDocument();
      expect(within(calendarView).queryByText('반복 일정 캘린더 2024-10-19')).toBeInTheDocument();
    });
  });
  it('매달 반복 설정 시 31일의 경우 존재하지 않는 달은 건너뛴다.', async () => {
    const _initialEvents = [...initialEvents];
    setupCreateHandler(_initialEvents);

    const newEvent = {
      title: '새로운 일정',
      date: '2024-10-31',
      startTime: '10:00',
      endTime: '11:00',
      description: '새로운 일정 설명',
      location: '새로운 장소',
      category: '업무',
      notificationTime: 10,
      repeat: { type: 'monthly', interval: 1, endDate: '2025-10-31' },
    } as EventForm;

    renderComponent();

    await act(async () => {
      await saveEvent(newEvent);
    });
    const nextButton = screen.getByLabelText('Next');

    const calendarView = screen.getByTestId('month-view');
    expect(within(calendarView).getByText('반복 일정 캘린더 2024-10-31')).toBeInTheDocument();

    await userEvent.click(nextButton);

    expect(within(calendarView).queryByText('반복 일정 캘린더 2024-11-1')).not.toBeInTheDocument();
    expect(within(calendarView).queryByText('반복 일정 캘린더 2024-11-2')).not.toBeInTheDocument();
    expect(within(calendarView).queryByText('반복 일정 캘린더 2024-11-3')).not.toBeInTheDocument();
    expect(within(calendarView).queryByText('반복 일정 캘린더 2024-11-31')).not.toBeInTheDocument();

    await userEvent.click(nextButton);

    expect(within(calendarView).queryByText('반복 일정 캘린더 2024-12-1')).not.toBeInTheDocument();
    expect(within(calendarView).queryByText('반복 일정 캘린더 2024-12-2')).not.toBeInTheDocument();
    expect(within(calendarView).queryByText('반복 일정 캘린더 2024-12-3')).not.toBeInTheDocument();
    expect(within(calendarView).getByText('반복 일정 캘린더 2024-12-31')).toBeInTheDocument();
  });
});
