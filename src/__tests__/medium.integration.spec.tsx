import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within, act } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { ReactElement } from 'react';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
  setupMockHandlerCreationWithNewRepeatedEvents,
} from '../__mocks__/handlersUtils';
import App from '../App';
import { server } from '../setupTests';
import { Event } from '../types';

// ! Hard 여기 제공 안함
const setup = (element: ReactElement) => {
  const user = userEvent.setup();

  return { ...render(<ChakraProvider>{element}</ChakraProvider>), user }; // ? Med: 왜 ChakraProvider로 감싸는지 물어보자
};

// ! Hard 여기 제공 안함
const saveSchedule = async (
  user: UserEvent,
  form: Omit<Event, 'id' | 'notificationTime' | 'repeat'>
) => {
  const { title, date, startTime, endTime, location, description, category } = form;

  await user.click(screen.getAllByText('일정 추가')[0]);

  await user.type(screen.getByLabelText('제목'), title);
  await user.type(screen.getByLabelText('날짜'), date);
  await user.type(screen.getByLabelText('시작 시간'), startTime);
  await user.type(screen.getByLabelText('종료 시간'), endTime);
  await user.type(screen.getByLabelText('설명'), description);
  await user.type(screen.getByLabelText('위치'), location);
  await user.selectOptions(screen.getByLabelText('카테고리'), category);

  await user.click(screen.getByTestId('event-submit-button'));
};

const saveNewScheduleWithRepeatEvent = async (
  user: UserEvent,
  form: Omit<Event, 'id' | 'notificationTime'>
) => {
  const { title, date, startTime, endTime, location, description, category, repeat } = form;
  const { type, interval, endDate, monthType, weekType, day, weekOrder } = repeat;

  await user.click(screen.getAllByText('일정 추가')[0]);

  const intervalInput = screen.getByLabelText('반복 간격');
  await user.clear(intervalInput);

  await user.type(screen.getByLabelText('제목'), title);
  await user.type(screen.getByLabelText('날짜'), date);
  await user.type(screen.getByLabelText('시작 시간'), startTime);
  await user.type(screen.getByLabelText('종료 시간'), endTime);
  await user.type(screen.getByLabelText('설명'), description);
  await user.type(screen.getByLabelText('위치'), location);
  await user.selectOptions(screen.getByLabelText('카테고리'), category);

  await user.selectOptions(screen.getByLabelText('반복 유형'), type);
  await user.type(intervalInput, interval.toString());
  await user.type(screen.getByLabelText('반복 종료일'), endDate ?? '');
  if (type === 'yearly') {
    await user.selectOptions(screen.getByLabelText('반복 월'), monthType ?? 'none');
  }
  if (type === 'monthly' || type === 'yearly') {
    const weekOrderInput = screen.getByLabelText('반복 주차');
    const dayInput = screen.getByLabelText('반복 일자');
    await user.clear(dayInput);
    if (weekOrder) await user.type(weekOrderInput, weekOrder.toString());
    if (day) await user.type(dayInput, day.toString());
  }

  if (type === 'weekly' || type === 'monthly' || type === 'yearly') {
    if (weekType) {
      await user.selectOptions(screen.getByLabelText('반복 요일'), weekType);
    }
  }

  await user.click(screen.getByTestId('event-submit-button'));
};

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

