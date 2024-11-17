import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, vi } from 'vitest';

import { events } from '../../__mocks__/response/realEvents.json' assert { type: 'json' };
import '@testing-library/jest-dom';
import * as useNotificationsModule from '../../features/notification/model/useNotifications';
import NotificationMessage from '../../widgets/notification/ui/NotificationMessage.tsx';

const mockNotifications = [
  { id: '1', message: '이벤트 1이 곧 시작됩니다.' },
  { id: '2', message: '이벤트 2가 곧 시작됩니다.' },
];

const renderApp = () => {
  return render(
    <ChakraProvider>
      <NotificationMessage events={events} />
    </ChakraProvider>
  );
};

vi.mock('../../../features/notification/model/useNotifications.ts');
const mockSetNotifications = vi.fn();
const mockRemoveNotification = vi.fn();

describe('NotificationMessage', () => {
  beforeEach(() => {
    vi.spyOn(useNotificationsModule, 'useNotifications').mockReturnValue({
      notifications: mockNotifications,
      notifiedEvents: ['1'],
      setNotifications: mockSetNotifications,
      removeNotification: mockRemoveNotification,
    });

    renderApp();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('알림 메세지가 있으면 표시한다.', () => {
    mockNotifications.forEach((notification) => {
      expect(screen.getByText(notification.message)).toBeInTheDocument();
    });
  });

  it('닫기 버튼 클릭 시 알림이 제거된다', () => {
    const closeButtons = screen.getAllByRole('button', { name: /close/i });
    expect(closeButtons.length).toBe(mockNotifications.length);

    fireEvent.click(closeButtons[0]);

    waitFor(() => {
      expect(mockRemoveNotification).toHaveBeenCalledWith(0);
    });
  });
});
