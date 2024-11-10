import { act, renderHook } from '@testing-library/react';
import { expect } from 'vitest';

import { useEventOperations } from '../hooks/useEventOperations.ts';
import { EventForm } from '../types.ts';

describe('saveEvent > 반복 간격 설정 테스트', () => {
  it('매달 반복 이벤트가 12번 생성되는지 확인', async () => {
    const { result } = renderHook(() => useEventOperations(false));

    const testEvent: EventForm = {
      title: 'Monthly Meeting',
      date: '2024-01-01',
      startTime: '10:00',
      endTime: '11:00',
      description: 'Recurring monthly meeting',
      location: 'Conference Room',
      category: 'Work',
      repeat: {
        type: 'monthly',
        interval: 1, // 매월
        endDate: '2024-12-01', // 12월 1일까지 반복
      },
      notificationTime: 10,
    };

    await act(async () => {
      await result.current.saveEvent(testEvent);
    });

    expect(result.current.events).toHaveLength(12);
    expect(result.current.events[0].date).toBe('2024-01-01');
    expect(result.current.events[11].date).toBe('2024-12-01');
  });
});
