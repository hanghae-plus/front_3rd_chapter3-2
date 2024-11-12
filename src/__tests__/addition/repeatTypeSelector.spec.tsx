import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

describe('RepeatTypeSelector', () => {
  test('반복 유형 선택 UI가 제대로 렌더링되어야 한다', () => {
    render(
      <RepeatTypeSelector
        type="none"
        onTypeChange={() => {}}
        interval={1}
        onIntervalChange={() => {}}
        endDate=""
        onEndDateChange={() => {}}
      />
    );

    expect(screen.getByLabelText('반복 유형')).toBeInTheDocument();
    expect(screen.getByLabelText('반복 간격')).toBeInTheDocument();
    expect(screen.getByLabelText('반복 종료일')).toBeInTheDocument();
  });

  test('모든 반복 유형이 선택 가능해야 한다', () => {
    render(
      <RepeatTypeSelector
        type="none"
        onTypeChange={() => {}}
        interval={1}
        onIntervalChange={() => {}}
        endDate=""
        onEndDateChange={() => {}}
      />
    );

    const select = screen.getByLabelText('반복 유형');
    expect(select).toHaveOption('매일');
    expect(select).toHaveOption('매주');
    expect(select).toHaveOption('매월');
    expect(select).toHaveOption('매년');
  });

  test('반복 유형이 변경되면 callback이 호출되어야 한다', () => {
    const handleTypeChange = vi.fn();
    render(
      <RepeatTypeSelector
        type="none"
        onTypeChange={handleTypeChange}
        interval={1}
        onIntervalChange={() => {}}
        endDate=""
        onEndDateChange={() => {}}
      />
    );

    fireEvent.change(screen.getByLabelText('반복 유형'), {
      target: { value: 'daily' },
    });

    expect(handleTypeChange).toHaveBeenCalledWith('daily');
  });

  test('윤년이나 31일의 반복 일정 설정 시 적절한 메시지가 표시되어야 한다', () => {
    render(
      <RepeatTypeSelector
        type="monthly"
        onTypeChange={() => {}}
        interval={1}
        onIntervalChange={() => {}}
        endDate=""
        onEndDateChange={() => {}}
        date="2024-02-29" // 윤년 날짜
      />
    );

    expect(screen.getByText(/다음 반복일은.*2024-03-29/)).toBeInTheDocument();
  });
});
