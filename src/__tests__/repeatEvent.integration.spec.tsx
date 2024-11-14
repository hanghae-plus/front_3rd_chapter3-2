import { ChakraProvider } from '@chakra-ui/react';
import { cleanup, render, screen, within } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { ReactElement } from 'react';

import {
  setupMockHandlerGetEvents,
  setUpMockHandlerRepeatCreation,
} from '../__mocks__/handlersUtils.ts';
import App from '../App.tsx';
import { server } from '../setupTests.ts';
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

const assertEventExistsOnDateInMonth = async (date: string, expectedMonth: string) => {
  vi.setSystemTime(new Date(`${date}T09:00:00`));
  cleanup();
  setup(<App />);

  const monthView = within(screen.getByTestId('month-view'));
  const eventList = within(screen.getByTestId('event-list'));

  expect(monthView.getByText(expectedMonth)).toBeInTheDocument();
  expect(await eventList.findByText(date)).toBeInTheDocument();
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

    await assertEventExistsOnDateInMonth('2024-01-01', '2024년 1월');
    await assertEventExistsOnDateInMonth('2024-01-03', '2024년 1월');
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

    await assertEventExistsOnDateInMonth('2024-01-15', '2024년 1월');
    await assertEventExistsOnDateInMonth('2024-01-29', '2024년 1월');
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

    await assertEventExistsOnDateInMonth('2024-02-01', '2024년 2월');
    await assertEventExistsOnDateInMonth('2024-03-01', '2024년 3월');
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

    await assertEventExistsOnDateInMonth('2024-02-01', '2024년 2월');
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

    await assertEventExistsOnDateInMonth('2024-01-31', '2024년 1월');
  });
});

describe('반복 일정 예외 처리', () => {
  it('반복 간격 설정을 0으로 입력시 오류 토스트가 노출 된다.', async () => {
    setupMockHandlerGetEvents();
    const { user } = setup(<App />);

    await saveScheduleRepeat(user, {
      title: '연말 회의',
      date: '2023-12-31',
      startTime: '10:00',
      endTime: '11:00',
      description: '설명',
      location: '위치',
      category: '업무',
      repeat: { type: 'monthly', interval: 0, endDate: '2024-02-29' },
    });

    expect(screen.queryByText('반복 간격을 1이상 설정해 주세요.')).toBeInTheDocument();
  });

  it('반복 종료일이 일정 날짜 보다 빠르면 오류 토스트가 노출 된다.', async () => {
    setupMockHandlerGetEvents();
    const { user } = setup(<App />);

    await saveScheduleRepeat(user, {
      title: '연말 회의',
      date: '2024-10-31',
      startTime: '10:00',
      endTime: '11:00',
      description: '설명',
      location: '위치',
      category: '업무',
      repeat: { type: 'daily', interval: 1, endDate: '2024-10-29' },
    });

    expect(
      screen.queryByText('반복 종료일을 시작 날짜보다 늦게 설정해 주세요.')
    ).toBeInTheDocument();
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

    await assertEventExistsOnDateInMonth('2025-02-28', '2025년 2월');
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

    await assertEventExistsOnDateInMonth('2024-02-29', '2024년 2월');
    await assertEventExistsOnDateInMonth('2024-04-30', '2024년 4월');
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

    expect(await eventList.findByText('기존 회의')).toBeInTheDocument();

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

    await assertEventExistsOnDateInMonth('2024-01-01', '2024년 1월'); // 초기 생성
    await assertEventExistsOnDateInMonth('2024-01-05', '2024년 1월'); // 4일 후
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

    await assertEventExistsOnDateInMonth('2024-01-01', '2024년 1월'); // 초기 생성
    await assertEventExistsOnDateInMonth('2024-01-22', '2024년 1월'); // 3주 후
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

    await assertEventExistsOnDateInMonth('2024-01-15', '2024년 1월'); // 초기 생성
    await assertEventExistsOnDateInMonth('2024-05-15', '2024년 5월'); // 4개월 후
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

    await assertEventExistsOnDateInMonth('2022-01-15', '2022년 1월'); // 초기 생성
    await assertEventExistsOnDateInMonth('2024-01-15', '2024년 1월'); // 2년 후
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

    await assertEventExistsOnDateInMonth('2025-06-30', '2025년 6월');

    vi.setSystemTime(new Date('2025-07-01T09:00:00'));
    cleanup();
    setup(<App />);

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.queryByText('매일 회의')).not.toBeInTheDocument();
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

    await assertEventExistsOnDateInMonth('2025-06-24', '2025년 6월');

    vi.setSystemTime(new Date('2025-07-01T09:00:00'));
    cleanup();
    setup(<App />);

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.queryByText('매주 회의')).not.toBeInTheDocument();
  });
});

describe('반복 일정 단일 수정, 삭제', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '매일 회의',
      date: '2024-10-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '설명',
      location: '위치',
      category: '업무',
      repeat: {
        type: 'monthly',
        interval: 1,
        endDate: '2024-12-30',
      },
      notificationTime: 10,
    },
    {
      id: '3',
      title: '매일 회의',
      date: '2024-11-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '설명',
      location: '위치',
      category: '업무',
      repeat: {
        type: 'monthly',
        interval: 1,
        endDate: '2024-12-30',
      },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '매일 회의',
      date: '2024-12-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '설명',
      location: '위치',
      category: '업무',
      repeat: {
        type: 'monthly',
        interval: 1,
        endDate: '2024-12-30',
      },
      notificationTime: 10,
    },
  ];

  it('반복 일정을 수정하면 단일 일정으로 변경되고 아이콘이 사라져야 한다', async () => {
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

    const { user } = setup(<App />);

    await user.click(await screen.findByLabelText('Edit event'));
    await user.click(screen.getByLabelText('반복 설정'));

    expect(screen.queryByLabelText('반복 유형')).not.toBeInTheDocument();

    await user.click(screen.getByTestId('event-submit-button'));

    const eventList = within(screen.getByTestId('event-list'));

    const eventItem = await eventList.findByText('매일 회의');
    const eventItemRepeatIcon = eventItem.querySelector('.chakra-icon');
    expect(eventItemRepeatIcon).not.toBeInTheDocument();

    // 다른 반복 일정들은 그대로 유지되는지 확인
    vi.setSystemTime(new Date('2024-11-01'));
    cleanup();
    setup(<App />);

    const repeatEventList = within(screen.getByTestId('event-list'));

    const repeatEventItem = await repeatEventList.findByText('매일 회의');
    const repeatEventItemIcon = repeatEventItem.querySelector('.chakra-icon');
    expect(repeatEventItemIcon).toBeInTheDocument();
  });

  it('반복 일정을 삭제하면 해당 일정만 삭제되고 다른 반복 일정은 유지되어야 한다', async () => {
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

    const { user } = setup(<App />);
    const eventList = within(screen.getByTestId('event-list'));
    expect(await eventList.findByText('매일 회의')).toBeInTheDocument();

    const deleteButton = await screen.findByLabelText('Delete event');
    await user.click(deleteButton);

    expect(await eventList.findByText('검색 결과가 없습니다.')).toBeInTheDocument();

    // 다른 반복 일정들은 그대로 유지되는지 확인
    vi.setSystemTime(new Date('2024-12-01'));
    cleanup();
    setup(<App />);

    const repeatEventList = within(screen.getByTestId('event-list'));

    expect(await repeatEventList.findByText('매일 회의')).toBeInTheDocument();
  });
});
