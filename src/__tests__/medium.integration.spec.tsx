import { ChakraProvider } from '@chakra-ui/react';
import { act, render, screen, within } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { ReactElement } from 'react';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../__mocks__/handlersUtils';
import App from '../App';
import { server } from '../setupTests';
import { useEventFormStore } from '../store/useEventFormStore';
import { useEventOverlapStore } from '../store/useEventOverlapStore';
import { Event } from '../types';

beforeEach(() => {
  useEventOverlapStore.setState(useEventOverlapStore.getInitialState());
  useEventFormStore.setState(useEventFormStore.getInitialState());
});

// ! Hard 여기 제공 안함
const setup = (element: ReactElement) => {
  const user = userEvent.setup();

  return { ...render(<ChakraProvider>{element}</ChakraProvider>), user }; // ? Med: 왜 ChakraProvider로 감싸는지 물어보자
};

// ! Hard 여기 제공 안함
const saveSchedule = async (user: UserEvent, form: Omit<Event, 'id' | 'notificationTime'>) => {
  const { title, date, startTime, endTime, location, description, category, repeat } = form;

  await user.click(screen.getAllByText('일정 추가')[0]);

  await user.type(screen.getByLabelText('제목'), title);
  await user.type(screen.getByLabelText('날짜'), date);
  await user.type(screen.getByLabelText('시작 시간'), startTime);
  await user.type(screen.getByLabelText('종료 시간'), endTime);
  await user.type(screen.getByLabelText('설명'), description);
  await user.type(screen.getByLabelText('위치'), location);
  await user.selectOptions(screen.getByLabelText('카테고리'), category);

  if (repeat.type !== 'none') {
    await user.click(screen.getByLabelText('반복 설정'));
    await user.selectOptions(screen.getByLabelText('반복 유형'), repeat.type);
    await user.type(screen.getByLabelText('반복 간격'), repeat.interval.toString());

    if (repeat.endDate) {
      await user.type(screen.getByLabelText('반복 종료일'), repeat.endDate);
    }
  }

  await user.click(screen.getByTestId('event-submit-button'));
};

