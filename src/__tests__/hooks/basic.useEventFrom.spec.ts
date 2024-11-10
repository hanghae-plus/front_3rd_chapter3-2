import { act, renderHook } from '@testing-library/react';
import { useEventForm } from '../../hooks/useEventForm';

describe('윤년과 31일 체크', () => {
  it('윤년이 아닌 해의 2월 29일을 그 전날 인 2월 28일로 설정되어야 한다.', () => {
    const { result } = renderHook(() => useEventForm());
    act(() => {
      result.current.setDate('2023-02-29');
    });
    expect(result.current.date).toBe('2023-02-28');
  });

  it('31일이 없는 달에는 그 전날 인 30일로 설정되어야 한다.', () => {
    const { result } = renderHook(() => useEventForm());
    act(() => {
      result.current.setDate('2024-11-31');
    });
    expect(result.current.date).toBe('2024-11-30');
  });

  it('올바르게 설정되는 날짜는 조정하지 않고 그대로 설정되어야 한다', () => {
    const { result } = renderHook(() => useEventForm());
    act(() => {
      result.current.setDate('2024-03-15');
    });
    expect(result.current.date).toBe('2024-03-15');
  });

  it('윤년의 2월 29일은 그대로 설정되어야 한다.', () => {
    const { result } = renderHook(() => useEventForm());
    act(() => {
      result.current.setDate('2024-02-29');
    });
    expect(result.current.date).toBe('2024-02-29');
  });

  it('31일이 있는 달에는 그대로 설정되어야 한다.', () => {
    const { result } = renderHook(() => useEventForm());
    act(() => {
      result.current.setDate('2024-03-31');
    });
    expect(result.current.date).toBe('2024-03-31');
  });
});