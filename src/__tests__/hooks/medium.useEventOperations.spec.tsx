import * as fetchJsonModule from '@apis/fetchJson.ts';
import { ChakraProvider, useToast, UseToastOptions } from '@chakra-ui/react';
import { useCreateEvent } from '@hooks/events/useCreateEvent.ts';
import { useDeleteEvent } from '@hooks/events/useDeleteEvent.ts';
import { useFetchEvents } from '@hooks/events/useFetchEvents.ts';
import { useUpdateEvent } from '@hooks/events/useUpdateEvent.ts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CalendarManager } from '@templates/CalenderManager.tsx';
import { act, renderHook, waitFor } from '@testing-library/react';
import React from 'react';

import { createTestQueryClient } from '../../__mocks__/createTestQueryClient.tsx';
import { createEvent } from '../../__mocks__/Factory.ts';
import { events } from '../../__mocks__/response/events.json' assert { type: 'json' };
import { Event, EventForm } from '../../types.ts';

const MOCK_EVENTS = [...events] as const;

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
          {children}
          <CalendarManager />
        </ChakraProvider>
      </QueryClientProvider>
    );
  };

describe('초기값 세팅', () => {
  let queryEvent: {
    current: {
      fetchEvents: ReturnType<typeof useFetchEvents>;
      updateEvent: ReturnType<typeof useUpdateEvent>;
      createEvent: ReturnType<typeof useCreateEvent>;
      deleteEvent: ReturnType<typeof useDeleteEvent>;
    };
  };

  const toast = useToast();
  const queryClient = createTestQueryClient(toast);
  const wrapper = createWrapper(queryClient);

  beforeEach(async () => {
    // GIVEN: 각 테스트마다 초기 상태가 반영된 핸들러 설정
    toastCalls = [];
    queryClient.clear();

    // GIVEN: 초기상태 불러오기
    queryEvent = renderHook(
      () => ({
        fetchEvents: useFetchEvents(),
        createEvent: useCreateEvent(),
        updateEvent: useUpdateEvent(),
        deleteEvent: useDeleteEvent(),
      }),
      { wrapper }
    ).result;
  });

  describe('fetch 초기 상태', () => {
    it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
      // GIVEN: 데이터 불러오기
      await waitFor(() =>
        expect(queryEvent.current.fetchEvents.events).toHaveLength(MOCK_EVENTS.length)
      );

      // THEN: 적확한 초기 이벤트 데이터가 설정되어야 한다.
      MOCK_EVENTS.forEach((event) =>
        expect(queryEvent.current.fetchEvents.events).toContainEqual(event)
      );
    });
  });

  describe('update event', () => {
    it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
      // GIVEN: 데이터 불러오기
      await waitFor(() =>
        expect(queryEvent.current.fetchEvents.events).toHaveLength(MOCK_EVENTS.length)
      );
      // GIVEN: 새롭게 정의된 이벤트 가공
      const mockUpdateEvent = createEvent({
        id: '1',
        title: 'test',
        startTime: '11:11',
        endTime: '22:22',
        description: 'test description',
        location: 'test location',
      }) as Event;

      // WHEN: 새롭게 정의된 이벤트를 저장했을 때
      act(() => queryEvent.current.updateEvent.updateEvent(mockUpdateEvent));

      // THEN: 새롭게 정의된 이벤트를 불러와야 한다.
      await waitFor(() => {
        const eventsData = queryEvent.current.fetchEvents.events;
        expect(eventsData).toContainEqual(mockUpdateEvent);
      });
    });
  });

  describe('create event', () => {
    it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
      // GIVEN: 데이터 불러오기
      await waitFor(() =>
        expect(queryEvent.current.fetchEvents.events).toHaveLength(MOCK_EVENTS.length)
      );
      // GIVEN: 새로 정의된 데이터 가공
      const mockCreateEvent = {
        title: 'test-title',
        date: '2024-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '기본 설명',
        location: '기본 위치',
        category: '업무',
        repeat: { type: 'none', interval: 0, endDate: '' },
        notificationTime: 1,
      } as EventForm;

      // WHEN: 새로 정의된 데이터를 업데이트 했을때
      act(() => queryEvent.current.createEvent.createEvent(mockCreateEvent));

      // THEN: 새로 정의된 데이터를 불러와야 한다.
      await waitFor(() => {
        const eventsData = queryEvent.current.fetchEvents.events;
        const expectedNewEvent = { id: String(MOCK_EVENTS.length + 1), ...mockCreateEvent };
        expect(eventsData).toContainEqual(expectedNewEvent);
      });
    });
  });

  describe('delete event', () => {
    it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
      // GIVEN: 데이터 불러오기
      await waitFor(() =>
        expect(queryEvent.current.fetchEvents.events).toHaveLength(MOCK_EVENTS.length)
      );
      MOCK_EVENTS.forEach((event) =>
        expect(queryEvent.current.fetchEvents.events).toContainEqual(event)
      );

      // WHEN: 데이터를 삭제 했을 때
      act(() => queryEvent.current.deleteEvent.deleteEvent('1'));

      // THEN: 삭제된 데이터는 이벤트 목록에 존재하지 않는다.
      await waitFor(() => {
        const eventsData = queryEvent.current.fetchEvents.events;
        expect(eventsData).toHaveLength(MOCK_EVENTS.length - 1);
        expect(queryEvent.current.fetchEvents.events).not.toContainEqual({ ...MOCK_EVENTS[0] });
      });
    });
  });

  it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
    // GIVEN: 데이터 불러오기
    await waitFor(() =>
      expect(queryEvent.current.fetchEvents.events).toHaveLength(MOCK_EVENTS.length)
    );
    const NOT_FOUND_EVENT = {
      id: 'test-mock-event-id',
      title: 'test',
      date: '',
      startTime: '',
      endTime: '',
      description: '',
      location: 'a',
      category: 'aa',
      repeat: { type: 'none', interval: 0, endDate: '' },
      notificationTime: 60,
    } as Event;

    // WHEN: 존재하지 않는 이벤트 수정했을 때
    act(() => queryEvent.current.updateEvent.updateEvent({ ...NOT_FOUND_EVENT }));
    await waitFor(() => expect(toastCalls.length).toBeGreaterThan(0));

    // THEN: 일정 저장 실패 토스트 노출, 에러 처리가 되어야 한다.
    expect(toastCalls).toContainEqual({
      title: '일정 저장 실패',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
    expect(queryEvent.current.fetchEvents.events).not.toStrictEqual(NOT_FOUND_EVENT);
  });
});

