import { render, screen, within, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import React from 'react';

import {
  setupCreateHandler,
  setupDeleteHandler,
  setupUpdateHandler,
} from '../__mocks__/handlersUtils';
import App from '../App';
import { Event, EventForm } from '../types';

import { Providers } from '@/app/providers';

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

const Provider = ({ children }: { children: React.ReactNode }) => <Providers>{children}</Providers>;

describe('일정 CRUD 및 기본 기능', () => {
  const newEvent = {
    title: '새로운 일정',
    date: '2024-10-15',
    startTime: '10:00',
    endTime: '11:00',
    description: '새로운 일정 설명',
    location: '새로운 장소',
    category: '업무',
    notificationTime: 10,
    repeat: {
      type: 'daily',
      interval: 1,
    },
    repeatEndDate: '2024-12-31',
  } as EventForm;

  beforeEach(() => {
    vi.setSystemTime('2024-10-01T00:00:00');
    render(<App />, { wrapper: Provider });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ! HINT. "검색 결과가 없습니다"는 초기에 노출되는데요. 그럼 검증하고자 하는 액션이 실행되기 전에 검증해버리지 않을까요? 이 테스트를 신뢰성있게 만드려면 어떻게 할까요?
  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.
    const _initialEvents = [...initialEvents];
    setupCreateHandler(_initialEvents);

    expect(screen.getByText(/검색 결과가 없습니다/i)).toBeInTheDocument();

    // 한번만 나오게 할 수는 없을까?
    const toastMessage = await screen.findAllByText(/일정 로딩 완료!/i);
    expect(toastMessage[0]).toBeInTheDocument();

    expect(screen.queryByText(/검색 결과가 없습니다/i)).not.toBeInTheDocument();

    // 일정 추가 시 추가되는 요소들
    const titleInput = screen.getByLabelText('제목');
    const dateInput = screen.getByLabelText('날짜');
    const startTimeInput = screen.getByLabelText('시작 시간');
    const endTimeInput = screen.getByLabelText('종료 시간');
    const descriptionInput = screen.getByLabelText('설명');
    const locationInput = screen.getByLabelText('위치');
    const categoryInput = screen.getByLabelText('카테고리');
    const repeatCheckbox = screen.getByLabelText('반복 일정');
    const notificationTimeSelect = screen.getByLabelText('알림 설정');

    // 반복 일정 체크 시 추가되는 요소들
    const repeatTypeSelect = screen.queryByLabelText('반복 유형');
    const repeatIntervalInput = screen.queryByLabelText('반복 간격');

    // 일정 추가 버튼
    const addEventButton = screen.getByTestId('event-submit-button');

    // ================================================================

    // 필드 입력
    await userEvent.type(titleInput, newEvent.title);
    await userEvent.type(dateInput, newEvent.date);
    await userEvent.type(startTimeInput, newEvent.startTime);
    await userEvent.type(endTimeInput, newEvent.endTime);
    await userEvent.type(descriptionInput, newEvent.description);
    await userEvent.type(locationInput, newEvent.location);
    await userEvent.selectOptions(categoryInput, newEvent.category);
    await userEvent.selectOptions(notificationTimeSelect, newEvent.notificationTime.toString());
    await userEvent.click(repeatCheckbox);

    if (repeatTypeSelect) {
      await userEvent.selectOptions(repeatTypeSelect, newEvent.repeat.type);
    }
    if (repeatIntervalInput) {
      await userEvent.type(repeatIntervalInput, newEvent.repeat.interval.toString());
    }

    // ================================================================

    // 일정 추가 버튼 클릭 시 일정 정보가 저장되는지 확인
    await userEvent.click(addEventButton);
    const eventList = screen.getByTestId('event-list');

    // ================================================================

    expect(within(eventList).getByText(newEvent.title)).toBeInTheDocument();
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    const firstEvent = initialEvents[0] as Event;

    const updatesEvent = {
      ...firstEvent,
      title: '수정된 일정',
      date: '2024-10-16',
      startTime: '19:00',
      endTime: '20:00',
      description: '수정된 일정 설명',
      location: '수정된 장소',
      category: '개인',
      notificationTime: 120,
      repeat: {
        type: 'monthly',
        interval: 2,
      },
    };

    setupUpdateHandler(initialEvents);

    const eventList = screen.getByTestId('event-list');

    expect(screen.getByText(/검색 결과가 없습니다/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(firstEvent.location)).toBeInTheDocument();
    });

    expect(screen.queryByText(/검색 결과가 없습니다/i)).not.toBeInTheDocument();

    // 수정할 일정 선택
    const editButton = within(eventList).getAllByLabelText(/edit event/i);
    await userEvent.click(editButton[0]);

    // ================================================================

    const titleInput = screen.getByLabelText('제목');
    const dateInput = screen.getByLabelText('날짜');
    const startTimeInput = screen.getByLabelText('시작 시간');
    const endTimeInput = screen.getByLabelText('종료 시간');
    const descriptionInput = screen.getByLabelText('설명');
    const locationInput = screen.getByLabelText('위치');
    const categoryInput = screen.getByLabelText('카테고리');

    const notificationTimeSelect = screen.getByLabelText('알림 설정');

    const repeatTypeSelect = screen.queryByLabelText('반복 유형');
    const repeatIntervalInput = screen.queryByLabelText('반복 간격');

    const addEventButton = screen.getByTestId('event-submit-button');

    // 수정 버튼 클릭 시 기존값이 잘 들어갔는 지 확인
    expect(titleInput).toHaveValue(firstEvent.title);
    expect(dateInput).toHaveValue(firstEvent.date);
    expect(startTimeInput).toHaveValue(firstEvent.startTime);
    expect(endTimeInput).toHaveValue(firstEvent.endTime);
    expect(descriptionInput).toHaveValue(firstEvent.description);
    expect(locationInput).toHaveValue(firstEvent.location);
    expect(categoryInput).toHaveValue(firstEvent.category);
    expect(notificationTimeSelect).toHaveValue(firstEvent.notificationTime.toString());

    if (repeatTypeSelect) {
      expect(repeatTypeSelect).toHaveValue(firstEvent.repeat.type);
    }
    if (repeatIntervalInput) {
      expect(repeatIntervalInput).toHaveValue(firstEvent.repeat.interval.toString());
    }

    // 제목을 지우고 수정된 제목 입력
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, updatesEvent.title);

    // 날짜를 지우고 수정된 날짜 입력
    await userEvent.clear(dateInput);
    await userEvent.type(dateInput, updatesEvent.date);

    // 시작 시간을 지우고 수정된 시작 시간 입력
    await userEvent.clear(startTimeInput);
    await userEvent.type(startTimeInput, updatesEvent.startTime);

    // 종료 시간을 지우고 수정된 종료 시간 입력
    await userEvent.clear(endTimeInput);
    await userEvent.type(endTimeInput, updatesEvent.endTime);

    // 설명을 지우고 수정된 설명 입력
    await userEvent.clear(descriptionInput);
    await userEvent.type(descriptionInput, updatesEvent.description);

    // 장소를 지우고 수정한 장소 입력
    await userEvent.clear(locationInput);
    await userEvent.type(locationInput, updatesEvent.location);

    // 카테고리를 수정된 카테고리 입력
    await userEvent.selectOptions(categoryInput, updatesEvent.category);

    // 알림 시간을 수정된 알림 시간 입력
    await userEvent.selectOptions(notificationTimeSelect, updatesEvent.notificationTime.toString());

    if (repeatTypeSelect) {
      await userEvent.selectOptions(repeatTypeSelect, updatesEvent.repeat.type);
    }
    if (repeatIntervalInput) {
      await userEvent.type(repeatIntervalInput, updatesEvent.repeat.interval.toString());
    }

    await userEvent.click(addEventButton);

    // 수정한 내용가 정확히 반영되었는지 확인

    expect(within(eventList).getByText(updatesEvent.title)).toBeInTheDocument();
    expect(within(eventList).getByText(updatesEvent.date)).toBeInTheDocument();
    expect(
      within(eventList).getByText(updatesEvent.startTime, { exact: false })
    ).toBeInTheDocument();
    expect(within(eventList).getByText(updatesEvent.endTime, { exact: false })).toBeInTheDocument();
    expect(within(eventList).getByText(updatesEvent.description)).toBeInTheDocument();
    expect(within(eventList).getByText(updatesEvent.location)).toBeInTheDocument();
    expect(
      within(eventList).getByText(updatesEvent.category, { exact: false })
    ).toBeInTheDocument();
    expect(within(eventList).getByText(/2시간 전/i)).toBeInTheDocument();
    if (repeatTypeSelect) {
      expect(repeatTypeSelect).toHaveValue(updatesEvent.repeat.type);
    }
    if (repeatIntervalInput) {
      expect(repeatIntervalInput).toHaveValue(updatesEvent.repeat.interval.toString());
    }
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    const firstEvent = initialEvents[0] as Event;

    setupDeleteHandler(initialEvents);

    const eventList = screen.getByTestId('event-list');
    const searchInput = within(eventList).getByPlaceholderText('검색어를 입력하세요');

    // 검색어 입력
    await userEvent.type(searchInput, firstEvent.title);

    // 삭제 버튼 클릭
    const deleteButton = within(eventList).getByLabelText(/delete event/i);
    await userEvent.click(deleteButton);

    // 삭제된 일정이 더 이상 조회되지 않는지 확인
    expect(within(eventList).queryByText(firstEvent.title)).not.toBeInTheDocument();
  });
});

