import useCalendarViewStore from '@stores/useCalendarViewStore.ts';
import useSearchStore from '@stores/useSearchStore.ts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import React from 'react';

import { events } from '../../__mocks__/response/events.json' assert { type: 'json' };
import { useSearch } from '../../hooks/useSearch.ts';

const MOCK_EVENTS = [...events] as const;
const queryClient = new QueryClient();

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('-', () => {
  let result: { current: ReturnType<typeof useSearch> };

  beforeEach(() => {
    queryClient.setQueryData(['events'], [...MOCK_EVENTS]);
    useCalendarViewStore.setState({ currentDate: new Date() });
    // GIVEN: useSearch 초기상태 세팅
    result = renderHook(() => useSearch(), { wrapper }).result;
  });
  afterEach(() => {
    useCalendarViewStore.setState({ view: 'month', currentDate: new Date() });
    useSearchStore.setState({ searchTerm: '' });
  });

  describe('초기 상태', () => {
    it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', async () => {
      // WHEN: 조건이 충족될 때까지 대기 events가 비어있지 않을 때
      await waitFor(() => {
        expect(result.current.events.length).toBeGreaterThan(0);
        expect(result.current.filteredEvents.length).toBeGreaterThan(0);
      });

      //  THEN: 초기값 확인
      const { searchTerm, events, filteredEvents } = result.current;
      expect(searchTerm).toBe('');
      expect(events).toHaveLength(MOCK_EVENTS.length);
      expect(filteredEvents).toEqual(result.current.events);
    });
  });

  describe('검색 기능 확인', () => {
    it('검색어에 맞는 이벤트만 필터링해야 한다', async () => {
      // WHEN: 검색어 입력했을 때
      act(() => result.current.setSearchTerm('회의'));
      await waitFor(() => expect(result.current.filteredEvents).toHaveLength(3));

      // THEN 검색어에 맞는 이벤트만 필터링 되어야 한다.
      expect(result.current.filteredEvents).toEqual([
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
          exceptionList: [],
        },
        {
          id: '2',
          title: '팀원 회의',
          date: '2024-10-15',
          startTime: '14:00',
          endTime: '16:00',
          description: '코드 리뷰',
          location: '회의실 C',
          category: '업무',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
          exceptionList: [],
        },
        {
          id: '4',
          title: '팀 회의',
          date: '2024-10-24',
          startTime: '14:00',
          endTime: '15:00',
          description: '리뷰',
          location: '회의실 D',
          category: '업무',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
          exceptionList: [],
        },
      ]);
    });

    test.each([
      {
        target: '제목',
        search: '점심',
        expected: [
          {
            id: '3',
            title: '점심 약속',
            date: '2024-10-01',
            startTime: '19:00',
            endTime: '22:00',
            description: '스시 예약',
            location: '식당 A',
            category: '개인',
            repeat: { type: 'none', interval: 0 },
            notificationTime: 10,
            exceptionList: [],
          },
        ],
      },
      {
        target: '설명',
        search: '리뷰',
        expected: [
          {
            id: '2',
            title: '팀원 회의',
            date: '2024-10-15',
            startTime: '14:00',
            endTime: '16:00',
            description: '코드 리뷰',
            location: '회의실 C',
            category: '업무',
            repeat: { type: 'none', interval: 0 },
            notificationTime: 10,
            exceptionList: [],
          },
          {
            id: '4',
            title: '팀 회의',
            date: '2024-10-24',
            startTime: '14:00',
            endTime: '15:00',
            description: '리뷰',
            location: '회의실 D',
            category: '업무',
            repeat: { type: 'none', interval: 0 },
            notificationTime: 10,
            exceptionList: [],
          },
        ],
      },
      {
        target: '위치',
        search: '식당',
        expected: [
          {
            id: '3',
            title: '점심 약속',
            date: '2024-10-01',
            startTime: '19:00',
            endTime: '22:00',
            description: '스시 예약',
            location: '식당 A',
            category: '개인',
            repeat: { type: 'none', interval: 0 },
            notificationTime: 10,
            exceptionList: [],
          },
        ],
      },
      {
        target: '제목+위치',
        search: '회의',
        expected: [
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
            exceptionList: [],
          },
          {
            id: '2',
            title: '팀원 회의',
            date: '2024-10-15',
            startTime: '14:00',
            endTime: '16:00',
            description: '코드 리뷰',
            location: '회의실 C',
            category: '업무',
            repeat: { type: 'none', interval: 0 },
            notificationTime: 10,
            exceptionList: [],
          },
          {
            id: '4',
            title: '팀 회의',
            date: '2024-10-24',
            startTime: '14:00',
            endTime: '15:00',
            description: '리뷰',
            location: '회의실 D',
            category: '업무',
            repeat: { type: 'none', interval: 0 },
            notificationTime: 10,
            exceptionList: [],
          },
        ],
      },
    ])(
      `검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다`,
      async ({ search, expected }) => {
        // WHEN: 검색어를 입력했을 때
        act(() => result.current.setSearchTerm(search));
        await waitFor(() => expect(result.current.filteredEvents).toHaveLength(expected.length));

        // THEN: 일치하는 이벤트를 반환한다.
        expect(result.current.filteredEvents).toEqual(expected);
      }
    );

    test.each([
      {
        view: 'week' as 'month' | 'week',
        expected: [
          {
            id: '3',
            title: '점심 약속',
            date: '2024-10-01',
            startTime: '19:00',
            endTime: '22:00',
            description: '스시 예약',
            location: '식당 A',
            category: '개인',
            repeat: { type: 'none', interval: 0 },
            notificationTime: 10,
            exceptionList: [],
          },
        ],
      },
      {
        view: 'month' as 'month' | 'week',
        expected: [
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
            exceptionList: [],
          },
          {
            id: '2',
            title: '팀원 회의',
            date: '2024-10-15',
            startTime: '14:00',
            endTime: '16:00',
            description: '코드 리뷰',
            location: '회의실 C',
            category: '업무',
            repeat: { type: 'none', interval: 0 },
            notificationTime: 10,
            exceptionList: [],
          },
          {
            id: '3',
            title: '점심 약속',
            date: '2024-10-01',
            startTime: '19:00',
            endTime: '22:00',
            description: '스시 예약',
            location: '식당 A',
            category: '개인',
            repeat: { type: 'none', interval: 0 },
            notificationTime: 10,
            exceptionList: [],
          },
          {
            id: '4',
            title: '팀 회의',
            date: '2024-10-24',
            startTime: '14:00',
            endTime: '15:00',
            description: '리뷰',
            location: '회의실 D',
            category: '업무',
            repeat: { type: 'none', interval: 0 },
            notificationTime: 10,
            exceptionList: [],
          },
        ],
      },
    ])(`현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다`, async ({ view, expected }) => {
      // WHEN: 뷰(주간/월간)으로 변경
      act(() => useCalendarViewStore.setState({ view: view, currentDate: new Date() }));
      await waitFor(() => expect(result.current.filteredEvents).toHaveLength(expected.length));

      // THEN: 일치하는 이벤트를 반환한다.
      expected.forEach((event) => {
        expect(result.current.filteredEvents).toContainEqual(event);
      });
    });

    it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", async () => {
      // GIVEN: 검색어가 회의인 상황
      result.current.setSearchTerm('회의');
      await waitFor(() => expect(result.current.searchTerm).toBe('회의'));
      result.current.setSearchTerm('점심');
      await waitFor(() => expect(result.current.searchTerm).toBe('점심'));

      expect(result.current.filteredEvents).toHaveLength(1);
      expect(result.current.filteredEvents).toEqual([
        {
          id: '3',
          title: '점심 약속',
          date: '2024-10-01',
          startTime: '19:00',
          endTime: '22:00',
          description: '스시 예약',
          location: '식당 A',
          category: '개인',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
          exceptionList: [],
        },
      ]);
    });
  });
});
