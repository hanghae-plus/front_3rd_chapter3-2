import { ChakraProvider, useToast, UseToastOptions } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { http } from 'msw';
import React from 'react';

import { eventFactory } from '../../__mocks__/Factory.ts';
import { events } from '../../__mocks__/response/events.json' assert { type: 'json' };
import { Event, EventForm } from '../../types.ts';

import { CalendarManager } from '@/components/templates/CalendarManager.tsx';
import { createQueryClient } from '@/createQueryClient.ts';
import { useEventOperations } from '@/hooks/useEventOperations.ts';
import { server } from '@/setupTests.ts';

const MOCK_EVENTS = [...events] as const;
const MOCK_EVENTS_LENGTH = MOCK_EVENTS.length;

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

describe('_', () => {
  let queryEvent: {
    current: ReturnType<typeof useEventOperations>;
  };

  const toast = useToast();
  const queryClient = createQueryClient(toast);
  const wrapper = createWrapper(queryClient);

  beforeEach(async () => {
    // GIVEN: 각 테스트마다 초기 상태가 반영된 핸들러 설정
    toastCalls = [];
    queryClient.clear();

    // GIVEN: 초기상태 불러오기
    queryEvent = renderHook(() => useEventOperations(), { wrapper }).result;

    await waitFor(() => expect(queryClient.getQueryState(['events'])?.status).toBe('success'));
  });

  describe('fetch 초기 상태', () => {
    it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
      // THEN: 적확한 초기 이벤트 데이터가 설정되어야 한다.
      MOCK_EVENTS.forEach((event) => expect(queryEvent.current.fetch.events).toContainEqual(event));
    });
  });

  describe('update event', () => {
    it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
      // GIVEN: 새롭게 정의된 이벤트 가공
      const MOCK_EVENT = eventFactory.build({
        id: '1',
        title: 'test',
        startTime: '11:11',
        endTime: '22:22',
      }) as Event;

      // WHEN: 새롭게 정의된 이벤트를 저장했을 때
      await act(() => queryEvent.current.update.updateEvent(MOCK_EVENT));

      // THEN: 새롭게 정의된 이벤트를 불러와야 한다.
      await waitFor(() => {
        const eventsData = queryEvent.current.fetch.events;
        expect(eventsData).toContainEqual(MOCK_EVENT);
      });
    });

    it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
      const NOT_FOUND_EVENT = eventFactory.build({
        id: 'test-mock-event-id',
        title: 'test',
        location: 'a',
        category: 'aa',
      });

      // WHEN: 존재하지 않는 이벤트 수정했을 때
      await act(() => queryEvent.current.update.updateEvent(NOT_FOUND_EVENT));

      await waitFor(() => {
        // THEN: 일정 저장 실패 토스트 노출, 에러 처리가 되어야 한다.
        expect(toastCalls).toContainEqual({
          title: '일정 저장 실패',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        expect(queryEvent.current.fetch.events).not.toStrictEqual(NOT_FOUND_EVENT);
      });
    });
  });

  describe('create event', () => {
    it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
      // GIVEN: 새로 정의된 데이터 가공
      const MOCK_EVENT = (({ id, ...rest }) => rest)(
        eventFactory.build({
          title: 'test-title',
          date: '2024-10-15',
          startTime: '09:00',
          endTime: '10:00',
        })
      ) as EventForm;

      // WHEN: 새로 정의된 데이터를 업데이트 했을때
      await act(() => queryEvent.current.create.createEvent(MOCK_EVENT));

      // THEN: 새로 정의된 데이터를 불러와야 한다.
      await waitFor(() => {
        const expectedNewEvent = { id: String(MOCK_EVENTS_LENGTH + 1), ...MOCK_EVENT };
        expect(queryEvent.current.fetch.events).toContainEqual(expectedNewEvent);
      });
    });
  });

  describe('delete event', () => {
    it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
      MOCK_EVENTS.forEach((event) => expect(queryEvent.current.fetch.events).toContainEqual(event));

      // WHEN: 데이터를 삭제 했을 때
      await act(() => queryEvent.current.deleted.deleteEvent('1'));

      await waitFor(() => {
        // THEN: 삭제 성공여부를 확인한다.
        expect(queryEvent.current.deleted.isSuccess).toBe(true);
        expect(queryEvent.current.deleted.isError).toBe(false);

        // THEN: 삭제된 데이터는 이벤트 목록에 존재하지 않는다.
        const eventsData = queryEvent.current.fetch.events;
        expect(eventsData).toHaveLength(MOCK_EVENTS_LENGTH - 1);
        expect(queryEvent.current.fetch.events).not.toContainEqual({ ...MOCK_EVENTS[0] });
      });
    });
  });

  describe('api 에러 반환', () => {
    it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
      // GIVEN: fetch 함수 mocking
      server.use(
        http.get('/api/events', () => {
          throw new Error('이벤트 로딩 실패');
        })
      );
      queryClient.clear();

      // GIVEN: 초기상태 불러오기
      queryEvent = renderHook(() => useEventOperations(), { wrapper }).result;

      await waitFor(() => {
        // WHEN: fetch 시도, 이벤트 로딩 실패했을 때
        expect(queryClient.getQueryState(['events'])?.status).toBe('error');

        // THEN: 에러 텍스트 및 토스트가 표시되어 있어야 한다.
        expect(toastCalls).toContainEqual({
          title: '이벤트 로딩 실패',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      });
    });

    it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
      // GIVEN: fetch 함수 mocking
      server.use(
        http.delete('/api/events/:id', () => {
          throw new Error('일정 삭제 실패');
        })
      );

      // WHEN: 일정 삭제 시도 후, 삭제 실패했을 때
      queryEvent.current.deleted.deleteEvent('1');

      // THEN: 이벤트 삭제가 실패되어야 한다.
      await waitFor(() => expect(queryEvent.current.deleted.isError).toBe(true));
      // THEN: 에러 텍스트 및 토스트가 표시되어 있어야 한다.
      expect(toastCalls).toContainEqual({
        title: '일정 삭제 실패',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    });
  });
});
