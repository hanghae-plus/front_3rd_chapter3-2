import { ChakraProvider } from '@chakra-ui/react';
import { cleanup, render, screen, within } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { ReactElement } from 'react';

import {
  setupMockHandlerGetEvents,
  setUpMockHandlerRepeatCreation,
} from '../__mocks__/handlersUtils.ts';
import App from '../App.tsx';
import { Event } from '../types';

const setup = (element: ReactElement) => {
  const user = userEvent.setup();

  return { ...render(<ChakraProvider>{element}</ChakraProvider>), user };
};

const saveScheduleRepeat = async (
  user: UserEvent,
  form: Omit<Event, 'id' | 'notificationTime'>
) => {
  const {
    title,
    date,
    startTime,
    endTime,
    location,
    description,
    category,
    repeat: { endDate, type, interval },
  } = form;

  await user.click(screen.getAllByText('일정 추가')[0]);

  await user.type(screen.getByLabelText('제목'), title);
  await user.type(screen.getByLabelText('날짜'), date);
  await user.type(screen.getByLabelText('시작 시간'), startTime);
  await user.type(screen.getByLabelText('종료 시간'), endTime);
  await user.type(screen.getByLabelText('설명'), description);
  await user.type(screen.getByLabelText('위치'), location);
  await user.selectOptions(screen.getByLabelText('카테고리'), category);
  await user.selectOptions(screen.getByLabelText('반복 유형'), type);
  const intervalInput = screen.getByLabelText('반복 간격');
  await user.clear(intervalInput);
  await user.paste(String(interval));
  endDate && (await user.type(screen.getByLabelText('반복 종료일'), endDate));

  await user.click(screen.getByTestId('event-submit-button'));
};

const assertEventOnDate = async (date: string, expectedMonth: string) => {
  vi.setSystemTime(new Date(`${date}T09:00:00`));
  cleanup();
  setup(<App />);

  const monthView = within(screen.getByTestId('month-view'));
  const eventList = within(screen.getByTestId('event-list'));

  expect(monthView.getByText(expectedMonth)).toBeInTheDocument();
  await expect(eventList.findByText(date)).resolves.toBeInTheDocument();
};

describe('반복 일정 생성', () => {
  it('매일 반복 일정이 정상적으로 생성되어야 한다', async () => {
    setUpMockHandlerRepeatCreation();
    const { user } = setup(<App />);

    await saveScheduleRepeat(user, {
      title: '매일 회의',
      date: '2024-01-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '설명',
      location: '위치',
      category: '업무',
      repeat: { type: 'daily', interval: 1, endDate: '2024-01-05' },
    });

    await assertEventOnDate('2024-01-01', '2024년 1월');
    await assertEventOnDate('2024-01-02', '2024년 1월');
    await assertEventOnDate('2024-01-03', '2024년 1월');
  });

  it('매주 반복 일정이 정상적으로 생성되어야 한다', async () => {
    setUpMockHandlerRepeatCreation();
    const { user } = setup(<App />);

    await saveScheduleRepeat(user, {
      title: '주간 회의',
      date: '2024-01-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '설명',
      location: '위치',
      category: '업무',
      repeat: { type: 'weekly', interval: 1, endDate: '2024-02-01' },
    });

    await assertEventOnDate('2024-01-15', '2024년 1월');
    await assertEventOnDate('2024-01-29', '2024년 1월');
  });

  it('매달 반복 일정이 정상적으로 생성되어야 한다', async () => {
    setUpMockHandlerRepeatCreation();
    const { user } = setup(<App />);

    await saveScheduleRepeat(user, {
      title: '주간 회의',
      date: '2024-01-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '설명',
      location: '위치',
      category: '업무',
      repeat: { type: 'monthly', interval: 1, endDate: '2024-03-01' },
    });

    await assertEventOnDate('2024-02-01', '2024년 2월');
    await assertEventOnDate('2024-03-01', '2024년 3월');
  });

  it('월말에서 다음달 초로 넘어가는 일일 반복이 정상 동작해야 한다', async () => {
    setUpMockHandlerRepeatCreation();
    const { user } = setup(<App />);

    await saveScheduleRepeat(user, {
      title: '월말 회의',
      date: '2024-01-31',
      startTime: '10:00',
      endTime: '11:00',
      description: '설명',
      location: '위치',
      category: '업무',
      repeat: { type: 'daily', interval: 1, endDate: '2024-02-02' },
    });

    await assertEventOnDate('2024-02-01', '2024년 2월');
  });

  it('연도가 바뀌는 월간 반복이 정상 동작해야 한다', async () => {
    setUpMockHandlerRepeatCreation();
    const { user } = setup(<App />);

    await saveScheduleRepeat(user, {
      title: '연말 회의',
      date: '2023-12-31',
      startTime: '10:00',
      endTime: '11:00',
      description: '설명',
      location: '위치',
      category: '업무',
      repeat: { type: 'monthly', interval: 1, endDate: '2024-02-29' },
    });

    await assertEventOnDate('2024-01-31', '2024년 1월');
  });

  it('윤년 29일에 매년 반복일정 설정 시 평년에서 28일로 설정되어야 한다.', async () => {
    setUpMockHandlerRepeatCreation();
    const { user } = setup(<App />);

    await saveScheduleRepeat(user, {
      title: '제목',
      date: '2024-02-29',
      startTime: '10:00',
      endTime: '11:00',
      description: '설명',
      location: '위치',
      category: '업무',
      repeat: { type: 'yearly', interval: 1, endDate: '2025-03-30' },
    });

    await assertEventOnDate('2025-02-28', '2025년 2월');
  });

  it('매달 31일 반복일정 설정 시 31일이 없는 달에는 마지막 날로 설정되어야 한다.', async () => {
    setUpMockHandlerRepeatCreation();
    const { user } = setup(<App />);

    await saveScheduleRepeat(user, {
      title: '제목',
      date: '2024-01-31',
      startTime: '10:00',
      endTime: '11:00',
      description: '설명',
      location: '위치',
      category: '업무',
      repeat: { type: 'monthly', interval: 1, endDate: '2024-04-30' },
    });

    await assertEventOnDate('2024-02-29', '2024년 2월');
    await assertEventOnDate('2024-04-30', '2024년 4월');
  });
});