describe('🔁 반복 일정 CURD - 8주차 기본과제 =================', () => {
  const schedule = {
    title: '반복되는 회의',
    titleWithIcon: '🔁 반복되는 회의',
  } as const;

  beforeEach(() => {
    vi.setSystemTime(new Date('2024-11-01'));
  });

  it('매일 반복 일정을 생성할 수 있다', async () => {
    setupMockHandlerCreation();
    const { user } = setup(<App />);

    await saveSchedule(user, {
      title: schedule.title,
      date: '2024-11-01',
      startTime: '14:00',
      endTime: '15:00',
      description: '프로젝트 진행 상황 논의',
      location: '회의실 A',
      category: '업무',

      // 반복 설정: 1일에 1번씩 반복
      repeat: {
        interval: 1,
        type: 'daily',
        endDate: '2024-11-03',
      },
    });

    const calendarView = within(screen.getByTestId('calendar-view'));

    // 반복 일정이 보임 O
    expect(
      within(calendarView.getByTestId('day-1')).getByText(schedule.titleWithIcon)
    ).toBeInTheDocument();
    expect(
      within(calendarView.getByTestId('day-2')).getByText(schedule.titleWithIcon)
    ).toBeInTheDocument();
    expect(
      within(calendarView.getByTestId('day-3')).getByText(schedule.titleWithIcon)
    ).toBeInTheDocument();
  });

  it('매주 반복 일정을 생성할 수 있다', async () => {
    setupMockHandlerCreation();
    const { user } = setup(<App />);

    await saveSchedule(user, {
      title: schedule.title,
      date: '2024-11-01',
      startTime: '14:00',
      endTime: '15:00',
      description: '프로젝트 진행 상황 논의',
      location: '회의실 A',
      category: '업무',

      // 반복 설정: 1주에 1번씩 반복
      repeat: {
        type: 'weekly',
        interval: 1,
        endDate: '2024-11-10',
      },
    });

    const calendarView = within(screen.getByTestId('calendar-view'));

    // 1. 반복 간격에 맞는 날짜(1일,8일)에 일정 표시 O
    expect(
      within(calendarView.getByTestId('day-1')).getByText(schedule.titleWithIcon)
    ).toBeInTheDocument();
    expect(
      within(calendarView.getByTestId('day-8')).getByText(schedule.titleWithIcon)
    ).toBeInTheDocument();

    // 2. 반복 간격에 해당하지 않는 날짜(2일 - 7일)에는 일정 표시 X
    expect(
      within(calendarView.getByTestId('day-2')).queryByText(schedule.titleWithIcon)
    ).not.toBeInTheDocument();
    expect(
      within(calendarView.getByTestId('day-3')).queryByText(schedule.titleWithIcon)
    ).not.toBeInTheDocument();
    expect(
      within(calendarView.getByTestId('day-4')).queryByText(schedule.titleWithIcon)
    ).not.toBeInTheDocument();
    expect(
      within(calendarView.getByTestId('day-5')).queryByText(schedule.titleWithIcon)
    ).not.toBeInTheDocument();
    expect(
      within(calendarView.getByTestId('day-6')).queryByText(schedule.titleWithIcon)
    ).not.toBeInTheDocument();
    expect(
      within(calendarView.getByTestId('day-7')).queryByText(schedule.titleWithIcon)
    ).not.toBeInTheDocument();
  });

  it('매월 반복 일정을 생성할 수 있다', async () => {
    setupMockHandlerCreation();
    const { user } = setup(<App />);

    await saveSchedule(user, {
      title: schedule.title,
      date: '2024-11-01',
      startTime: '14:00',
      endTime: '15:00',
      description: '프로젝트 진행 상황 논의',
      location: '회의실 A',
      category: '업무',

      // 반복 설정: 2달에 1번씩 반복
      repeat: {
        type: 'monthly',
        interval: 2,
        endDate: '2025-01-01',
      },
    });

    const calendarView = within(screen.getByTestId('calendar-view'));
    const nextButton = calendarView.getByLabelText('Next');

    // 1. 첫 번째 달 (2024년 11월): 반복 일정 보임 O
    expect(calendarView.getByText('2024년 11월')).toBeInTheDocument();
    expect(
      within(calendarView.getByTestId('day-1')).getByText(schedule.titleWithIcon)
    ).toBeInTheDocument();

    // 2. 반복 주기 외의 달 (2024년 12월): 반복 일정 표시 X
    await user.click(nextButton);
    expect(calendarView.getByText('2024년 12월')).toBeInTheDocument();
    expect(
      within(calendarView.getByTestId('day-1')).queryByText(schedule.titleWithIcon)
    ).not.toBeInTheDocument();

    // 3. 반복 주기에 해당하는 달 (2025년 1월): 반복 일정 보임 O
    await user.click(nextButton);
    expect(calendarView.getByText('2025년 1월')).toBeInTheDocument();
    expect(
      within(calendarView.getByTestId('day-1')).getByText(schedule.titleWithIcon)
    ).toBeInTheDocument();
  });

  it('매년 반복 일정을 생성할 수 있다', async () => {
    vi.setSystemTime(new Date('2024-01-01'));
    setupMockHandlerCreation();
    const { user } = setup(<App />);

    await saveSchedule(user, {
      title: schedule.title,
      date: '2024-01-01',
      startTime: '14:00',
      endTime: '15:00',
      description: '프로젝트 진행 상황 논의',
      location: '회의실 A',
      category: '업무',

      // 반복 설정: 1년에 1번씩 반복
      repeat: {
        type: 'yearly',
        interval: 1,
        endDate: '2025-01-01',
      },
    });

    const calendarView = within(screen.getByTestId('calendar-view'));
    const nextButton = calendarView.getByLabelText('Next');

    // 2024년 1월 1일에 반복 일정이 보임 O
    expect(calendarView.getByText('2024년 1월')).toBeInTheDocument();
    expect(
      within(calendarView.getByTestId('day-1')).getByText(schedule.titleWithIcon)
    ).toBeInTheDocument();

    await user.click(nextButton);
    await user.click(nextButton);
    await user.click(nextButton);
    await user.click(nextButton);

    await user.click(nextButton);
    await user.click(nextButton);
    await user.click(nextButton);
    await user.click(nextButton);

    await user.click(nextButton);
    await user.click(nextButton);
    await user.click(nextButton);
    await user.click(nextButton);

    // 2025년 1월 1일에 반복 일정이 보임 O
    expect(calendarView.getByText('2025년 1월')).toBeInTheDocument();
    expect(
      within(calendarView.getByTestId('day-1')).getByText(schedule.titleWithIcon)
    ).toBeInTheDocument();
  });

  it('매월 31일에 반복 일정을 생성하면, 다음 반복일정이 다음 달의 마지막 날짜로 설정된다.', async () => {
    vi.setSystemTime(new Date('2025-01-31'));
    setupMockHandlerCreation();
    const { user } = setup(<App />);

    await saveSchedule(user, {
      title: schedule.title,
      date: '2025-01-31', // 31일에 일정 생성
      startTime: '14:00',
      endTime: '15:00',
      description: '프로젝트 진행 상황 논의',
      location: '회의실 A',
      category: '업무',

      // 반복 설정: 1달에 1번씩 반복
      repeat: {
        type: 'monthly',
        interval: 1,
        endDate: '2025-04-30',
      },
    });

    const calendarView = within(screen.getByTestId('calendar-view'));
    const nextButton = calendarView.getByLabelText('Next');

    // 1. 첫 번째 달 (2025년 1월 31일): 반복 일정 보임 O
    expect(calendarView.getByText('2025년 1월')).toBeInTheDocument();
    expect(
      within(calendarView.getByTestId('day-31')).getByText(schedule.titleWithIcon)
    ).toBeInTheDocument();

    // 2. 다음 달 (2025년 2월): 31일이 없으므로 2월의 마지막 날(28일)에 반복 일정 보임 O
    await user.click(nextButton);
    expect(calendarView.getByText('2025년 2월')).toBeInTheDocument();
    expect(
      within(calendarView.getByTestId('day-28')).getByText(schedule.titleWithIcon)
    ).toBeInTheDocument();

    // 3. 3월 (2025년 3월): 반복 간격에 따라 3월 31일에 반복 일정 보임 O
    await user.click(nextButton);
    expect(calendarView.getByText('2025년 3월')).toBeInTheDocument();
    expect(
      within(calendarView.getByTestId('day-31')).getByText(schedule.titleWithIcon)
    ).toBeInTheDocument();

    // 4. 종료 월 (2025년 4월): 31일이 없으므로 마지막 날인 4월 30일에 반복 일정 보임 O
    await user.click(nextButton);
    expect(calendarView.getByText('2025년 4월')).toBeInTheDocument();
    expect(
      within(calendarView.getByTestId('day-30')).getByText(schedule.titleWithIcon)
    ).toBeInTheDocument();
  });

  it('윤년 2월 29일에 월간 반복 일정을 생성할 수 있다', async () => {
    vi.setSystemTime(new Date('2024-02-01'));
    setupMockHandlerCreation();
    const { user } = setup(<App />);

    await saveSchedule(user, {
      title: schedule.title,
      startTime: '14:00',
      endTime: '15:00',
      description: '프로젝트 진행 상황 논의',
      location: '회의실 A',
      category: '업무',

      date: '2024-02-29', // 윤년 2월 29일에 일정 생성

      // 반복 설정: 1달에 1번씩 반복
      repeat: {
        type: 'monthly',
        interval: 1,
        endDate: '2024-04-01',
      },
    });

    const calendarView = within(screen.getByTestId('calendar-view'));
    const nextButton = calendarView.getByLabelText('Next');

    // 1. 첫 번째 달 (2024년 2월): 2월 29일에 반복 일정 보임 O (윤년)
    expect(calendarView.getByText('2024년 2월')).toBeInTheDocument();
    expect(
      within(calendarView.getByTestId('day-29')).getByText(schedule.titleWithIcon)
    ).toBeInTheDocument();

    // 2. 다음 달 (2024년 3월): 2월 29일의 반복 일정이 3월의 마지막 날(31일)에 표시 O
    await user.click(nextButton);
    expect(calendarView.getByText('2024년 3월')).toBeInTheDocument();
    expect(
      within(calendarView.getByTestId('day-29')).getByText(schedule.titleWithIcon)
    ).toBeInTheDocument();
  });

  it('윤년 2월 29일에 연간 반복 일정을 생성할 수 있다', async () => {
    vi.setSystemTime(new Date('2024-02-01'));
    setupMockHandlerCreation();
    const { user } = setup(<App />);

    await saveSchedule(user, {
      title: schedule.title,
      startTime: '14:00',
      endTime: '15:00',
      description: '프로젝트 진행 상황 논의',
      location: '회의실 A',
      category: '업무',

      date: '2024-02-29', // 윤년 2월 29일에 일정 생성

      // 반복 설정: 1년에 1번씩 반복
      repeat: {
        type: 'yearly',
        interval: 1,
        endDate: '2025-03-01',
      },
    });

    const calendarView = within(screen.getByTestId('calendar-view'));
    const nextButton = calendarView.getByLabelText('Next');

    // 윤년 2월 29일에 반복 일정 보임 O
    expect(calendarView.getByText('2024년 2월')).toBeInTheDocument();
    expect(
      within(calendarView.getByTestId('day-29')).getByText(schedule.titleWithIcon)
    ).toBeInTheDocument();

    await user.click(nextButton);
    await user.click(nextButton);
    await user.click(nextButton);
    await user.click(nextButton);

    await user.click(nextButton);
    await user.click(nextButton);
    await user.click(nextButton);
    await user.click(nextButton);

    await user.click(nextButton);
    await user.click(nextButton);
    await user.click(nextButton);
    await user.click(nextButton);

    // 다음해 2월 28일에 반복 일정 보임 O (달의 마지막 날)
    expect(calendarView.getByText('2025년 2월')).toBeInTheDocument();
    expect(
      within(calendarView.getByTestId('day-28')).getByText(schedule.titleWithIcon)
    ).toBeInTheDocument();
  });

  it('반복 종료일이 없으면 기본 종료일인 2025-06-30까지 생성된다', async () => {
    vi.setSystemTime(new Date('2025-05-01'));
    setupMockHandlerCreation();
    const { user } = setup(<App />);

    await saveSchedule(user, {
      title: schedule.title,
      date: '2025-05-30',
      startTime: '14:00',
      endTime: '15:00',
      description: '프로젝트 진행 상황 논의',
      location: '회의실 A',
      category: '업무',

      // 반복 종료일 없음
      repeat: {
        interval: 1,
        type: 'monthly',
      },
    });

    const calendarView = within(screen.getByTestId('calendar-view'));
    const nextButton = calendarView.getByLabelText('Next');

    // 1. 첫 번째 달 (2025년 5월): 5월 30일에 반복 일정 보임 O
    expect(calendarView.getByText('2025년 5월')).toBeInTheDocument();
    expect(
      within(calendarView.getByTestId('day-30')).getByText(schedule.titleWithIcon)
    ).toBeInTheDocument();

    // 2. 다음 달 (2025년 6월): 6월 30일에 반복 일정 보임 O
    await user.click(nextButton);
    expect(calendarView.getByText('2025년 6월')).toBeInTheDocument();
    expect(
      within(calendarView.getByTestId('day-30')).getByText(schedule.titleWithIcon)
    ).toBeInTheDocument();

    // 3. 기본 종료일 이후 (2025년 7월): 7월 30일에는 반복 일정 X
    await user.click(nextButton);
    expect(calendarView.getByText('2025년 7월')).toBeInTheDocument();
    expect(
      within(calendarView.getByTestId('day-30')).queryByText(schedule.titleWithIcon)
    ).not.toBeInTheDocument();
  });

  it('반복 종료일이 있으면 해당 종료일까지 반복된다', async () => {
    vi.setSystemTime(new Date('2025-05-01'));
    setupMockHandlerCreation();
    const { user } = setup(<App />);

    await saveSchedule(user, {
      title: schedule.title,
      date: '2025-05-30',
      startTime: '14:00',
      endTime: '15:00',
      description: '프로젝트 진행 상황 논의',
      location: '회의실 A',
      category: '업무',

      // 반복 종료일 설정
      repeat: {
        interval: 1,
        type: 'monthly',
        endDate: '2025-07-30',
      },
    });

    const calendarView = within(screen.getByTestId('calendar-view'));
    const nextButton = calendarView.getByLabelText('Next');

    // 5, 6월 반복일정 보임 O
    expect(calendarView.getByText('2025년 5월')).toBeInTheDocument();
    expect(
      within(calendarView.getByTestId('day-30')).getByText(schedule.titleWithIcon)
    ).toBeInTheDocument();

    await user.click(nextButton);
    expect(calendarView.getByText('2025년 6월')).toBeInTheDocument();
    expect(
      within(calendarView.getByTestId('day-30')).getByText(schedule.titleWithIcon)
    ).toBeInTheDocument();

    // 반복 종료일이 설정된 달 (2025년 7월): 7월 30일에 반복일정 보임 O
    await user.click(nextButton);
    expect(calendarView.getByText('2025년 7월')).toBeInTheDocument();
    expect(
      within(calendarView.getByTestId('day-30')).getByText(schedule.titleWithIcon)
    ).toBeInTheDocument();

    // 반복 종료일 이후 (2025년 8월): 8월 30일에는 반복 일정이 보이지 않음 X
    await user.click(nextButton);
    expect(calendarView.getByText('2025년 8월')).toBeInTheDocument();
    expect(
      within(calendarView.getByTestId('day-30')).queryByText(schedule.titleWithIcon)
    ).not.toBeInTheDocument();
  });

  it('반복 일정을 수정하면 해당 일정이 단일 일정으로 변경된다', async () => {
    setupMockHandlerUpdating([
      {
        id: '1',
        title: schedule.title,
        date: '2024-11-01',
        startTime: '14:00',
        endTime: '15:00',
        description: '프로젝트 진행 상황 논의',
        location: '회의실 A',
        category: '업무',
        notificationTime: 10,

        repeat: {
          interval: 1,
          type: 'daily',
          endDate: '2024-11-03',
        },
      },
    ]);

    const { user } = setup(<App />);

    // 반복 일정 수정
    await user.click(await screen.findByLabelText('Edit event'));
    await user.clear(screen.getByLabelText('제목'));
    await user.type(screen.getByLabelText('제목'), '수정된 회의');

    await user.click(screen.getByTestId('event-submit-button'));

    // 반복 일정 수정 시 단일 일정으로 변경
    const calendarView = within(screen.getByTestId('calendar-view'));
    expect(calendarView.getByText('수정된 회의')).toBeInTheDocument();
    expect(calendarView.queryByText('🔁 수정된 회의')).not.toBeInTheDocument(); // 🔁 표시 X
  });

  it('반복 일정을 삭제하면 해당 일정만 삭제된다', async () => {
    setupMockHandlerDeletion([
      {
        id: '1',
        title: schedule.title,
        date: '2024-11-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '삭제할 이벤트입니다',
        location: '어딘가',
        category: '기타',
        repeat: { type: 'daily', interval: 1, endDate: '2024-11-03' },
        notificationTime: 10,
      },
      {
        id: '2',
        title: schedule.title,
        date: '2024-11-02',
        startTime: '09:00',
        endTime: '10:00',
        description: '삭제할 이벤트입니다',
        location: '어딘가',
        category: '기타',
        repeat: { type: 'daily', interval: 1, endDate: '2024-11-03' },
        notificationTime: 10,
      },
      {
        id: '3',
        title: schedule.title,
        date: '2024-11-03',
        startTime: '09:00',
        endTime: '10:00',
        description: '삭제할 이벤트입니다',
        location: '어딘가',
        category: '기타',
        repeat: { type: 'daily', interval: 1, endDate: '2024-11-03' },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);

    await act(() => null);

    const calendarView = within(screen.getByTestId('calendar-view'));

    // 모든 반복일정 표시 O
    expect(calendarView.getByText('2024년 11월')).toBeInTheDocument();
    expect(
      within(calendarView.getByTestId('day-1')).getByText(schedule.titleWithIcon)
    ).toBeInTheDocument();
    expect(
      within(calendarView.getByTestId('day-2')).getByText(schedule.titleWithIcon)
    ).toBeInTheDocument();
    expect(
      within(calendarView.getByTestId('day-3')).getByText(schedule.titleWithIcon)
    ).toBeInTheDocument();

    // 삭제 버튼 클릭 (두 번째 일정)
    const allDeleteButton = await screen.findAllByLabelText('Delete event');
    await user.click(allDeleteButton[1]);

    // 해당 반복일정 표시 X (두 번째 일정 삭제됨)
    expect(
      within(calendarView.getByTestId('day-2')).queryByText(schedule.titleWithIcon)
    ).not.toBeInTheDocument();

    // 나머지 반복일정들은 유지
    expect(
      within(calendarView.getByTestId('day-1')).getByText(schedule.titleWithIcon)
    ).toBeInTheDocument();
    expect(
      within(calendarView.getByTestId('day-3')).getByText(schedule.titleWithIcon)
    ).toBeInTheDocument();
  });
});

describe('일정 CRUD 및 기본 기능', () => {
  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    setupMockHandlerCreation();

    const { user } = setup(<App />);

    await saveSchedule(user, {
      title: '새 회의',
      date: '2024-10-15',
      startTime: '14:00',
      endTime: '15:00',
      description: '프로젝트 진행 상황 논의',
      location: '회의실 A',
      category: '업무',
      repeat: {
        interval: 0,
        type: 'none',
      },
    });

    const eventList = within(screen.getByTestId('event-list'));

    expect(eventList.getByText('새 회의')).toBeInTheDocument();
    expect(eventList.getByText('2024-10-15')).toBeInTheDocument();
    expect(eventList.getByText('14:00 - 15:00')).toBeInTheDocument();
    expect(eventList.getByText('프로젝트 진행 상황 논의')).toBeInTheDocument();
    expect(eventList.getByText('회의실 A')).toBeInTheDocument();
    expect(eventList.getByText('카테고리: 업무')).toBeInTheDocument();
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    const { user } = setup(<App />);

    setupMockHandlerUpdating();

    await user.click(await screen.findByLabelText('Edit event'));

    await user.clear(screen.getByLabelText('제목'));
    await user.type(screen.getByLabelText('제목'), '수정된 회의');
    await user.clear(screen.getByLabelText('설명'));
    await user.type(screen.getByLabelText('설명'), '회의 내용 변경');

    await user.click(screen.getByTestId('event-submit-button'));

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('수정된 회의')).toBeInTheDocument();
    expect(eventList.getByText('회의 내용 변경')).toBeInTheDocument();
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    setupMockHandlerDeletion();

    const { user } = setup(<App />);
    const eventList = within(screen.getByTestId('event-list'));
    expect(await eventList.findByText('삭제할 이벤트')).toBeInTheDocument();

    // 삭제 버튼 클릭
    const allDeleteButton = await screen.findAllByLabelText('Delete event');
    await user.click(allDeleteButton[0]);

    expect(eventList.queryByText('삭제할 이벤트')).not.toBeInTheDocument();
  });
});