describe('일정 뷰', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    const date = new Date('2024-10-01T00:00:00');
    vi.setSystemTime(date);

    render(<App />, { wrapper: Provider });

    const viewSelect = screen.getByLabelText('view');
    await userEvent.selectOptions(viewSelect, 'week');

    const weekView = screen.getByTestId('week-view');

    expect(within(weekView).queryByText('기존 회의')).not.toBeInTheDocument();
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    const date = new Date('2024-10-15T00:00:00');
    vi.setSystemTime(date);

    render(<App />, { wrapper: Provider });

    const viewSelect = screen.getByLabelText('view');
    await userEvent.selectOptions(viewSelect, 'week');

    const weekView = screen.getByTestId('week-view');
    expect(within(weekView).getByText('기존 회의')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    const date = new Date('2024-09-15T00:00:00');
    vi.setSystemTime(date);

    render(<App />, { wrapper: Provider });

    const viewSelect = screen.getByLabelText('view');
    await userEvent.selectOptions(viewSelect, 'month');

    const monthView = screen.getByTestId('month-view');

    expect(within(monthView).queryByText('기존 회의')).not.toBeInTheDocument();
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    const date = new Date('2024-10-01T00:00:00');
    vi.setSystemTime(date);
    render(<App />, { wrapper: Provider });

    const viewSelect = screen.getByLabelText('view');
    await userEvent.selectOptions(viewSelect, 'month');
    const monthView = screen.getByTestId('month-view');
    expect(within(monthView).getByText('기존 회의')).toBeInTheDocument();
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    const date = new Date('2024-01-01T00:00:00');
    vi.setSystemTime(date);

    render(<App />, { wrapper: Provider });

    const viewSelect = screen.getByLabelText('view');
    await userEvent.selectOptions(viewSelect, 'month');

    const monthView = screen.getByTestId('month-view');
    expect(within(monthView).getByText('신정')).toBeInTheDocument();
  });

  it('주간 뷰에 12월 25일(크리스마스)이 공휴일로 표시되는지 확인한다', async () => {
    const date = new Date('2024-12-25T00:00:00');
    vi.setSystemTime(date);

    render(<App />, { wrapper: Provider });

    const viewSelect = screen.getByLabelText('view');
    await userEvent.selectOptions(viewSelect, 'week');

    const weekView = screen.getByTestId('week-view');
    expect(within(weekView).getByText('크리스마스')).toBeInTheDocument();
  });
});