describe('반복 유형 선택', () => {
  it('일정 생성시 반복 유형을 선택할 수 있다.', () => {
    setup(<App />);

    expect(screen.getByLabelText('반복 유형')).toBeInTheDocument();
  });

  it('일정 수정시 반복 유형을 선택할 수 있다.', async () => {
    const initEvent: Event[] = [
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
    ];
    setupMockHandlerGetEvents(initEvent);
    const { user } = setup(<App />);

    const eventList = within(screen.getByTestId('event-list'));

    await expect(eventList.findByText('기존 회의')).resolves.toBeInTheDocument();

    await user.click(screen.getByLabelText('Edit event'));
    await user.click(screen.getByLabelText('반복 설정'));

    expect(screen.getByLabelText('반복 유형')).toBeInTheDocument();
  });
});

describe('반복 간격 설정', () => {
  it('2일마다 반복되는 일정이 정상적으로 생성되어야 한다', async () => {
    setUpMockHandlerRepeatCreation();
    const { user } = setup(<App />);

    await saveScheduleRepeat(user, {
      title: '2일마다 회의',
      date: '2024-01-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '설명',
      location: '위치',
      category: '업무',
      repeat: { type: 'daily', interval: 2, endDate: '2024-01-05' },
    });

    await assertEventOnDate('2024-01-01', '2024년 1월'); // 초기 생성
    await assertEventOnDate('2024-01-03', '2024년 1월'); // 2일 후
    await assertEventOnDate('2024-01-05', '2024년 1월'); // 4일 후
  });

  it('3주마다 반복되는 일정이 정상적으로 생성되어야 한다', async () => {
    setUpMockHandlerRepeatCreation();
    const { user } = setup(<App />);

    await saveScheduleRepeat(user, {
      title: '3주마다 회의',
      date: '2024-01-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '설명',
      location: '위치',
      category: '업무',
      repeat: { type: 'weekly', interval: 3, endDate: '2024-02-01' },
    });

    await assertEventOnDate('2024-01-01', '2024년 1월'); // 초기 생성
    await assertEventOnDate('2024-01-22', '2024년 1월'); // 3주 후
  });

  it('2개월마다 반복되는 일정이 정상적으로 생성되어야 한다', async () => {
    setUpMockHandlerRepeatCreation();
    const { user } = setup(<App />);

    await saveScheduleRepeat(user, {
      title: '2개월마다 회의',
      date: '2024-01-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '설명',
      location: '위치',
      category: '업무',
      repeat: { type: 'monthly', interval: 2, endDate: '2024-05-15' },
    });

    await assertEventOnDate('2024-01-15', '2024년 1월'); // 초기 생성
    await assertEventOnDate('2024-03-15', '2024년 3월'); // 2개월 후
    await assertEventOnDate('2024-05-15', '2024년 5월'); // 4개월 후
  });

  it('2년마다 반복되는 일정이 정상적으로 생성되어야 한다', async () => {
    setUpMockHandlerRepeatCreation();
    const { user } = setup(<App />);

    await saveScheduleRepeat(user, {
      title: '2년마다 회의',
      date: '2020-01-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '설명',
      location: '위치',
      category: '업무',
      repeat: { type: 'yearly', interval: 2, endDate: '2028-01-15' },
    });

    await assertEventOnDate('2022-01-15', '2022년 1월'); // 초기 생성
    await assertEventOnDate('2024-01-15', '2024년 1월'); // 2년 후
  });
});