describe('반복 일정 뷰', () => {
  it('🟢 반복 설정은 기본으로 체크되어있고 "반복 유형", "반복 간격", "반복 종료일"이 노출된다', async () => {
    setup(<App />);

    const checkBox = screen.getByLabelText('반복 설정');
    expect(checkBox).toBeChecked();

    const repeatTypeSelect = screen.getByRole('combobox', { name: /반복 유형/i });
    expect(repeatTypeSelect).toBeInTheDocument();

    const repeatIntervalInput = screen.getByRole('spinbutton', { name: /반복 간격/i });
    expect(repeatIntervalInput).toBeInTheDocument();

    const repeatEndDateInput = screen.getByLabelText(/반복 종료일/i);
    expect(repeatEndDateInput).toBeInTheDocument();
  });
  it('🟢 반복 설정에서 "반복 유형" 을 "weekly"로 설정할 시 "반복 요일"도 함께 노출된다.', async () => {
    const { user } = setup(<App />);

    const checkBox = screen.getByLabelText('반복 설정');
    expect(checkBox).toBeChecked();

    const repeatTypeSelect = screen.getByRole('combobox', { name: /반복 유형/i });
    await user.selectOptions(repeatTypeSelect, 'weekly');

    const repeatIntervalInput = screen.getByRole('spinbutton', { name: /반복 간격/i });
    expect(repeatIntervalInput).toBeInTheDocument();

    const repeatEndDateInput = screen.getByLabelText(/반복 종료일/i);
    expect(repeatEndDateInput).toBeInTheDocument();

    const weekTypeSelect = screen.getByRole('combobox', { name: /반복 요일/i });
    expect(weekTypeSelect).toBeInTheDocument();
  });
  it('🟢 반복 설정에서 "반복 유형" 을 "monthly"로 설정할 시 "반복 주차"와 "반복 일자"가 함께 노출된다.', async () => {
    const { user } = setup(<App />);

    const checkBox = screen.getByLabelText('반복 설정');
    expect(checkBox).toBeChecked();

    const repeatTypeSelect = screen.getByRole('combobox', { name: /반복 유형/i });
    await user.selectOptions(repeatTypeSelect, 'monthly');

    const repeatIntervalInput = screen.getByRole('spinbutton', { name: /반복 간격/i });
    expect(repeatIntervalInput).toBeInTheDocument();

    const repeatEndDateInput = screen.getByLabelText(/반복 종료일/i);
    expect(repeatEndDateInput).toBeInTheDocument();

    const weekTypeSelect = screen.getByRole('combobox', { name: /반복 요일/i });
    expect(weekTypeSelect).toBeInTheDocument();

    const weekOrderSelect = screen.getByRole('combobox', { name: /반복 주차/i });
    expect(weekOrderSelect).toBeInTheDocument();

    const dayInput = screen.getByLabelText(/반복 일자/);
    expect(dayInput).toBeInTheDocument();
  });
  it('🟢 반복 설정에서 "반복 유형" 을 "yearly"로 설정할 시 "반복 월"이 함께 노출된다.', async () => {
    const { user } = setup(<App />);

    const checkBox = screen.getByLabelText('반복 설정');
    expect(checkBox).toBeChecked();

    const repeatTypeSelect = screen.getByRole('combobox', { name: /반복 유형/i });
    await user.selectOptions(repeatTypeSelect, 'yearly');

    const repeatIntervalInput = screen.getByRole('spinbutton', { name: /반복 간격/i });
    expect(repeatIntervalInput).toBeInTheDocument();

    const repeatEndDateInput = screen.getByLabelText(/반복 종료일/i);
    expect(repeatEndDateInput).toBeInTheDocument();

    const weekTypeSelect = screen.getByRole('combobox', { name: /반복 요일/i });
    expect(weekTypeSelect).toBeInTheDocument();

    const weekOrderSelect = screen.getByRole('combobox', { name: /반복 주차/i });
    expect(weekOrderSelect).toBeInTheDocument();

    const dayInput = screen.getByLabelText(/반복 일자/);
    expect(dayInput).toBeInTheDocument();

    const monthTypeSelect = screen.getByRole('combobox', { name: /반복 월/i });
    expect(monthTypeSelect).toBeInTheDocument();
  });
});

