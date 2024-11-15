import { ChakraProvider } from '@chakra-ui/react';
import { act, render, renderHook, screen } from '@testing-library/react';
import React from 'react';
import EventItem from '../../components/EventItem';
import useRepeatEvent from '../../hooks/useRepeatEvent';

describe('useRepeatEvent', () => {
  describe('초기 상태', () => {
    it('기본적으로 반복이 비활성화되어 있어야 한다', () => {
      const { result } = renderHook(() => useRepeatEvent());

      expect(result.current.isRepeating).toBe(false);
    });

    it('반복 관련 초기값이 올바르게 설정되어 있어야 한다', () => {
      const { result } = renderHook(() => useRepeatEvent());

      expect(result.current.repeatType).toBe('daily');
      expect(result.current.repeatInterval).toBe(1);
      expect(result.current.repeatEndDate).toBe('');
    });
  });

  describe('반복 유형 선택', () => {
    describe('반복 설정 변경', () => {
      it('반복 활성화 상태를 변경할 수 있다', () => {
        const { result } = renderHook(() => useRepeatEvent());

        act(() => {
          result.current.setIsRepeating(true);
        });

        expect(result.current.isRepeating).toBe(true);
      });

      it('반복 유형을 변경할 수 있다', () => {
        const { result } = renderHook(() => useRepeatEvent());

        act(() => {
          result.current.setRepeatType('monthly');
        });

        expect(result.current.repeatType).toBe('monthly');
      });
    });

    describe('특수 날짜 처리', () => {
      it('윤년 2월 29일에 매월 반복 설정 시 경고 메시지를 반환해야 한다', () => {
        const { result } = renderHook(() => useRepeatEvent());

        act(() => {
          result.current.setEventDate(new Date('2024-02-29'));
          result.current.setRepeatType('monthly');
        });

        expect(result.current.warning).toBe('윤년의 2월 29일은 매월 마지막 날로 처리됩니다');
      });

      it('31일에 매월 반복 설정 시 경고 메시지를 반환해야 한다', () => {
        const { result } = renderHook(() => useRepeatEvent());

        act(() => {
          result.current.setEventDate(new Date('2024-01-31'));
          result.current.setRepeatType('monthly');
        });

        expect(result.current.warning).toBe('31일은 해당 월의 마지막 날로 처리됩니다');
      });
    });
  });

  describe('반복 간격 설정', () => {
    it('반복 간격은 1 이상의 값만 설정할 수 있다', () => {
      const { result } = renderHook(() => useRepeatEvent());

      act(() => {
        result.current.setRepeatInterval(0);
      });

      expect(result.current.repeatInterval).toBe(1);
    });

    it('각 반복 유형별로 최대 간격이 제한되어야 한다', () => {
      const { result } = renderHook(() => useRepeatEvent());

      // 일간 반복 최대 365일
      act(() => {
        result.current.setRepeatType('daily');
        result.current.setRepeatInterval(366);
      });
      expect(result.current.intervalError).toBe('일간 반복은 최대 365일까지 가능합니다');

      // 주간 반복 최대 52주
      act(() => {
        result.current.setRepeatType('weekly');
        result.current.setRepeatInterval(53);
      });
      expect(result.current.intervalError).toBe('주간 반복은 최대 52주까지 가능합니다');

      // 월간 반복 최대 12개월
      act(() => {
        result.current.setRepeatType('monthly');
        result.current.setRepeatInterval(13);
      });
      expect(result.current.intervalError).toBe('월간 반복은 최대 12개월까지 가능합니다');

      // 연간 반복 최대 10년
      act(() => {
        result.current.setRepeatType('yearly');
        result.current.setRepeatInterval(11);
      });
      expect(result.current.intervalError).toBe('연간 반복은 최대 10년까지 가능합니다');
    });

    it('유효한 반복 간격이 설정되면 에러 메시지가 없어야 한다', () => {
      const { result } = renderHook(() => useRepeatEvent());

      act(() => {
        result.current.setRepeatType('daily');
        result.current.setRepeatInterval(2);
      });

      expect(result.current.repeatInterval).toBe(2);
      expect(result.current.intervalError).toBe('');
    });

    it('반복 유형이 변경되면 간격이 1로 초기화되어야 한다', () => {
      const { result } = renderHook(() => useRepeatEvent());

      act(() => {
        result.current.setRepeatType('daily');
        result.current.setRepeatInterval(5);
      });
      expect(result.current.repeatInterval).toBe(5);

      act(() => {
        result.current.setRepeatType('weekly');
      });
      expect(result.current.repeatInterval).toBe(1);
    });
  });

  describe('반복 일정 표시', () => {
    const mockEvent = {
      id: '1',
      title: '테스트 일정',
      date: '2024-03-20',
      notification: 0,
      isRepeating: false,
      repeatType: 'daily' as const,
      repeatInterval: 1,
      repeatEndDate: '',
    };

    const renderWithChakra = (ui: React.ReactElement) => {
      return render(<ChakraProvider>{ui}</ChakraProvider>);
    };

    it('일반 일정인 경우 반복 아이콘이 표시되지 않아야 한다', () => {
      renderWithChakra(<EventItem event={mockEvent} />);

      const repeatIcon = screen.queryByTestId('repeat-icon');
      expect(repeatIcon).not.toBeInTheDocument();
    });

    it('반복 일정인 경우 반복 아이콘이 표시되어야 한다', () => {
      const repeatingEvent = {
        ...mockEvent,
        isRepeating: true,
      };

      renderWithChakra(<EventItem event={repeatingEvent} />);

      const repeatIcon = screen.getByTestId('repeat-icon');
      expect(repeatIcon).toBeInTheDocument();
    });

    it('반복 유형에 따라 적절한 툴팁이 표시되어야 한다', () => {
      const repeatingEvent = {
        ...mockEvent,
        isRepeating: true,
        repeatType: 'weekly' as const,
        repeatInterval: 2,
      };

      renderWithChakra(<EventItem event={repeatingEvent} />);

      const repeatBadge = screen.getByTitle('2주마다 반복');
      expect(repeatBadge).toBeInTheDocument();
    });
  });

  describe('반복 종료 설정', () => {
    it('기본적으로 종료일이 없어야 한다', () => {
      const { result } = renderHook(() => useRepeatEvent());

      expect(result.current.repeatEndType).toBe('never');
      expect(result.current.repeatEndDate).toBe('');
      expect(result.current.repeatEndCount).toBe(0);
    });

    it('종료 유형을 변경할 수 있다', () => {
      const { result } = renderHook(() => useRepeatEvent());

      act(() => {
        result.current.setRepeatEndType('until');
      });
      expect(result.current.repeatEndType).toBe('until');

      act(() => {
        result.current.setRepeatEndType('count');
      });
      expect(result.current.repeatEndType).toBe('count');
    });

    it('종료일을 설정할 수 있다', () => {
      const { result } = renderHook(() => useRepeatEvent());

      act(() => {
        result.current.setRepeatEndType('until');
        result.current.setRepeatEndDate('2025-06-30');
      });

      expect(result.current.repeatEndDate).toBe('2025-06-30');
    });

    it('반복 횟수를 설정할 수 있다', () => {
      const { result } = renderHook(() => useRepeatEvent());

      act(() => {
        result.current.setRepeatEndType('count');
        result.current.setRepeatEndCount(10);
      });

      expect(result.current.repeatEndCount).toBe(10);
    });

    it('반복 횟수는 1 이상이어야 한다', () => {
      const { result } = renderHook(() => useRepeatEvent());

      act(() => {
        result.current.setRepeatEndType('count');
        result.current.setRepeatEndCount(0);
      });

      expect(result.current.repeatEndCount).toBe(1);
      expect(result.current.endCountError).toBe('반복 횟수는 1회 이상이어야 합니다');
    });

    it('종료일은 시작일 이후여야 한다', () => {
      const { result } = renderHook(() => useRepeatEvent());

      act(() => {
        result.current.setEventDate(new Date('2024-03-20'));
        result.current.setRepeatEndType('until');
        result.current.setRepeatEndDate('2024-03-19');
      });

      expect(result.current.endDateError).toBe('종료일은 시작일 이후여야 합니다');
    });
  });
});