describe('검색 기능', () => {
  beforeEach(() => {
    const date = new Date('2024-10-01T00:00:00');
    vi.setSystemTime(date);
  });

  afterEach(() => {
    vi.useRealTimers();
  });
  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    render(<App />, { wrapper: Provider });

    const eventList = screen.getByTestId('event-list');
    const searchInput = within(eventList).getByPlaceholderText('검색어를 입력하세요');

    // ================================================================

    // 검색어 입력 후 검색 결과 확인
    await userEvent.type(searchInput, '없는 검색어');

    expect(within(eventList).getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    const initialData = {
      id: '2',
      title: '팀 회의',
      date: '2024-10-15',
      startTime: '14:00',
      endTime: '15:00',
      description: '팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    } as Event;

    setupCreateHandler([initialData]);

    render(<App />, { wrapper: Provider });

    const eventList = screen.getByTestId('event-list');
    const searchInput = within(eventList).getByPlaceholderText('검색어를 입력하세요');

    await userEvent.type(searchInput, '팀 회의');

    await waitFor(() => {
      expect(within(eventList).getByText(/팀 회의/i)).toBeInTheDocument();
    });
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    render(<App />, { wrapper: Provider });

    const eventList = screen.getByTestId('event-list');
    const searchInput = within(eventList).getByPlaceholderText('검색어를 입력하세요');

    await waitFor(() => {
      expect(within(eventList).getByText(/기존 회의/i)).toBeInTheDocument();
    });

    await userEvent.clear(searchInput);

    await waitFor(() => {
      expect(within(eventList).getByText(/기존 회의/i)).toBeInTheDocument();
    });
  });
});

