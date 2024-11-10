import { act, renderHook } from '@testing-library/react';
import { describe, vi } from 'vitest';

import { setupMockHandlerCreation, setupMockHandlerUpdating } from '../__mocks__/handlersUtils.ts';
import { useEventForm } from '../hooks/useEventForm.ts';
import { Event, RepeatType } from '../types.ts';
import { generateRecurringEvents } from '../utils/eventUtils.ts';

describe('editDate', () => {
  it('반복 일정을 수정하면 단일 일정으로 변경된다', () => {
    vi.setSystemTime('2024-11-01');
    const result = generateRecurringEvents('2024-11-01', 1, 'monthly' as RepeatType, '2025-02-01');

    const eventData: Event = {
      id: '1',
      title: '매월 반복 이벤트',
      date: '2025-11-01',
      startTime: '21:25',
      endTime: '23:31',
      description: '',
      location: '',
      category: '',
      repeat: {
        type: 'monthly',
        interval: 1,
        endDate: '2025-12-31',
      },
      notificationTime: 10,
    };

    const recurringEvents = result.map((eventDate) => ({
      ...eventData,
      date: eventDate,
    }));

    setupMockHandlerCreation(recurringEvents);
    setupMockHandlerUpdating();

    const { result: eventFormResult } = renderHook(() => useEventForm());

    act(() => {
      eventFormResult.current.editEvent({
        ...eventData,
        id: '1',
        title: '반복 이벤트 아님',
        date: '2025-11-01',
        startTime: '21:25',
        endTime: '23:31',
        description: '',
        location: '',
        category: '',
        notificationTime: 10,
      });
    });

    expect(eventFormResult.current.title).toBe('반복 이벤트 아님');
    expect(eventFormResult.current.date).toBe('2025-11-01');
    expect(eventFormResult.current.startTime).toBe('21:25');
    expect(eventFormResult.current.endTime).toBe('23:31');
    expect(eventFormResult.current.isRepeating).toBe(false);
    expect(eventFormResult.current.repeatType).toBe('none');
    expect(eventFormResult.current.repeatInterval).toBe(1);
    expect(eventFormResult.current.repeatEndDate).toBe('');
  });
});
