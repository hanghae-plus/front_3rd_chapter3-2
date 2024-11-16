import { act, renderHook } from '@testing-library/react';
import { Provider } from 'jotai';
import React from 'react';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

const events: Event[] = [
  {
    id: '1',
    title: '회의',
    description: '월간 회의',
    location: '회의실',
    date: '2024-10-31',
    startTime: '10:00',
    endTime: '12:00',
    category: '회의',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '점심',
    description: '점심식사',
    location: '식당',
    date: '2024-11-02',
    startTime: '12:00',
    endTime: '13:00',
    category: '식사',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '3',
    title: '회의',
    description: '주간 회의',
    location: '회의실',
    date: '2024-11-03',
    startTime: '14:00',
    endTime: '16:00',
    category: '회의',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '4',
    title: '회의',
    description: '주간 회의',
    location: '회의실',
    date: '2024-11-20',
    startTime: '14:00',
    endTime: '16:00',
    category: '회의',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
];

let currentDate = new Date('2024-11-01');
beforeEach(() => {
  currentDate = new Date('2024-11-01');
});

const wrapper = ({ children }: { children: React.ReactNode }) => <Provider>{children}</Provider>;

describe('검색어가 비어있을 때 현재 뷰(주간/월간)에 해당하는 모든 이벤트를 반환해야 한다', () => {
  it('현재 주간에 해당하는 모든 이벤트를 반환해야 한다', () => {
    const view = 'week';
    const { result } = renderHook(() => useSearch(events, currentDate, view), { wrapper });

    expect(result.current.filteredEvents).toHaveLength(2);
    expect(result.current.filteredEvents).toEqual([
      {
        id: '1',
        title: '회의',
        description: '월간 회의',
        location: '회의실',
        date: '2024-10-31',
        startTime: '10:00',
        endTime: '12:00',
        category: '회의',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '점심',
        description: '점심식사',
        location: '식당',
        date: '2024-11-02',
        startTime: '12:00',
        endTime: '13:00',
        category: '식사',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);
  });

  it('현재 월간에 해당하는 모든 이벤트를 반환해야 한다', () => {
    const view = 'month';
    const { result } = renderHook(() => useSearch(events, currentDate, view), { wrapper });

    expect(result.current.filteredEvents).toHaveLength(3);
    expect(result.current.filteredEvents).toEqual([
      {
        id: '2',
        title: '점심',
        description: '점심식사',
        location: '식당',
        date: '2024-11-02',
        startTime: '12:00',
        endTime: '13:00',
        category: '식사',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '3',
        title: '회의',
        description: '주간 회의',
        location: '회의실',
        date: '2024-11-03',
        startTime: '14:00',
        endTime: '16:00',
        category: '회의',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '4',
        title: '회의',
        description: '주간 회의',
        location: '회의실',
        date: '2024-11-20',
        startTime: '14:00',
        endTime: '16:00',
        category: '회의',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);
  });
});

describe('검색어가 있을 때 현재 뷰(주간/월간)에 해당하는 이벤트를 반환해야 한다', () => {
  it('현재 주간에 해당하는 검색 이벤트만 반환해야 한다', () => {
    const view = 'week';
    const { result } = renderHook(() => useSearch(events, currentDate, view), { wrapper });

    act(() => {
      result.current.setSearchTerm('회의');
    });

    expect(result.current.filteredEvents).toHaveLength(1);
    expect(result.current.filteredEvents).toEqual([
      {
        id: '1',
        title: '회의',
        description: '월간 회의',
        location: '회의실',
        date: '2024-10-31',
        startTime: '10:00',
        endTime: '12:00',
        category: '회의',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);
  });

  it('현재 월간에 해당하는 검색 이벤트만 반환해야 한다', () => {
    const view = 'month';
    const { result } = renderHook(() => useSearch(events, currentDate, view), { wrapper });

    act(() => {
      result.current.setSearchTerm('회의');
    });

    expect(result.current.filteredEvents).toHaveLength(2);
    expect(result.current.filteredEvents).toEqual([
      {
        id: '3',
        title: '회의',
        description: '주간 회의',
        location: '회의실',
        date: '2024-11-03',
        startTime: '14:00',
        endTime: '16:00',
        category: '회의',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '4',
        title: '회의',
        description: '주간 회의',
        location: '회의실',
        date: '2024-11-20',
        startTime: '14:00',
        endTime: '16:00',
        category: '회의',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);
  });
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const view = 'month';
  const { result } = renderHook(() => useSearch(events, currentDate, view), { wrapper });

  act(() => {
    result.current.setSearchTerm('점심');
  });

  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents).toEqual([
    {
      id: '2',
      title: '점심',
      description: '점심식사',
      location: '식당',
      date: '2024-11-02',
      startTime: '12:00',
      endTime: '13:00',
      category: '식사',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ]);
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const view = 'month';
  const { result } = renderHook(() => useSearch(events, currentDate, view), { wrapper });

  act(() => {
    result.current.setSearchTerm('식당');
  });

  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents).toEqual([
    {
      id: '2',
      title: '점심',
      description: '점심식사',
      location: '식당',
      date: '2024-11-02',
      startTime: '12:00',
      endTime: '13:00',
      category: '식사',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ]);
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const view = 'month';
  const { result } = renderHook(() => useSearch(events, currentDate, view), { wrapper });

  act(() => {
    result.current.setSearchTerm('회의');
  });

  expect(result.current.filteredEvents).toHaveLength(2);
  expect(result.current.filteredEvents).toEqual([
    {
      id: '3',
      title: '회의',
      description: '주간 회의',
      location: '회의실',
      date: '2024-11-03',
      startTime: '14:00',
      endTime: '16:00',
      category: '회의',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '4',
      title: '회의',
      description: '주간 회의',
      location: '회의실',
      date: '2024-11-20',
      startTime: '14:00',
      endTime: '16:00',
      category: '회의',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ]);

  act(() => {
    result.current.setSearchTerm('점심');
  });

  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents).toEqual([
    {
      id: '2',
      title: '점심',
      description: '점심식사',
      location: '식당',
      date: '2024-11-02',
      startTime: '12:00',
      endTime: '13:00',
      category: '식사',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ]);
});
