import { randomUUID } from 'crypto';

import { ChakraProvider, useToast, UseToastOptions } from '@chakra-ui/react';
import useCalendarViewStore from '@stores/useCalendarViewStore';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AddSchedule } from '@templates/AddSchedule';
import { CalendarManager } from '@/components/templates/CalendarManager';
import { ScheduleManager } from '@templates/ScheduleManager';
import { screen, act, renderHook, waitFor, fireEvent, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import React from 'react';

import { fillEventForm } from './helpers';
import { createEvent } from '../__mocks__/Factory';
import { checkAllEvent } from './helpers/checkAllEvent';
import { events } from '../__mocks__/response/events.json' assert { type: 'json' };

import { AlertDuplicateSchedule } from '@/components/templates/AlertDialog';
import { Notification } from '@/components/templates/Notification';
import DialogProvider from '@/context/DialogProvider';
import useScheduleForm from '@/stores/useScheduleForm';
import { Event } from '@/types';
import { createQueryClient } from '@/createQueryClient';
import { useEventOperations } from '@/hooks/useEventOperations';
import { TEST_ID } from '@/constants/testID';

const MOCK_EVENTS = [...events] as const;
const MOCK_EVENTS_COUNT = MOCK_EVENTS.length;

let toastCalls: any[] = [];
// toast mock
vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual<typeof import('@chakra-ui/react')>('@chakra-ui/react');
  return {
    ...actual,
    useToast: vi.fn().mockImplementation(() => (options: UseToastOptions) => {
      toastCalls.push(options);
    }),
  };
});

const createWrapper =
  (queryClient: QueryClient) =>
  ({ children }: { children: React.ReactNode }) => {
    return (
      <QueryClientProvider client={queryClient}>
        <ChakraProvider>
          <DialogProvider>
            <ScheduleManager />
            <AddSchedule />
            <CalendarManager />
            <AlertDuplicateSchedule />
            <Notification />
            {children}
          </DialogProvider>
        </ChakraProvider>
      </QueryClientProvider>
    );
  };
let queryEvent: {
  current: ReturnType<typeof useEventOperations>;
};