describe('일정 신규 등록 시 반복 일정 함께 신규 저장', () => {
  it('🟢 반복 일정에 대한 표시가 뷰에 노출된다.', async () => {
    setupMockHandlerCreationWithNewRepeatedEvents();

    const { user } = setup(<App />);

    await saveNewScheduleWithRepeatEvent(user, {
      title: '새 회의',
      date: '2024-10-15',
      startTime: '14:00',
      endTime: '15:00',
      description: '프로젝트 진행 상황 논의',
      location: '회의실 A',
      category: '업무',
      repeat: {
        type: 'daily',
        interval: 1,
        endDate: '2024-10-19',
      },
    });

    // 이벤트 저장 및 상태 업데이트 대기
    await act(() => Promise.resolve());

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getAllByText('🔔 새 회의')[0]).toBeInTheDocument();
  });
  it('🟢 매일 이벤트 일정을 등록할 수 있다.', async () => {
    setupMockHandlerCreationWithNewRepeatedEvents();

    const { user } = setup(<App />);

    await saveNewScheduleWithRepeatEvent(user, {
      title: '새 회의',
      date: '2024-10-15',
      startTime: '14:00',
      endTime: '15:00',
      description: '프로젝트 진행 상황 논의',
      location: '회의실 A',
      category: '업무',
      repeat: {
        type: 'daily',
        interval: 1,
        endDate: '2024-10-19',
      },
    });

    // 이벤트 저장 및 상태 업데이트 대기
    await act(() => Promise.resolve());

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText(/2024-10-15/i)).toBeInTheDocument();
    expect(eventList.getByText(/2024-10-16/i)).toBeInTheDocument();
    expect(eventList.getByText(/2024-10-17/i)).toBeInTheDocument();
    expect(eventList.getByText(/2024-10-18/i)).toBeInTheDocument();
    expect(eventList.getAllByText('2024-10-19')[0]).toBeInTheDocument();
  });
  it('🟢 매주 이벤트 일정을 등록할 수 있다.', async () => {
    setupMockHandlerCreationWithNewRepeatedEvents();

    const { user } = setup(<App />);

    await saveNewScheduleWithRepeatEvent(user, {
      title: '새 회의',
      date: '2024-10-15',
      startTime: '14:00',
      endTime: '15:00',
      description: '프로젝트 진행 상황 논의',
      location: '회의실 A',
      category: '업무',
      repeat: {
        type: 'weekly',
        interval: 1,
        endDate: '2024-11-13',
      },
    });

    // 이벤트 저장 및 상태 업데이트 대기
    await act(() => Promise.resolve());

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText(/2024-10-15/i)).toBeInTheDocument();
    expect(eventList.getByText(/2024-10-22/i)).toBeInTheDocument();
    expect(eventList.getByText(/2024-10-29/i)).toBeInTheDocument();
  });
  it('🟢 매월 이벤트 일정을 등록할 수 있다.', async () => {
    vi.setSystemTime(new Date('2024-11-02'));
    setupMockHandlerCreationWithNewRepeatedEvents();

    const { user } = setup(<App />);

    await saveNewScheduleWithRepeatEvent(user, {
      title: '새 회의',
      date: '2024-10-15',
      startTime: '14:00',
      endTime: '15:00',
      description: '프로젝트 진행 상황 논의',
      location: '회의실 A',
      category: '업무',
      repeat: {
        type: 'monthly',
        interval: 1,
        endDate: '2024-12-31',
      },
    });

    // 이벤트 저장 및 상태 업데이트 대기
    await act(() => Promise.resolve());

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText(/2024-11-15/i)).toBeInTheDocument();
  });
  // 매년
  it('🟢 매년 이벤트 일정을 등록할 수 있다.', async () => {
    vi.setSystemTime(new Date('2029-10-02'));
    setupMockHandlerCreationWithNewRepeatedEvents();

    const { user } = setup(<App />);

    await saveNewScheduleWithRepeatEvent(user, {
      title: '새 회의',
      date: '2024-10-15',
      startTime: '14:00',
      endTime: '15:00',
      description: '프로젝트 진행 상황 논의',
      location: '회의실 A',
      category: '업무',
      repeat: {
        type: 'yearly',
        interval: 1,
        endDate: '2030-12-31',
      },
    });

    // 이벤트 저장 및 상태 업데이트 대기
    await act(() => Promise.resolve());

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText(/2029-10-15/i)).toBeInTheDocument();
  });
  it('🟢 2일마다 반복 이벤트 일정을 등록할 수 있다.', async () => {
    setupMockHandlerCreationWithNewRepeatedEvents();

    const { user } = setup(<App />);

    await saveNewScheduleWithRepeatEvent(user, {
      title: '새 회의',
      date: '2024-10-15',
      startTime: '14:00',
      endTime: '15:00',
      description: '프로젝트 진행 상황 논의',
      location: '회의실 A',
      category: '업무',
      repeat: {
        type: 'daily',
        interval: 2,
        endDate: '2024-10-20',
      },
    });

    // 이벤트 저장 및 상태 업데이트 대기
    await act(() => Promise.resolve());

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText(/2024-10-15/i)).toBeInTheDocument();
    expect(eventList.getByText(/2024-10-17/i)).toBeInTheDocument();
    expect(eventList.getByText(/2024-10-19/i)).toBeInTheDocument();
  });
  it('🟢 3주마다 반복 이벤트 일정을 등록할 수 있다.', async () => {
    setupMockHandlerCreationWithNewRepeatedEvents();

    const { user } = setup(<App />);

    await saveNewScheduleWithRepeatEvent(user, {
      title: '새 회의',
      date: '2024-10-01',
      startTime: '14:00',
      endTime: '15:00',
      description: '프로젝트 진행 상황 논의',
      location: '회의실 A',
      category: '업무',
      repeat: {
        type: 'weekly',
        interval: 3,
        endDate: '2024-11-13',
      },
    });

    // 이벤트 저장 및 상태 업데이트 대기
    await act(() => Promise.resolve());

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText(/2024-10-01/i)).toBeInTheDocument();
    expect(eventList.getByText(/2024-10-22/i)).toBeInTheDocument();
  });
  it('🟢 2개월마다 반복 이벤트 일정을 등록할 수 있다.', async () => {
    vi.setSystemTime(new Date('2025-02-02'));
    setupMockHandlerCreationWithNewRepeatedEvents();

    const { user } = setup(<App />);

    await saveNewScheduleWithRepeatEvent(user, {
      title: '새 회의',
      date: '2024-10-15',
      startTime: '14:00',
      endTime: '15:00',
      description: '프로젝트 진행 상황 논의',
      location: '회의실 A',
      category: '업무',
      repeat: {
        type: 'monthly',
        interval: 2,
        endDate: '2025-03-31',
      },
    });

    // 이벤트 저장 및 상태 업데이트 대기
    await act(() => Promise.resolve());

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText(/2025-02-15/i)).toBeInTheDocument();
  });
});
