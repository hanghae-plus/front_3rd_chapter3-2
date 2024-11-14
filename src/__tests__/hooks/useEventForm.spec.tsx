import { act, renderHook } from '@testing-library/react';
import { ChangeEvent } from 'react';

import { useEventForm } from '../../hooks/useEventForm.ts';
import { Event } from '../../types.ts';

describe('반복 설정', () => {
  it('isRepeating은 일정 생성시 false이어야 한다', () => {
    const { result } = renderHook(() => useEventForm());

    expect(result.current.isRepeating).toBe(false);
  });

  it('isRepeating은 일정 수정시 원래 값을 유지해야 한다', () => {
    const repeatEvent = {
      repeat: { type: 'none' },
    } as Event;

    const { result } = renderHook(() => useEventForm(repeatEvent));

    expect(result.current.isRepeating).toBe(false);
  });

  it('isRepeating이 false일 때 repeatType은 none이어야 한다', () => {
    const { result } = renderHook(() => useEventForm());

    expect(result.current.isRepeating).toBe(false);
    expect(result.current.repeatType).toBe('none');
  });
});

describe('반복 선택 초기 설정', () => {
  it('isRepeating가 true일 때 repeatType은 none이 아니어야 하며, daily이어야 한다', () => {
    const { result } = renderHook(() => useEventForm());

    act(() => {
      result.current.handleIsRepeatingChange({
        target: { checked: true },
      } as ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.isRepeating).toBe(true);
    expect(result.current.repeatType).not.toBe('none');
    expect(result.current.repeatType).toBe('daily');
  });
});
