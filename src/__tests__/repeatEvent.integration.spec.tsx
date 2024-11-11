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
  await user.type(screen.getByLabelText('반복 종료일'), endDate ?? date);

  await user.click(screen.getByTestId('event-submit-button'));
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
      repeat: { type: 'daily', interval: 2, endDate: '2024-01-05' },
    });

    // 2일 후 확인
    vi.setSystemTime(new Date('2024-01-03T09:00:00'));
    cleanup();
    setup(<App />);

    const eventList = within(screen.getByTestId('event-list'));
    await expect(eventList.findByText('2024-01-03')).resolves.toBeInTheDocument();
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
      repeat: { type: 'weekly', interval: 2, endDate: '2024-02-01' },
    });

    // 2주 후 확인
    vi.setSystemTime(new Date('2024-01-15T09:00:00'));
    cleanup();
    setup(<App />);

    const eventList = within(screen.getByTestId('event-list'));
    await expect(eventList.findByText('2024-01-15')).resolves.toBeInTheDocument();
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

    // 다음달 1일 확인
    vi.setSystemTime(new Date('2024-02-01T09:00:00'));
    cleanup();
    setup(<App />);

    const eventList = within(screen.getByTestId('event-list'));
    await expect(eventList.findByText('2024-02-01')).resolves.toBeInTheDocument();
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

    // 다음해 1월 확인
    vi.setSystemTime(new Date('2024-01-31T09:00:00'));
    cleanup();
    setup(<App />);

    const eventList = within(screen.getByTestId('event-list'));
    await expect(eventList.findByText('2024-01-31')).resolves.toBeInTheDocument();
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

    vi.setSystemTime(new Date('2025-02-28T09:00:00'));
    cleanup();
    setup(<App />);

    const monthView = within(screen.getByTestId('month-view'));
    const eventList = within(screen.getByTestId('event-list'));

    expect(monthView.getByText('2025년 2월')).toBeInTheDocument();
    await expect(eventList.findByText('2025-02-28')).resolves.toBeInTheDocument();
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

    vi.setSystemTime(new Date('2024-02-29T09:00:00'));
    cleanup();
    setup(<App />);

    expect(within(screen.getByTestId('month-view')).getByText('2024년 2월')).toBeInTheDocument();
    await expect(
      within(screen.getByTestId('event-list')).findByText('2024-02-29')
    ).resolves.toBeInTheDocument();

    vi.setSystemTime(new Date('2024-04-30T09:00:00'));
    cleanup();
    setup(<App />);

    expect(within(screen.getByTestId('month-view')).getByText('2024년 4월')).toBeInTheDocument();
    await expect(
      within(screen.getByTestId('event-list')).findByText('2024-04-30')
    ).resolves.toBeInTheDocument();
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
