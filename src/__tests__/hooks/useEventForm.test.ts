import { act, renderHook } from '@testing-library/react';

import { useEventForm } from '../../hooks/useEventForm';

describe('반복 일정', () => {
  describe('1. 반복 유형 선택', () => {
    test('반복 유형의 초기값은 none이어야 한다', () => {
      const { result } = renderHook(() => useEventForm());
      expect(result.current.repeatType).toBe('none');
    });

    test('반복 유형을 변경할 수 있어야 한다', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => {
        result.current.setRepeatType('daily');
      });
      expect(result.current.repeatType).toBe('daily');
    });

    test('윤년 2월 29일에 매월 반복을 설정하면 경고가 표시되어야 한다', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => {
        result.current.setDate('2024-02-29');
        result.current.setRepeatType('monthly');
      });

      expect(result.current.dateWarning).toBe('윤년의 2월 29일은 다음 달에는 28일로 설정됩니다.');
    });

    test('31일에 매월 반복을 설정하면 경고가 표시되어야 한다', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => {
        result.current.setDate('2024-01-31');
        result.current.setRepeatType('monthly');
      });

      expect(result.current.dateWarning).toBe('31일은 각 월의 마지막 날에 설정됩니다.');
    });

    test('윤년 2월 29일에 매년 반복을 설정하면 다음 해는 28일이어야 한다', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => {
        result.current.setDate('2024-02-29');
        result.current.setRepeatType('yearly');
      });

      expect(result.current.getNextDate('2025-02-29')).toBe('2025-02-28');
    });
  });
});
