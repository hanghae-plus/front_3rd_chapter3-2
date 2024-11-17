import { act, renderHook } from '@testing-library/react';

import { events } from '../../__mocks__/response/events.json' assert { type: 'json' };
import { Event } from '../../entities/event/model/type.ts';
import useOverlapDialog from '../../features/event/model/useOverlapDialog.ts';

describe('useOverlapDialog', () => {
  it('초기 상태 테스트', () => {
    const { result } = renderHook(() => useOverlapDialog());
    expect(result.current.isOverlapDialogOpen).toBe(false);
    expect(result.current.overlappingEvents).toEqual([]);
  });

  it('openOverlapDialog 함수 테스트', () => {
    const { result } = renderHook(() => useOverlapDialog());

    act(() => {
      result.current.openOverlapDialog(events as Event[]);
    });

    expect(result.current.isOverlapDialogOpen).toBe(true);
    expect(result.current.overlappingEvents).toEqual(events);
  });

  it('closeOverlapDialog 함수 테스트', () => {
    const { result } = renderHook(() => useOverlapDialog());

    act(() => {
      result.current.openOverlapDialog(events as Event[]);
    });

    expect(result.current.isOverlapDialogOpen).toBe(true);
    expect(result.current.overlappingEvents).toEqual(events);

    act(() => {
      result.current.closeOverlapDialog();
    });
    expect(result.current.isOverlapDialogOpen).toBe(false);
    expect(result.current.overlappingEvents).toEqual([]);
  });
});
