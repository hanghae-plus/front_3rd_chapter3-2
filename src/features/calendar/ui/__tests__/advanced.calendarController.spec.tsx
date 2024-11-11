import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { CalenderController } from '../CalenderController';

describe('CalenderController', () => {
  const defaultProps = {
    view: 'week' as const,
    setView: vi.fn(),
    navigate: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('컴포넌트가 정상적으로 렌더링됨', () => {
    render(
      <ChakraProvider>
        <CalenderController {...defaultProps} />
      </ChakraProvider>
    );

    expect(screen.getByLabelText('Previous')).toBeInTheDocument();
    expect(screen.getByLabelText('Next')).toBeInTheDocument();
    expect(screen.getByLabelText('view')).toBeInTheDocument();
  });

  it('이전/다음 버튼 클릭이 정상적으로 동작함', () => {
    const mockNavigate = vi.fn();

    render(
      <ChakraProvider>
        <CalenderController {...defaultProps} navigate={mockNavigate} />
      </ChakraProvider>
    );

    // 이전 버튼 테스트
    fireEvent.click(screen.getByLabelText('Previous'));
    expect(mockNavigate).toHaveBeenCalledWith('prev');

    // 다음 버튼 테스트
    fireEvent.click(screen.getByLabelText('Next'));
    expect(mockNavigate).toHaveBeenCalledWith('next');
  });

  it('view 선택이 정상적으로 동작함', () => {
    const mockSetView = vi.fn();

    render(
      <ChakraProvider>
        <CalenderController {...defaultProps} setView={mockSetView} />
      </ChakraProvider>
    );

    const select = screen.getByLabelText('view') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'month' } });

    expect(mockSetView).toHaveBeenCalledWith('month');
  });

  it('현재 선택된 view가 올바르게 표시됨', () => {
    render(
      <ChakraProvider>
        <CalenderController {...defaultProps} view="month" />
      </ChakraProvider>
    );

    const select = screen.getByLabelText('view') as HTMLSelectElement;
    expect(select.value).toBe('month');
  });

  it('select 옵션이 올바르게 렌더링됨', () => {
    render(
      <ChakraProvider>
        <CalenderController {...defaultProps} />
      </ChakraProvider>
    );

    const weekOption = screen.getByRole('option', { name: 'Week' });
    const monthOption = screen.getByRole('option', { name: 'Month' });

    expect(weekOption).toBeInTheDocument();
    expect(monthOption).toBeInTheDocument();
    expect(weekOption).toHaveValue('week');
    expect(monthOption).toHaveValue('month');
  });

  it('HStack이 올바른 스타일로 렌더링됨', () => {
    const { container } = render(
      <ChakraProvider>
        <CalenderController {...defaultProps} />
      </ChakraProvider>
    );

    const hstack = container.firstChild;
    expect(hstack).toHaveStyle({
      justifyContent: 'space-between',
    });
  });
});
