import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within, act, fireEvent } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { ReactElement } from 'react';
import { Mock } from 'vitest';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../__mocks__/handlersUtils';
import App from '../App';
import { server } from '../setupTests';
import { Event } from '../types';
import { desc } from 'framer-motion/client';
import { useEventForm } from '../hooks/useEventForm';

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

describe('반복 유형 선택', () => {
  it('일정 생성 또는 수정 시 반복 유형을 선택할 수 있다.', () => {
    const { user } = setup(<App />);
    user.click(screen.getByText('반복 일정'));

    // 반복 유형이 화면에 나타나는지 확인한다.
    expect(screen.getByText('반복 유형')).toBeInTheDocument();
  });

  it('일정 생성 시 매일 반복 유형을 선택할 수 있다.', async () => {
    const { user } = setup(<App />);
    user.click(screen.getByText('반복 일정'));

    const repeatTypeSelect = screen.getByLabelText('반복 유형');
    const dailyOption = screen.getByRole('option', { name: '매일' }) as HTMLOptionElement;

    await userEvent.selectOptions(repeatTypeSelect, 'daily');

    expect(dailyOption.selected).toBeTruthy();
  });

  it('일정 생성 시 매주 반복 유형을 선택할 수 있다.', async () => {
    const { user } = setup(<App />);
    user.click(screen.getByText('반복 일정'));

    const repeatTypeSelect = screen.getByLabelText('반복 유형');
    const weeklyOption = screen.getByRole('option', { name: '매주' }) as HTMLOptionElement;

    await userEvent.selectOptions(repeatTypeSelect, 'weekly');

    expect(weeklyOption.selected).toBeTruthy();
  });

  it('일정 생성 시 매월 반복 유형을 선택할 수 있다.', async () => {
    const { user } = setup(<App />);
    user.click(screen.getByText('반복 일정'));

    const repeatTypeSelect = screen.getByLabelText('반복 유형');
    const monthlyOption = screen.getByRole('option', { name: '매월' }) as HTMLOptionElement;

    await userEvent.selectOptions(repeatTypeSelect, 'monthly');

    expect(monthlyOption.selected).toBeTruthy();
  });
  it('일정 생성 시 매년 반복 유형을 선택할 수 있다.', async () => {
    const { user } = setup(<App />);
    user.click(screen.getByText('반복 일정'));

    const repeatTypeSelect = screen.getByLabelText('반복 유형');
    const yearlyOption = screen.getByRole('option', { name: '매년' }) as HTMLOptionElement;

    await userEvent.selectOptions(repeatTypeSelect, 'yearly');

    expect(yearlyOption.selected).toBeTruthy();
  });
});
describe('반복 간격 설정', () => {
  //각 반복 유형에 대해 간격을 설정할 수 있다.
  //예: 2일마다, 3주마다, 2개월마다 등

  it('매일 반복 시 간격을 설정할 수 있다.', async () => {
    const { user } = setup(<App />);
    user.click(screen.getByText('반복 일정'));

    const intervalInput = screen.getByLabelText('반복 간격');
    await user.type(intervalInput, '3');

    expect(intervalInput).toHaveValue(3);
  });
  it('간격 입력이 정수가 아니면 에러를 표시해야 한다', async () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    const { user } = setup(<App />);

    const repeatCheckbox = screen.getByLabelText('반복 일정');
    user.click(repeatCheckbox);

    const repeatIntervalInput = screen.getByLabelText('반복 간격');
    await user.type(repeatIntervalInput, '5.5');

    // 에러 메시지가 화면에 나타나는지 확인
    expect(screen.getByText('반복 주기는 정수로 입력해주세요.')).toBeInTheDocument();
  });
});
