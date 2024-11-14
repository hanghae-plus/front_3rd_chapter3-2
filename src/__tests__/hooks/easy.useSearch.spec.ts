import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../features/event/model/useSearch.ts';
import { Event } from '../../types.ts';

const targetDate = (date: string, laterDay: number): Date => {
  return new Date(new Date(date).getTime() + laterDay * 24 * 60 * 60 * 1000);
};

const createDate = (dateString: string, laterDay?: number) => {
  const fullDate = targetDate(dateString, laterDay ?? 0);
  return {
    fullDate,
    dateString: fullDate.toISOString().split('T')[0],
    timeString: fullDate.toISOString().split('T')[1].split('.')[0],
  };
};

const dateString = '2024-11-01';

const baseDate = createDate(dateString);

const events: Event[] = [
  {
    id: '1',
    title: 'Event 1',
    date: baseDate.dateString,
    startTime: '10:00',
    endTime: '11:00',
    notificationTime: 10,
    description: 'Event 1 description',
    location: 'Event 1 location',
    category: 'Event 1 category',
    repeat: {
      type: 'daily',
      interval: 1,
    },
  },
  {
    id: '2',
    title: '이벤트 회의2',
    date: '2024-11-21',
    startTime: '12:00',
    endTime: '13:00',
    notificationTime: 10,
    description: '이벤트 회의 2 설명',
    location: '이벤트 회의 2 장소',
    category: '이벤트 2 카테고리',
    repeat: {
      type: 'daily',
      interval: 1,
    },
  },
];

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(events, baseDate.fullDate, 'month'));

  // 검색어가 비어있을 때 모든 이벤트를 반환한다.
  act(() => {
    result.current.setSearchTerm('');
  });

  // 모든 이벤트를 반환한다.
  expect(result.current.filteredEvents).toEqual(events);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const { result } = renderHook(() => useSearch(events, baseDate.fullDate, 'month'));

  // 검색어에 맞는 이벤트만 필터링해야 한다.
  act(() => {
    result.current.setSearchTerm('이벤트');
  });

  // 검색어에 맞는 이벤트만 반환한다.
  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents[0].title).toBe('이벤트 회의2');
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(events, baseDate.fullDate, 'month'));

  // 제목으로 검색 시, 일치하는 이벤트를 반환한다.
  act(() => {
    result.current.setSearchTerm('이벤트');
  });

  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents[0].title).toBe('이벤트 회의2');

  // 설명으로 검색 시, 일치하는 이벤트를 반환한다.
  act(() => {
    result.current.setSearchTerm('설명');
  });

  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents[0].title).toBe('이벤트 회의2');

  // 위치로 검색 시, 일치하는 이벤트를 반환한다.
  act(() => {
    result.current.setSearchTerm('장소');
  });

  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents[0].title).toBe('이벤트 회의2');
});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  // 월간으로 렌더링 시, 월간 이벤트만 반환한다.
  const { result: resultMonth } = renderHook(() => useSearch(events, baseDate.fullDate, 'month'));

  expect(resultMonth.current.filteredEvents).toHaveLength(2);

  // 주간으로 렌더링 시, 주간 이벤트만 반환한다.
  const { result: resultWeek } = renderHook(() =>
    useSearch(events, targetDate('2024-11-01', 19), 'week')
  );

  expect(resultWeek.current.filteredEvents).toHaveLength(1);
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const { result } = renderHook(() => useSearch(events, baseDate.fullDate, 'month'));

  // 회의로 검색 시, 일치하는 이벤트를 반환한다.
  act(() => {
    result.current.setSearchTerm('회의');
  });

  expect(result.current.filteredEvents).toHaveLength(1);

  // 점심으로 검색 시, 일치하는 이벤트가 없으므로 빈 배열을 반환한다.
  act(() => {
    result.current.setSearchTerm('점심');
  });

  expect(result.current.filteredEvents).toHaveLength(0);
});
