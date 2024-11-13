import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OverlayProvider } from 'overlay-kit';
import { ReactElement } from 'react';

import { setupMockHandlerCreation } from '../../__mocks__/handlersUtils';
import App from '../../App';

const setup = (element: ReactElement) => {
  const user = userEvent.setup();

  return {
    ...render(
      <ChakraProvider>
        <OverlayProvider>{element}</OverlayProvider>
      </ChakraProvider>
    ),
    user,
  }; // ? Med: 왜 ChakraProvider로 감싸는지 물어보자
};

describe('반복일정과 캘린더', () => {
  it('반복일정 초기값을 캘린더에 반영한다.', async () => {
    setupMockHandlerCreation([
      {
        id: 'b31dbe29-0649-4f8f-aec3-a901cace80fa',
        title: '마틴 외데고르',
        date: '2024-11-21',
        startTime: '07:39',
        endTime: '19:39',
        description: '아스날',
        location: '런던',
        category: '업무',
        repeat: {
          type: 'weekly',
          interval: 1,
          endDate: '2024-12-07',
          id: 'eff7a9c5-3b19-4fd5-81d5-dd4c88869cac',
        },
        notificationTime: 10,
      },
      {
        id: '788ccf83-dcb4-4ee0-bb80-38a0c5d8b705',
        title: '마틴 외데고르',
        date: '2024-11-28',
        startTime: '07:39',
        endTime: '19:39',
        description: '아스날',
        location: '런던',
        category: '업무',
        repeat: {
          type: 'weekly',
          interval: 1,
          endDate: '2024-12-07',
          id: 'eff7a9c5-3b19-4fd5-81d5-dd4c88869cac',
        },
        notificationTime: 10,
      },
    ]);
    setup(<App />);

    const $calendar = within(screen.getByTestId('month-view'));
    expect($calendar.getAllByText(/마틴 외데고르/i)).toHaveLength(3);
  });
});
