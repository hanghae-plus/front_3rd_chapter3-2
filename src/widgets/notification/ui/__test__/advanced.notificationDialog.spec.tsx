import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, fireEvent } from '@testing-library/react';
import { NotificationDialog } from '@widgets/notification/ui';
import { describe, it, expect, vi } from 'vitest';

describe('NotificationDialog', () => {
  const mockNotifications = [
    { id: '1', message: '첫 번째 알림' },
    { id: '2', message: '두 번째 알림' },
  ];

  it('알림이 없을 때는 아무것도 렌더링하지 않음', () => {
    const { container } = render(
      <ChakraProvider>
        <NotificationDialog notifications={[]} setNotifications={() => {}} />
      </ChakraProvider>
    );

    expect(container.firstChild).toBeEmptyDOMElement();
  });

  it('알림 목록이 올바르게 렌더링됨', () => {
    render(
      <ChakraProvider>
        <NotificationDialog notifications={mockNotifications} setNotifications={() => {}} />
      </ChakraProvider>
    );

    expect(screen.getByText('첫 번째 알림')).toBeDefined();
    expect(screen.getByText('두 번째 알림')).toBeDefined();
    expect(screen.getAllByRole('alert')).toHaveLength(2);
  });

  it('닫기 버튼 클릭 시 해당 알림이 제거됨', () => {
    const mockSetNotifications = vi.fn();

    render(
      <ChakraProvider>
        <NotificationDialog
          notifications={mockNotifications}
          setNotifications={mockSetNotifications}
        />
      </ChakraProvider>
    );

    // 첫 번째 알림의 닫기 버튼 클릭
    const closeButtons = screen.getAllByRole('button');
    fireEvent.click(closeButtons[0]);

    // setNotifications가 올바른 배열과 함께 호출되었는지 확인
    expect(mockSetNotifications).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ id: '2', message: '두 번째 알림' })])
    );
  });

  it('여러 알림이 모두 Alert 컴포넌트로 렌더링됨', () => {
    const longNotifications = [
      { id: '1', message: '알림 1' },
      { id: '2', message: '알림 2' },
      { id: '3', message: '알림 3' },
    ];

    render(
      <ChakraProvider>
        <NotificationDialog notifications={longNotifications} setNotifications={() => {}} />
      </ChakraProvider>
    );

    const alerts = screen.getAllByRole('alert');
    expect(alerts).toHaveLength(3);
  });
});
