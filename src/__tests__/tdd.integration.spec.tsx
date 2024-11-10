import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within, act, fireEvent } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { ReactElement } from 'react';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../__mocks__/handlersUtils';
import App from '../App';
import { server } from '../setupTests';
import { Event } from '../types';

// ! Hard 여기 제공 안함
const setup = (element: ReactElement) => {
  const user = userEvent.setup();

  return { ...render(<ChakraProvider>{element}</ChakraProvider>), user }; // ? Med: 왜 ChakraProvider로 감싸는지 물어보자
};

// ! Hard 여기 제공 안함
const saveSchedule = async (
  user: UserEvent,
  form: Omit<Event, 'id' | 'notificationTime' | 'repeat'>
) => {
  const { title, date, startTime, endTime, location, description, category } = form;

  await user.click(screen.getAllByText('일정 추가')[0]);

  await user.type(screen.getByLabelText('제목'), title);
  await user.type(screen.getByLabelText('날짜'), date);
  await user.type(screen.getByLabelText('시작 시간'), startTime);
  await user.type(screen.getByLabelText('종료 시간'), endTime);
  await user.type(screen.getByLabelText('설명'), description);
  await user.type(screen.getByLabelText('위치'), location);
  await user.selectOptions(screen.getByLabelText('카테고리'), category);

  await user.click(screen.getByTestId('event-submit-button'));
};
// 1. 반복 유형 선택
describe('반복 유형 선택', () => {
  it('반복 유형 옵션이 올바르게 렌더링되어야 한다', () => {
    const { user } = setup(<App />);
    const repeatCheckbox = screen.getByLabelText('반복 설정');
    user.click(repeatCheckbox);

    const repeatTypeSelect = screen.getByLabelText('반복 유형');
    expect(repeatTypeSelect).toBeInTheDocument();

    expect(screen.getByText('매일')).toBeInTheDocument();
    expect(screen.getByText('매주')).toBeInTheDocument();
    expect(screen.getByText('매월')).toBeInTheDocument();
    expect(screen.getByText('매년')).toBeInTheDocument();
  });

  it('사용자가 반복 유형으로 "매주"를 선택하면 반복 유형이 "매주"로 업데이트되어야 한다', async () => {
    const { user } = setup(<App />);
    const repeatCheckbox = screen.getByLabelText('반복 설정');
    user.click(repeatCheckbox);

    const repeatTypeSelect = screen.getByLabelText('반복 유형');
    const defaultOption = screen.getByRole('option', { name: '매일' }) as HTMLOptionElement;
    const selectedOption = screen.getByRole('option', { name: '매주' }) as HTMLOptionElement;

    await userEvent.selectOptions(repeatTypeSelect, 'weekly');

    expect(defaultOption.selected).toBeFalsy();
    expect(selectedOption.selected).toBeTruthy();
  });
});