describe('일정 충돌', () => {
  beforeEach(() => {
    const date = new Date('2024-10-01T00:00:00');
    vi.setSystemTime(date);
    render(<App />, { wrapper: Provider });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const newEvent = {
    title: '새로운 일정',
    date: '2024-10-15',
    startTime: '09:00',
    endTime: '11:00',
    description: '새로운 일정 설명',
    location: '새로운 장소',
    category: '업무',
    notificationTime: '10',
    repeatType: 'daily',
    repeatInterval: '1',
    repeatEndDate: '2024-12-31',
  };

  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    // 일정 추가 시 추가되는 요소들
    const titleInput = screen.getByLabelText('제목');
    const dateInput = screen.getByLabelText('날짜');
    const startTimeInput = screen.getByLabelText('시작 시간');
    const endTimeInput = screen.getByLabelText('종료 시간');
    const descriptionInput = screen.getByLabelText('설명');
    const locationInput = screen.getByLabelText('위치');
    const categoryInput = screen.getByLabelText('카테고리');
    const repeatCheckbox = screen.getByLabelText('반복 일정');
    const notificationTimeSelect = screen.getByLabelText('알림 설정');

    // 반복 일정 체크 시 추가되는 요소들
    const repeatTypeSelect = screen.queryByLabelText('반복 유형');
    const repeatIntervalInput = screen.queryByLabelText('반복 간격');

    // 일정 추가 버튼
    const addEventButton = screen.getByTestId('event-submit-button');

    // ================================================================

    // 필드 입력
    await userEvent.type(titleInput, newEvent.title);
    await userEvent.type(dateInput, newEvent.date);
    await userEvent.type(startTimeInput, newEvent.startTime);
    await userEvent.type(endTimeInput, newEvent.endTime);
    await userEvent.type(descriptionInput, newEvent.description);
    await userEvent.type(locationInput, newEvent.location);
    await userEvent.selectOptions(categoryInput, newEvent.category);
    await userEvent.selectOptions(notificationTimeSelect, newEvent.notificationTime);
    await userEvent.click(repeatCheckbox);
    if (repeatTypeSelect) {
      await userEvent.selectOptions(repeatTypeSelect, newEvent.repeatType);
    }
    if (repeatIntervalInput) {
      await userEvent.type(repeatIntervalInput, newEvent.repeatInterval);
    }

    // ================================================================

    // 일정 추가 버튼 클릭 시 일정이 겹치면 경고가 노출되는지 확인
    await userEvent.click(addEventButton);
    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    // 수정할 일정 선택
    const eventList = screen.getByTestId('event-list');

    await waitFor(() => {
      expect(within(eventList).getByText('기존 회의')).toBeInTheDocument();
    });

    const editButton = within(eventList).getAllByLabelText(/edit event/i);
    await userEvent.click(editButton[0]);

    // ================================================================

    const titleInput = screen.getByLabelText('제목');
    const dateInput = screen.getByLabelText('날짜');
    const startTimeInput = screen.getByLabelText('시작 시간');
    const endTimeInput = screen.getByLabelText('종료 시간');
    const descriptionInput = screen.getByLabelText('설명');
    const locationInput = screen.getByLabelText('위치');
    const categoryInput = screen.getByLabelText('카테고리');
    const notificationTimeSelect = screen.getByLabelText('알림 설정');

    const repeatTypeSelect = screen.queryByLabelText('반복 유형');
    const repeatIntervalInput = screen.queryByLabelText('반복 간격');

    const addEventButton = screen.getByTestId('event-submit-button');

    // 수정 버튼 클릭 시 기존값이 잘 들어갔는 지 확인
    expect(titleInput).toHaveValue('기존 회의');
    expect(dateInput).toHaveValue('2024-10-15');
    expect(startTimeInput).toHaveValue('09:00');
    expect(endTimeInput).toHaveValue('10:00');
    expect(descriptionInput).toHaveValue('기존 팀 미팅');
    expect(locationInput).toHaveValue('회의실 B');
    expect(categoryInput).toHaveValue('업무');
    expect(notificationTimeSelect).toHaveValue('10');
    if (repeatTypeSelect) {
      expect(repeatTypeSelect).toHaveValue('daily');
    }
    if (repeatIntervalInput) {
      expect(repeatIntervalInput).toHaveValue('1');
    }

    // 시간을 잘못 입력
    await userEvent.clear(startTimeInput);
    await userEvent.type(startTimeInput, '14:00');

    await userEvent.click(addEventButton);

    // 시간 설정 오류 노출 확인
    const toastMessage = await screen.findAllByText(/시간 설정을 확인해주세요/i);
    expect(toastMessage[0]).toBeInTheDocument();
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  const date = new Date('2024-10-15T09:50:00');
  vi.setSystemTime(date);

  render(<App />, { wrapper: Provider });

  const eventList = screen.getByTestId('event-list');

  await waitFor(() => {
    expect(within(eventList).getByText('기존 회의')).toBeInTheDocument();
  });

  expect(screen.getByText('10분 전')).toBeInTheDocument();
});