describe('-', () => {
  const toast = useToast();
  const queryClient = createQueryClient(toast);
  const wrapper = createWrapper(queryClient);

  beforeEach(async () => {
    // GIVEN: 각 테스트마다 초기 상태가 반영된 핸들러 설정
    queryClient.clear();
    useCalendarViewStore.setState({ currentDate: new Date() });
    useScheduleForm.setState({
      isEditing: false,
      id: '',
      title: '',
      date: '',
      startTime: '',
      endTime: '',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0, endDate: '' },
      notificationTime: 1,
    });

    // GIVEN: 초기상태 불러오기
    queryEvent = renderHook(() => useEventOperations(), { wrapper }).result;

    await waitFor(() => expect(queryClient.getQueryState(['events'])?.status).toBe('success'));
  });

  describe('일정 CRUD 및 기본 기능', () => {
    it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
      // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.
      const NEW_EVENT = createEvent({
        id: String(MOCK_EVENTS_COUNT + 1),
        title: '새 이벤트',
        date: '2024-10-01',
        startTime: '00:00',
        endTime: '01:00',
        category: '개인',
        notificationTime: 1,
      });

      const EDIT_AREA = await waitFor(() => screen.getByTestId(TEST_ID.EDIT_AREA));

      await fillEventForm({
        container: EDIT_AREA,
        events: [
          { type: 'input', testId: TEST_ID.FORM.TITLE, value: NEW_EVENT.title },
          { type: 'input', testId: TEST_ID.FORM.DATE, value: NEW_EVENT.date },
          { type: 'input', testId: TEST_ID.FORM.START_TIME, value: NEW_EVENT.startTime },
          { type: 'input', testId: TEST_ID.FORM.END_TIME, value: NEW_EVENT.endTime },
          { type: 'input', testId: TEST_ID.FORM.DESCRIPTION, value: NEW_EVENT.description },
          { type: 'input', testId: TEST_ID.FORM.LOCATION, value: NEW_EVENT.location },
          { type: 'select', testId: TEST_ID.FORM.CATEGORY, value: NEW_EVENT.category },
          {
            type: 'select',
            testId: TEST_ID.FORM.NOTIFICATION_TIME,
            value: String(NEW_EVENT.notificationTime),
          },
        ],
      });

      const SUBMIT_BUTTON = within(EDIT_AREA).getByTestId(TEST_ID.SUBMIT_BUTTON);
      await waitFor(() => expect(SUBMIT_BUTTON).toHaveTextContent('일정 추가'));
      await userEvent.click(SUBMIT_BUTTON);

      await waitFor(() => {
        expect(queryEvent.current.fetch.events).toHaveLength(MOCK_EVENTS_COUNT + 1);
      });

      expect(queryEvent.current.fetch.events).toContainEqual(NEW_EVENT);
    });

    it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
      // WHEN: 일정의 첫번째 데이터 수정
      const EDITING_EVENT_ID = queryEvent.current.fetch.events[0].id;

      const EVENT_EDIT_BUTTON = await waitFor(() =>
        screen.getByTestId(`event-edit-${EDITING_EVENT_ID}`)
      );

      const EDIT_AREA = await waitFor(() => screen.getByTestId(TEST_ID.EDIT_AREA));

      act(() => fireEvent.click(EVENT_EDIT_BUTTON));
      await waitFor(() =>
        expect(within(EDIT_AREA).getByTestId(TEST_ID.SUBMIT_BUTTON)).toHaveTextContent('일정 수정')
      );

      const EDITED_EVENT = createEvent({
        id: EDITING_EVENT_ID,
        title: '수정된 이벤트',
        date: '2024-11-01',
        startTime: '01:00',
        endTime: '02:00',
        category: '기타',
        notificationTime: 10,
        repeat: { type: 'daily', interval: 10, endDate: '2024-11-11' },
      });
      useScheduleForm.setState({ isRepeating: true });

      // WHEN: 일정의 첫번째 데이터의 모든 필드 수정한다.
      await fillEventForm({
        container: EDIT_AREA,
        events: [
          { type: 'input', testId: TEST_ID.FORM.TITLE, value: EDITED_EVENT.title },
          { type: 'input', testId: TEST_ID.FORM.DATE, value: EDITED_EVENT.date },
          { type: 'input', testId: TEST_ID.FORM.START_TIME, value: EDITED_EVENT.startTime },
          { type: 'input', testId: TEST_ID.FORM.END_TIME, value: EDITED_EVENT.endTime },
          { type: 'input', testId: TEST_ID.FORM.DESCRIPTION, value: EDITED_EVENT.description },
          { type: 'input', testId: TEST_ID.FORM.LOCATION, value: EDITED_EVENT.location },
          { type: 'check', testId: TEST_ID.FORM.REPEAT_SET, value: true },
          { type: 'select', testId: TEST_ID.FORM.REPEAT_TYPE, value: EDITED_EVENT.repeat.type },
          {
            type: 'input',
            testId: TEST_ID.FORM.REPEAT_END_DATE,
            value: EDITED_EVENT.repeat.endDate!,
          },
          {
            type: 'input',
            testId: TEST_ID.FORM.INTERVAL,
            value: String(EDITED_EVENT.repeat.interval),
          },
          { type: 'select', testId: TEST_ID.FORM.CATEGORY, value: EDITED_EVENT.category },
          {
            type: 'select',
            testId: TEST_ID.FORM.NOTIFICATION_TIME,
            value: String(EDITED_EVENT.notificationTime),
          },
        ],
      });

      const SUBMIT_BUTTON = within(EDIT_AREA).getByTestId(TEST_ID.SUBMIT_BUTTON);
      await userEvent.click(SUBMIT_BUTTON);

      // THEN: 일정의 첫번째 데이터의 모든 필드가 새 데이터로 업데이트 되어야 한다.
      await waitFor(() => expect(queryEvent.current.fetch.events).toContainEqual(EDITED_EVENT));
    });

    it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
      //GIVEN: 내용이 겹치지 않는 이벤트 생성
      const NEW_EVENT = createEvent({
        title: randomUUID(),
        date: '2024-10-01',
        startTime: '00:00',
        endTime: '01:00',
        category: '개인',
        notificationTime: 1,
      }) as Event;
      const EDIT_AREA = await waitFor(() => screen.getByTestId(TEST_ID.EDIT_AREA));

      await fillEventForm({
        container: EDIT_AREA,
        events: [
          { type: 'input', testId: TEST_ID.FORM.TITLE, value: NEW_EVENT.title },
          { type: 'input', testId: TEST_ID.FORM.DATE, value: NEW_EVENT.date },
          { type: 'input', testId: TEST_ID.FORM.START_TIME, value: NEW_EVENT.startTime },
          { type: 'input', testId: TEST_ID.FORM.END_TIME, value: NEW_EVENT.endTime },
          { type: 'input', testId: TEST_ID.FORM.DESCRIPTION, value: NEW_EVENT.description },
          { type: 'input', testId: TEST_ID.FORM.LOCATION, value: NEW_EVENT.location },
          { type: 'select', testId: TEST_ID.FORM.CATEGORY, value: NEW_EVENT.category },
          {
            type: 'select',
            testId: TEST_ID.FORM.NOTIFICATION_TIME,
            value: String(NEW_EVENT.notificationTime),
          },
        ],
      });

      const SUBMIT_BUTTON = within(EDIT_AREA).getByTestId(TEST_ID.SUBMIT_BUTTON);
      await waitFor(() => expect(SUBMIT_BUTTON).toHaveTextContent('일정 추가'));
      await userEvent.click(SUBMIT_BUTTON);
      await waitFor(() =>
        expect(queryEvent.current.fetch.events).toHaveLength(MOCK_EVENTS_COUNT + 1)
      );

      // WHEN: 내용이 겹치지 않는 이벤트 삭제할 때
      const EVENT_AREA = await waitFor(() => screen.findByTestId(TEST_ID.EVENT_LIST));

      const DELETE_EVENT_TEST_ID = `event-delete-${MOCK_EVENTS_COUNT + 1}`;
      const deleteButton = await waitFor(() =>
        within(EVENT_AREA).getByTestId(DELETE_EVENT_TEST_ID)
      );
      act(() => fireEvent.click(deleteButton));

      // THEN: 삭제된 일정은 조회되지 않는다.
      await waitFor(() => expect(queryEvent.current.fetch.events).not.toContainEqual(NEW_EVENT));

      expect(within(EVENT_AREA).queryByText(NEW_EVENT.title)).not.toBeInTheDocument();
    });
  });

  describe('일정 뷰', () => {
    it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
      // WHEN: 저번 달로 이동
      const prevBtn = await waitFor(() => screen.getByTestId(TEST_ID.PREV));
      act(() => fireEvent.click(prevBtn));

      // WHEN: 주별 뷰로 전환
      const viewBtn = await waitFor(() => screen.getByTestId(TEST_ID.VIEW));
      act(() => fireEvent.change(viewBtn, { target: { value: 'week' } }));

      // THEN: 9월 주 일정이 없으니 일정이 표시되지 않아야 한다.
      expect(screen.queryByText('검색 결과가 없습니다.')).toBeInTheDocument();
    });

    it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
      // WHEN: 주 별로 전환
      const viewBtn = await screen.findByTestId('calendar-view-button');
      act(() => {
        fireEvent.change(viewBtn, { target: { value: 'week' } });
      });

      // THEN: 일정과 달력에 이벤트가 표기되어 있어야 한다.
      const scheduleList = await waitFor(() => screen.findByTestId('event-list'));

      expect(within(scheduleList).getByText('점심 약속')).toBeInTheDocument();
      expect(within(scheduleList).getByText('식당 A')).toBeInTheDocument();
      expect(within(scheduleList).getByText('카테고리: 개인')).toBeInTheDocument();
      expect(within(scheduleList).getByText('19:00 - 22:00')).toBeInTheDocument();
      expect(within(scheduleList).getByText('2024-10-01')).toBeInTheDocument();

      const calendar = await waitFor(() => screen.findByTestId('calendar-ui'));
      expect(within(calendar).getByText('점심 약속')).toBeInTheDocument();
    });

    it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
      // 월별 뷰로 전환
      const viewBtn = await screen.findByTestId('calendar-view-button');
      act(() => {
        fireEvent.change(viewBtn, { target: { value: 'month' } });
      });
      // 저번 달로 이동 (9월)
      const prevBtn = await waitFor(() => screen.getByTestId('calendar-prev-btn'));
      act(() => fireEvent.click(prevBtn));

      // THEN: 일정이 표시되지 않아야 한다.
      const scheduleList = await waitFor(() => screen.findByTestId('event-list'));
      expect(within(scheduleList).getByText('검색 결과가 없습니다.')).toBeInTheDocument();
    });

    it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
      // 월별 뷰로 전환
      const viewBtn = await screen.findByTestId('calendar-view-button');
      act(() => {
        fireEvent.change(viewBtn, { target: { value: 'month' } });
      });

      // THEN: 모든 일정이 표시되어야 한다.
      await checkAllEvent();
    });

    it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
      const prevBtn = await waitFor(() => screen.getByTestId(TEST_ID.PREV));
      let month = 10;
      while (month !== 1) {
        month -= 1;
        act(() => fireEvent.click(prevBtn));
      }
      expect(screen.getByText(/1월/)).toBeInTheDocument();
      const calendar = await waitFor(() => screen.findByTestId('calendar-ui'));
      expect(within(calendar).getByText('신정')).toBeInTheDocument();
    });
  });

  describe('검색 기능', () => {
    it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
      const searchInput = await waitFor(() => screen.findByTestId(TEST_ID.SEARCH));
      act(() => fireEvent.change(searchInput, { target: { value: '검색 결과가 없는 검색어' } }));

      const eventList = await waitFor(() => screen.getByTestId('event-list'));
      expect(within(eventList).getByText('검색 결과가 없습니다.')).toBeInTheDocument();
    });

    it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
      const searchInput = await waitFor(() => screen.findByTestId(TEST_ID.SEARCH));
      act(() => fireEvent.change(searchInput, { target: { value: '팀 회의' } }));

      const scheduleList = await waitFor(() => screen.findByTestId('event-list'));

      expect(within(scheduleList).getByText('팀 회의')).toBeInTheDocument();
      expect(within(scheduleList).getByText('회의실 D')).toBeInTheDocument();
      expect(within(scheduleList).getByText('카테고리: 업무')).toBeInTheDocument();
      expect(within(scheduleList).getByText('14:00 - 15:00')).toBeInTheDocument();
      expect(within(scheduleList).getByText('2024-10-24')).toBeInTheDocument();
    });

    it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
      const searchInput = await waitFor(() => screen.findByTestId('search-schedule'));
      act(() => fireEvent.change(searchInput, { target: { value: '' } }));

      // THEN: 모든 일정이 표시되어야 한다.
      await checkAllEvent();
    });
  });

  describe('일정 충돌', () => {
    it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
      const events = queryEvent.current.fetch.events;
      const NEW_EVENT = createEvent({
        id: String(events.length + 1),
        date: '2024-10-15',
        startTime: '09:00',
        endTime: '10:00',
      });

      const EDIT_AREA = await waitFor(() => screen.getByTestId(TEST_ID.EDIT_AREA));

      await fillEventForm({
        container: EDIT_AREA,
        events: [
          { type: 'input', testId: TEST_ID.FORM.TITLE, value: NEW_EVENT.title },
          { type: 'input', testId: TEST_ID.FORM.DATE, value: NEW_EVENT.date },
          { type: 'input', testId: TEST_ID.FORM.START_TIME, value: NEW_EVENT.startTime },
          { type: 'input', testId: TEST_ID.FORM.END_TIME, value: NEW_EVENT.endTime },
          { type: 'input', testId: TEST_ID.FORM.DESCRIPTION, value: NEW_EVENT.description },
          { type: 'input', testId: TEST_ID.FORM.LOCATION, value: NEW_EVENT.location },
          { type: 'select', testId: TEST_ID.FORM.CATEGORY, value: NEW_EVENT.category },
          {
            type: 'select',
            testId: TEST_ID.FORM.NOTIFICATION_TIME,
            value: String(NEW_EVENT.notificationTime),
          },
        ],
      });

      const SUBMIT_BUTTON = within(EDIT_AREA).getByTestId('event-submit-button');
      await waitFor(() => expect(SUBMIT_BUTTON).toHaveTextContent('일정 추가'));
      await userEvent.click(SUBMIT_BUTTON);

      await waitFor(() => expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument());
    });

    it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
      const events = queryEvent.current.fetch.events;

      const OTHER_EVENT = createEvent({
        date: events[3].date,
        startTime: events[3].startTime,
        endTime: events[3].endTime,
      }) as Event;

      const scheduleList = await waitFor(() => screen.findByTestId('event-list'));
      const editButton = await waitFor(() =>
        within(scheduleList).getByTestId(`event-edit-${events[0].id}`)
      );
      await userEvent.click(editButton);

      // WHEN: 다른 이벤트와 일정이 겹치게 세팅
      const EDIT_AREA = await waitFor(() => screen.getByTestId(TEST_ID.EDIT_AREA));
      await fillEventForm({
        container: EDIT_AREA,
        events: [
          { type: 'input', testId: TEST_ID.FORM.DATE, value: OTHER_EVENT.date },
          { type: 'input', testId: TEST_ID.FORM.START_TIME, value: OTHER_EVENT.startTime },
          { type: 'input', testId: TEST_ID.FORM.END_TIME, value: OTHER_EVENT.endTime },
        ],
      });
      const SUBMIT_BUTTON = within(EDIT_AREA).getByTestId('event-submit-button');
      await waitFor(() => expect(SUBMIT_BUTTON).toHaveTextContent('일정 수정'));
      await userEvent.click(SUBMIT_BUTTON);

      await waitFor(() => expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument());
    });

    it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
      // WHEN: 알림 충족하는 시간이 되었을 때
      vi.advanceTimersByTime(1000 * 60 * 60 * 18 + 1000 * 60 * 50);

      const ALERT = await waitFor(() => screen.getByTestId(TEST_ID.ALERT));
      expect(within(ALERT).getByText('10분 후 점심 약속 일정이 시작됩니다.')).toBeInTheDocument();
    });
  });
});