describe('반복 일정 표시', () => {
  it('반복 일정은 아이콘과 함께 표시되어야 한다', async () => {
    const events: Event[] = [
      {
        id: '1',
        title: '반복 회의',
        date: '2024-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'weekly', interval: 1, endDate: '2024-02-15' },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '일반 회의',
        date: '2024-10-15',
        startTime: '11:00',
        endTime: '12:00',
        description: '일반 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];

    setupMockHandlerGetEvents(events);
    setup(<App />);

    const monthView = within(screen.getByTestId('month-view'));
    const eventList = within(screen.getByTestId('event-list'));

    const repeatEvent = await monthView.findByText('반복 회의');
    const repeatIcon = repeatEvent.querySelector('.chakra-icon');
    expect(repeatIcon).toBeInTheDocument();

    const normalEvent = monthView.getByText('일반 회의');
    const normalRepeatIcon = normalEvent.querySelector('.chakra-icon');
    expect(normalRepeatIcon).not.toBeInTheDocument();

    const repeatEventList = eventList.getByText('반복 회의');
    const repeatEventListIcon = repeatEventList.querySelector('.chakra-icon');
    expect(repeatEventListIcon).toBeInTheDocument();

    const normalEventList = eventList.getByText('일반 회의');
    const normalEventListIcon = normalEventList.querySelector('.chakra-icon');
    expect(normalEventListIcon).not.toBeInTheDocument();
  });
});

describe('반복 일정 종료', () => {
  it('종료 일정이 있다면 종료 일정 이후 일정이 삭제 된다.', async () => {
    setUpMockHandlerRepeatCreation();
    const { user } = setup(<App />);

    await saveScheduleRepeat(user, {
      title: '매일 회의',
      date: '2024-01-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '설명',
      location: '위치',
      category: '업무',
      repeat: { type: 'daily', interval: 1, endDate: '2024-01-03' },
    });

    await assertEventOnDate('2024-01-01', '2024년 1월');
    await assertEventOnDate('2024-01-02', '2024년 1월');
    await assertEventOnDate('2024-01-03', '2024년 1월');

    vi.setSystemTime(new Date('2024-01-04T09:00:00'));
    cleanup();
    setup(<App />);

    const eventList = within(screen.getByTestId('event-list'));
    await expect(eventList.findByText('매일 회의')).rejects.toThrow();
  });

  it('종료일이 2025-06-30 이후인 경우 자동으로 2025-06-30로 설정되어야 한다', async () => {
    setUpMockHandlerRepeatCreation();
    const { user } = setup(<App />);

    await saveScheduleRepeat(user, {
      title: '매월 회의',
      date: '2024-01-30',
      startTime: '10:00',
      endTime: '11:00',
      description: '설명',
      location: '위치',
      category: '업무',
      repeat: { type: 'monthly', interval: 1, endDate: '2026-01-01' },
    });

    await assertEventOnDate('2025-06-30', '2025년 6월');

    vi.setSystemTime(new Date('2025-07-01T09:00:00'));
    cleanup();
    setup(<App />);

    const eventList = within(screen.getByTestId('event-list'));
    await expect(eventList.findByText('매월 회의')).rejects.toThrow();
  });

  it('종료일이 없는 경우 2025-06-30까지 반복되어야 한다', async () => {
    setUpMockHandlerRepeatCreation();
    const { user } = setup(<App />);

    await saveScheduleRepeat(user, {
      title: '매주 회의',
      date: '2024-01-30',
      startTime: '10:00',
      endTime: '11:00',
      description: '설명',
      location: '위치',
      category: '업무',
      repeat: { type: 'weekly', interval: 1 },
    });

    await assertEventOnDate('2025-06-24', '2025년 6월');

    vi.setSystemTime(new Date('2025-07-01T09:00:00'));
    cleanup();
    setup(<App />);

    const eventList = within(screen.getByTestId('event-list'));
    await expect(eventList.findByText('매주 회의')).rejects.toThrow();
  });
});
