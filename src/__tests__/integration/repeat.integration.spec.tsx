import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { OverlayProvider } from 'overlay-kit';
import { ReactElement } from 'react';

import { setupMockHandlerCreation } from '../../__mocks__/handlersUtils';
import App from '../../App';
import { Event } from '../../types';

const setup = (element: ReactElement) => {
  const user = userEvent.setup();

  return {
    ...render(
      <ChakraProvider>
        <OverlayProvider>{element}</OverlayProvider>
      </ChakraProvider>
    ),
    user,
  };
};

const saveSchedule = async (user: UserEvent, form: Omit<Event, 'id' | 'notificationTime'>) => {
  const { title, date, startTime, endTime, location, description, category, repeat } = form;

  await user.click(screen.getAllByText('일정 추가')[0]);

  await user.type(screen.getByLabelText('제목'), title);
  await user.type(screen.getByLabelText('날짜'), date);
  await user.type(screen.getByLabelText('시작 시간'), startTime);
  await user.type(screen.getByLabelText('종료 시간'), endTime);
  await user.type(screen.getByLabelText('설명'), description);
  await user.type(screen.getByLabelText('위치'), location);
  await user.selectOptions(screen.getByLabelText('카테고리'), category);
  await user.selectOptions(screen.getByLabelText('반복 유형'), repeat.type);
  await user.clear(screen.getByLabelText('반복 간격'));
  await user.type(screen.getByLabelText('반복 간격'), repeat.interval.toString());
  await user.type(screen.getByLabelText('반복 종료일'), repeat.endDate as string);
  await user.click(screen.getByTestId('event-submit-button'));
};

describe('반복일정과 캘린더', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2024-11-15'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('저장된 반복일정을 캘린더에 반영한다.', async () => {
    setupMockHandlerCreation();

    const { user } = setup(<App />);

    await saveSchedule(user, {
      title: '마틴 외데고르',
      date: '2024-11-14',
      startTime: '07:39',
      endTime: '19:39',
      description: '아스날',
      location: '런던',
      category: '업무',
      repeat: { type: 'weekly', interval: 1, endDate: '2024-12-07' },
    });

    const $calendar = within(screen.getByTestId('month-view'));
    expect($calendar.getAllByText(/마틴 외데고르/i)).toHaveLength(3);

    await user.click(screen.getByLabelText('Next'));

    expect($calendar.getAllByText(/마틴 외데고르/i)).toHaveLength(1);
  });

  it('캘린더에 표시되는 일정 중 반복일정을 구분한다.', async () => {
    setupMockHandlerCreation();

    const { user } = setup(<App />);

    await saveSchedule(user, {
      title: '마틴 외데고르',
      date: '2024-11-14',
      startTime: '07:39',
      endTime: '19:39',
      description: '아스날',
      location: '런던',
      category: '업무',
      repeat: { type: 'weekly', interval: 1, endDate: '2024-12-07' },
    });

    const $calendar = within(screen.getByTestId('month-view'));
    expect($calendar.getAllByText(/마틴 외데고르/i)).toHaveLength(3);

    // 반복일정을 표시하는 유니코드
    expect($calendar.getAllByText(/🔂/i)).toHaveLength(2);
  });
});
