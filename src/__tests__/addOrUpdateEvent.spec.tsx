import { render, screen, waitFor } from '@testing-library/react';
import { expect, vi } from 'vitest';
import App from '../App';

import { UserEvent, userEvent } from '@testing-library/user-event';
import { ChakraProvider } from '@chakra-ui/react';

let user: UserEvent;

beforeEach(() => {
  user = userEvent.setup();
});

describe('App - addOrUpdateEvent', () => {
  it('매월 반복 일정이 설정된 경우 12개의 이벤트가 생성된다', async () => {
    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    const eventList = screen.getByTestId('event-list');

    await waitFor(() => {
      expect(eventList.children.length).toBe(2);
    });

    await userEvent.type(screen.getByLabelText('제목'), '매월 반복 이벤트');
    await userEvent.type(screen.getByLabelText('날짜'), '2024-01-01');
    await userEvent.type(screen.getByLabelText('시작 시간'), '10:00');
    await userEvent.type(screen.getByLabelText('종료 시간'), '11:00');

    await userEvent.selectOptions(screen.getByLabelText('반복 유형'), 'monthly');
    await userEvent.type(screen.getByLabelText('반복 간격'), '1');
    await userEvent.type(screen.getByLabelText('반복 종료일'), '2024-12-01');

    const submitButton = screen.getByTestId('event-submit-button');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(eventList.children.length).toBe(12);
    });
  });
});
