import { act, renderHook } from '@testing-library/react';
import { formatDate } from '@utils/dateUtils.ts';

import { useCalendarView } from '../../hooks/useCalendarView.ts';
import { assertDate } from '../utils.ts';

describe('-', () => {
  let result: { current: ReturnType<typeof useCalendarView> };

  beforeEach(() => {
    result = renderHook(() => useCalendarView()).result;
    result.current.setCurrentDate(new Date());
  });

  describe('초기 상태', () => {
    it('초기 view는 "month"여야 한다', () => {
      // Given: 초기 상태
      // When: view 초기값을 조회
      const { view } = result.current;

      // Then: view가 'month'인지 확인
      expect(view).toBe('month');
    });

    it('currentDate는 오늘 날짜인 "2024-10-01"이어야 한다', () => {
      // Given: 초기 상태
      // When: currentDate 초기값을 조회
      const { currentDate } = result.current;

      // Then: currentDate가 '2024-10-01'인지 확인
      assertDate(currentDate, new Date('2024-10-01'));
    });

    it('holidays는 10월 휴일인 개천절, 한글날이 지정되어 있어야 한다', () => {
      // Given: 초기 상태
      // When: holidays 초기값을 조회
      const { holidays } = result.current;

      // Then: holidays에 개천절과 한글날이 포함되어 있는지 확인
      expect(holidays).toEqual({
        '2024-10-03': '개천절',
        '2024-10-09': '한글날',
      });
    });
  });

  describe('기능 확인', () => {
    it("view를 'week'으로 변경 시 적절하게 반영된다", () => {
      // Given: 초기 상태
      // When: setView를 'week'로 호출
      act(() => result.current.setView('week'));

      // Then: view가 'week'인지 확인
      expect(result.current.view).toBe('week');
    });

    it("주간 뷰에서 다음으로 navigate시 7일 후 '2024-10-08' 날짜로 지정이 된다", () => {
      // Given: 주간 뷰로 전환
      act(() => result.current.setView('week'));

      // When: navigate('next') 호출
      act(() => result.current.navigate('next'));

      // Then: currentDate가 '2024-10-08'로 변경되었는지 확인
      assertDate(result.current.currentDate, new Date('2024-10-08'));
    });

    it("주간 뷰에서 이전으로 navigate시 7일 후 '2024-09-24' 날짜로 지정이 된다", () => {
      // Given: 주간 뷰로 전환
      act(() => result.current.setView('week'));

      // When: navigate('prev') 호출
      act(() => result.current.navigate('prev'));

      // Then: currentDate가 '2024-09-24'로 변경되었는지 확인
      assertDate(result.current.currentDate, new Date('2024-09-24'));
    });

    it("월간 뷰에서 다음으로 navigate시 한 달 전 '2024-11-01' 날짜여야 한다", () => {
      // Given: 초기 월간 뷰 상태
      act(() => result.current.setView('month'));
      // When: navigate('next') 호출
      act(() => result.current.navigate('next'));

      // Then: currentDate가 '2024-11-01'로 변경되었는지 확인
      assertDate(result.current.currentDate, new Date('2024-11-01'));
    });

    it("월간 뷰에서 이전으로 navigate시 한 달 전 '2024-09-01' 날짜여야 한다", () => {
      // Given: 초기 월간 뷰 상태
      // When: navigate('prev') 호출
      act(() => result.current.navigate('prev'));

      // Then: currentDate가 '2024-09-01'로 변경되었는지 확인
      assertDate(result.current.currentDate, new Date('2024-09-01'));
    });

    it("currentDate가 '2024-01-01' 변경되면 1월 휴일 '신정'으로 업데이트되어야 한다", async () => {
      // Given: currentDate가 '2024-01-01'이 될 때까지 navigate('prev') 반복
      const TARGET_DATE = '2024-01-01';

      while (formatDate(result.current.currentDate) !== TARGET_DATE) {
        act(() => result.current.navigate('prev'));
      }

      // Then: currentDate가 '2024-01-01'이고, holidays에 신정이 포함되어 있는지 확인
      assertDate(result.current.currentDate, new Date(TARGET_DATE));
      expect(result.current.holidays).toEqual({ '2024-01-01': '신정' });
    });
  });
});
