import useCalendarViewStore from '@stores/useCalendarViewStore.ts';
import useSearchStore from '@stores/useSearchStore.ts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import React from 'react';

import { createEvent } from '../../__mocks__/Factory.ts';
import { events } from '../../__mocks__/response/events.json' assert { type: 'json' };
import { searchTestCase, viewEventTestCase } from '../../__mocks__/testCases.ts';
import { useSearch } from '../../hooks/useSearch.ts';

import { Event } from '@/types.ts';

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
        { ...MOCK_EVENTS[0] },
        { ...MOCK_EVENTS[1] },
        { ...MOCK_EVENTS[3] },
      ]);
    });

    test.each(searchTestCase)(
      `검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다`,
      async ({ search, expected }) => {
        // WHEN: 검색어를 입력했을 때
        act(() => result.current.setSearchTerm(search));
        await waitFor(() => expect(result.current.filteredEvents).toHaveLength(expected.length));

        // THEN: 일치하는 이벤트를 반환한다.
        expect(result.current.filteredEvents).toEqual(expected);
      }
    );

    test.each(viewEventTestCase)(
      `현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다`,
      async ({ view, expected }) => {
        // WHEN: 뷰(주간/월간)으로 변경
        act(() => useCalendarViewStore.setState({ view: view, currentDate: new Date() }));
        await waitFor(() => expect(result.current.filteredEvents).toHaveLength(expected.length));

        // THEN: 일치하는 이벤트를 반환한다.
        expected.forEach((event) => {
          expect(result.current.filteredEvents).toContainEqual(event);
        });
      }
    );

    it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", async () => {
      // GIVEN: 검색어가 회의인 상황
      result.current.setSearchTerm('회의');
      await waitFor(() => expect(result.current.searchTerm).toBe('회의'));
      result.current.setSearchTerm('점심');
      await waitFor(() => expect(result.current.searchTerm).toBe('점심'));

      expect(result.current.filteredEvents).toHaveLength(1);
      expect(result.current.filteredEvents).toEqual([
        createEvent({ ...(MOCK_EVENTS[2] as Event) }),
      ]);
    });
  });
});