describe('api 에러 반환', () => {
  let fetchEvents: {
    current: ReturnType<typeof useFetchEvents>;
  };

  const toast = useToast();
  const queryClient = createTestQueryClient(toast);
  const wrapper = createWrapper(queryClient);

  beforeEach(() => {
    // GIVEN: 각 테스트마다 초기 상태가 반영된 핸들러 설정
    toastCalls = [];
    queryClient.clear();
  });
  afterEach(() => vi.restoreAllMocks());

  it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
    // GIVEN: fetch 함수 mocking
    vi.spyOn(fetchJsonModule, 'fetchJson').mockRejectedValue(new Error('이벤트 로딩 실패'));

    // WHEN: fetch 시도, 이벤트 로딩 실패했을 때
    fetchEvents = renderHook(() => useFetchEvents(), { wrapper }).result;
    await waitFor(() => {
      expect(fetchEvents.current.error?.message).toBe('이벤트 로딩 실패');
    });

    // THEN: 에러 텍스트 및 토스트가 표시되어 있어야 한다.
    expect(toastCalls).toContainEqual({
      title: '이벤트 로딩 실패',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  });

  it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
    // GIVEN: fetch 함수 mocking
    vi.spyOn(fetchJsonModule, 'fetchJson').mockRejectedValue(new Error('일정 삭제 실패'));

    // WHEN: 일정 삭제 시도 후, 삭제 실패했을 때
    const deleteResult = renderHook(() => useDeleteEvent(), { wrapper }).result;
    deleteResult.current.deleteEvent('test-event');
    await waitFor(() => expect(toastCalls.length).toBeGreaterThan(0));

    // THEN: 에러 텍스트 및 토스트가 표시되어 있어야 하며 이벤트 삭제가 실패되어야 한다.
    expect(toastCalls).toContainEqual({
      title: '일정 삭제 실패',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  });
});
