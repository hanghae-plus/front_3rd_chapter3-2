import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

const mockEvents: Event[] = [
  {
    id: 1,
    title: '회의',
    date: '2024-10-01',
    startTime: '10:00',
    endTime: '11:00',
    description: '팀 회의',
    location: '회의실',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: 2,
    title: '점심 약속',
    date: '2024-10-02',
    startTime: '12:00',
    endTime: '13:00',
    description: '친구와 점심',
    location: '레스토랑',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: 3,
    title: '운동',
    date: '2024-10-11',
    startTime: '18:00',
    endTime: '19:00',
    description: '헬스장 가기',
    location: '헬스장',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
];

const currentDate = new Date('2024-10-01');
const view = 'month' as const;

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(mockEvents, currentDate, view));

  expect(result.current.filteredEvents).toEqual(mockEvents);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const { result } = renderHook(() => useSearch(mockEvents, currentDate, view));

  act(() => {
    result.current.setSearchTerm('회의');
  });

  expect(result.current.filteredEvents).toEqual([
    {
      id: 1,
      title: '회의',
      date: '2024-10-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '팀 회의',
      location: '회의실',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ]);
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(mockEvents, currentDate, view));

  act(() => {
    result.current.setSearchTerm('점심');
  });

  expect(result.current.filteredEvents).toEqual([
    {
      id: 2,
      title: '점심 약속',
      date: '2024-10-02',
      startTime: '12:00',
      endTime: '13:00',
      description: '친구와 점심',
      location: '레스토랑',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ]);
});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(mockEvents, new Date('2024-10-10'), 'week'));

  expect(result.current.filteredEvents).toEqual([
    {
      id: 3,
      title: '운동',
      date: '2024-10-11',
      startTime: '18:00',
      endTime: '19:00',
      description: '헬스장 가기',
      location: '헬스장',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ]);
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const { result } = renderHook(() => useSearch(mockEvents, currentDate, view));

  act(() => {
    result.current.setSearchTerm('회의');
  });

  expect(result.current.filteredEvents).toEqual([
    {
      id: 1,
      title: '회의',
      date: '2024-10-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '팀 회의',
      location: '회의실',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ]);

  act(() => {
    result.current.setSearchTerm('점심');
  });

  expect(result.current.filteredEvents).toEqual([
    {
      id: 2,
      title: '점심 약속',
      date: '2024-10-02',
      startTime: '12:00',
      endTime: '13:00',
      description: '친구와 점심',
      location: '레스토랑',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ]);
});