describe('일정 뷰', () => {
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    // ! 현재 시스템 시간 2024-10-01
    const { user } = setup(<App />);

    await user.selectOptions(screen.getByLabelText('view'), 'week');

    // ! 일정 로딩 완료 후 테스트
    await screen.findByText('일정 로딩 완료!');

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    setupMockHandlerCreation();

    const { user } = setup(<App />);
    await saveSchedule(user, {
      title: '이번주 팀 회의',
      date: '2024-10-02',
      startTime: '09:00',
      endTime: '10:00',
      description: '이번주 팀 회의입니다.',
      location: '회의실 A',
      category: '업무',
      repeat: {
        type: 'none',
        interval: 0,
      },
    });

    await user.selectOptions(screen.getByLabelText('view'), 'week');

    const weekView = within(screen.getByTestId('week-view'));
    expect(weekView.getByText('이번주 팀 회의')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    vi.setSystemTime(new Date('2024-01-01'));

    setup(<App />);

    // ! 일정 로딩 완료 후 테스트
    await screen.findByText('일정 로딩 완료!');

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    setupMockHandlerCreation();

    const { user } = setup(<App />);
    await saveSchedule(user, {
      title: '이번달 팀 회의',
      date: '2024-10-02',
      startTime: '09:00',
      endTime: '10:00',
      description: '이번달 팀 회의입니다.',
      location: '회의실 A',
      category: '업무',
      repeat: {
        type: 'none',
        interval: 0,
      },
    });

    const monthView = within(screen.getByTestId('month-view'));
    expect(monthView.getByText('이번달 팀 회의')).toBeInTheDocument();
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    vi.setSystemTime(new Date('2024-01-01'));
    setup(<App />);

    const monthView = screen.getByTestId('month-view');

    // 1월 1일 셀 확인
    const januaryFirstCell = within(monthView).getByText('1').closest('td')!;
    expect(within(januaryFirstCell).getByText('신정')).toBeInTheDocument();
  });
});

