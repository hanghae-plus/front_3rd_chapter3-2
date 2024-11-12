import { act, renderHook } from '@testing-library/react';

import { useEventForm } from '../features/event/model/useEventForm.ts';

describe('setDate(handleDateChange)', () => {
  it.skip('윤년이 아닌 해의 2월 29일을 2월 28일로 조정해야 한다 > 리팩토링 전', () => {
    const { result } = renderHook(() => useEventForm());
    const newDate = '2023-02-29';

    act(() => {
      result.current.setDate(newDate);
    });

    expect(result.current.date).toBe('2023-02-28');
  });

  it('윤년이 아닌 해의 2월 29일을 2월 28일로 조정해야 한다 > 리팩토링 후', () => {
    const { result } = renderHook(() => useEventForm());
    const newDate = '2023-02-29';

    act(() => {
      result.current.setDate(newDate);
    });

    expect(result.current.date).toBe('2023-02-28');
  });

  it.skip('31일이 없는 달에는 30일로 조정해야 한다 > 리팩토링 전', () => {
    const { result } = renderHook(() => useEventForm());

    const newDate = '2024-04-31';

    act(() => {
      result.current.setDate(newDate);
    });

    expect(result.current.date).toBe('2024-04-30');
  });

  it('31일이 없는 달에는 30일로 조정해야 한다 > 리팩토링 후', () => {
    const { result } = renderHook(() => useEventForm());

    const newDate = '2024-04-31';

    act(() => {
      result.current.setDate(newDate);
    });

    expect(result.current.date).toBe('2024-04-30');
  });

  it.skip('유효한 날짜는 조정하지 않고 그대로 반환해야 한다 > 리팩토링 전', () => {
    const { result } = renderHook(() => useEventForm());
    const newDate = '2024-03-15';

    act(() => {
      result.current.setDate(newDate);
    });

    expect(result.current.date).toBe(newDate);
  });

  it('유효한 날짜는 조정하지 않고 그대로 반환해야 한다 > 리팩토링 후', () => {
    const { result } = renderHook(() => useEventForm());
    const newDate = '2024-03-15';

    act(() => {
      result.current.setDate(newDate);
    });

    expect(result.current.date).toBe(newDate);
  });

  it.skip('윤년의 2월 29일은 그대로 유지되어야 한다 > 리팩토링 전', () => {
    const { result } = renderHook(() => useEventForm());

    const newDate = '2024-02-29';

    act(() => {
      result.current.setDate(newDate);
    });

    expect(result.current.date).toBe(newDate);
  });

  it('윤년의 2월 29일은 그대로 유지되어야 한다 > 리팩토링 후', () => {
    const { result } = renderHook(() => useEventForm());

    const newDate = '2024-02-29';

    act(() => {
      result.current.setDate(newDate);
    });

    expect(result.current.date).toBe(newDate);
  });
});
