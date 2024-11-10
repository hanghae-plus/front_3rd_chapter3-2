import { act, renderHook } from '@testing-library/react';
import { describe } from 'vitest';

import { useEventForm } from '../hooks/useEventForm.ts';
import { Event } from '../types.ts';

describe('EventForm > 반복 일정과 관련된 테스트', () => {
  it('반복 유형 선택 > 윤년이 아닌 해에 2월 29일로 반복 이벤트 설정 시 에러가 발생해야 한다.', () => {
    const initialEvent: Event = {
      id: '1',
      title: 'Test Event',
      date: '2023-02-29',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'yearly', interval: 1 },
      notificationTime: 15,
    };

    const { result } = renderHook(() => useEventForm(initialEvent));

    act(() => {
      result.current.setDate('2023-02-29');
    });

    expect(result.current.dateError).toBe('유효하지 않은 날짜입니다.');
  });

  it('반복 유형 선택 > 31일이 없는 달에 31일로 반복 이벤트 설정 시 에러가 발생해야 한다.', () => {
    const initialEvent: Event = {
      id: '1',
      title: 'Test Event',
      date: '2024-03-31',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'monthly', interval: 1 },
      notificationTime: 15,
    };

    const { result } = renderHook(() => useEventForm(initialEvent));

    act(() => {
      result.current.setDate('2023-04-31');
    });

    expect(result.current.dateError).toBe('유효하지 않은 날짜입니다.');
  });
});