describe('검색 기능', () => {
  beforeEach(() => {
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({
          events: [
            {
              id: 1,
              title: '팀 회의',
              date: '2024-10-15',
              startTime: '09:00',
              endTime: '10:00',
              description: '주간 팀 미팅',
              location: '회의실 A',
              category: '업무',
              repeat: { type: 'none', interval: 0 },
              notificationTime: 10,
            },
            {
              id: 2,
              title: '프로젝트 계획',
              date: '2024-10-16',
              startTime: '14:00',
              endTime: '15:00',
              description: '새 프로젝트 계획 수립',
              location: '회의실 B',
              category: '업무',
              repeat: { type: 'none', interval: 0 },
              notificationTime: 10,
            },
          ],
        });
      })
    );
  });

  afterEach(() => {
    server.resetHandlers();
  });

  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    const { user } = setup(<App />);

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '존재하지 않는 일정');

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    const { user } = setup(<App />);

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '팀 회의');

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('팀 회의')).toBeInTheDocument();
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    const { user } = setup(<App />);

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '팀 회의');
    await user.clear(searchInput);

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('팀 회의')).toBeInTheDocument();
    expect(eventList.getByText('프로젝트 계획')).toBeInTheDocument();
  });
});

describe('일정 충돌', () => {
  afterEach(() => {
    server.resetHandlers();
  });

  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    setupMockHandlerCreation([
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
    ]);

    const { user } = setup(<App />);

    await saveSchedule(user, {
      title: '새 회의',
      date: '2024-10-15',
      startTime: '09:30',
      endTime: '10:30',
      description: '설명',
      location: '회의실 A',
      category: '업무',
      repeat: {
        type: 'none',
        interval: 0,
      },
    });

    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
    expect(screen.getByText(/다음 일정과 겹칩니다/)).toBeInTheDocument();
    expect(screen.getByText('기존 회의 (2024-10-15 09:00-10:00)')).toBeInTheDocument();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    setupMockHandlerUpdating();

    const { user } = setup(<App />);

    const editButton = (await screen.findAllByLabelText('Edit event'))[1];
    await user.click(editButton);

    // 시간 수정하여 다른 일정과 충돌 발생
    await user.clear(screen.getByLabelText('시작 시간'));
    await user.type(screen.getByLabelText('시작 시간'), '08:30');
    await user.clear(screen.getByLabelText('종료 시간'));
    await user.type(screen.getByLabelText('종료 시간'), '10:30');

    await user.click(screen.getByTestId('event-submit-button'));

    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
    expect(screen.getByText(/다음 일정과 겹칩니다/)).toBeInTheDocument();
    expect(screen.getByText('기존 회의 (2024-10-15 09:00-10:00)')).toBeInTheDocument();
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  vi.setSystemTime(new Date('2024-10-15 08:49:59'));

  setup(<App />);

  // ! 일정 로딩 완료 후 테스트
  await screen.findByText('일정 로딩 완료!');

  expect(screen.queryByText('10분 후 기존 회의 일정이 시작됩니다.')).not.toBeInTheDocument();

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(screen.getByText('10분 후 기존 회의 일정이 시작됩니다.')).toBeInTheDocument();
});
