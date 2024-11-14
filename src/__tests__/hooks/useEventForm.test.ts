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

  describe('2. 반복 간격 설정', () => {
    test('반복 간격의 초기값은 1이어야 한다', () => {
      const { result } = renderHook(() => useEventForm());
      expect(result.current.repeatInterval).toBe(1);
    });

    test('반복 간격을 변경할 수 있어야 한다', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => {
        result.current.setRepeatInterval(2);
      });
      expect(result.current.repeatInterval).toBe(2);
    });

    test('반복 간격은 1 미만으로 설정할 수 없다', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => {
        result.current.setRepeatInterval(0);
      });

      expect(result.current.validationError).toBe('반복 간격은 1 이상이어야 합니다.');
      expect(result.current.repeatInterval).toBe(1); // 1 미만으로 설정되지 않아야 함
    });

    test('매일 반복에서 2일 간격으로 설정하면 다음 일정은 2일 후여야 한다', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => {
        result.current.setDate('2024-01-01');
        result.current.setRepeatType('daily');
        result.current.setRepeatInterval(2);
      });

      expect(result.current.getNextDate('2024-01-01')).toBe('2024-01-03');
    });

    test('매주 반복에서 2주 간격으로 설정하면 다음 일정은 14일 후여야 한다', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => {
        result.current.setDate('2024-01-01');
        result.current.setRepeatType('weekly');
        result.current.setRepeatInterval(2);
      });

      expect(result.current.getNextDate('2024-01-01')).toBe('2024-01-15');
    });

    test('매월 반복에서 2개월 간격으로 설정하면 다음 일정은 2개월 후여야 한다', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => {
        result.current.setDate('2024-01-15');
        result.current.setRepeatType('monthly');
        result.current.setRepeatInterval(2);
      });

      expect(result.current.getNextDate('2024-01-15')).toBe('2024-03-15');
    });
  });
});
