import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { OverlayProvider } from 'overlay-kit';
import { ReactElement } from 'react';

import { setupMockHandlerCreation, setupMockHandlerUpdating } from '../../__mocks__/handlersUtils';
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

// 요구사항 3
describe('반복일정과 캘린더, 리스트', () => {
  it('저장된 반복일정을 캘린더, 리스트에 반영한다.', async () => {
    vi.setSystemTime(new Date('2024-11-15'));
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
    const $eventList = within(screen.getByTestId('event-list'));
    expect($calendar.getAllByText(/마틴 외데고르/i)).toHaveLength(3);
    expect($eventList.getAllByText(/마틴 외데고르/i)).toHaveLength(3);

    await user.click(screen.getByLabelText('Next'));

    expect($calendar.getAllByText(/마틴 외데고르/i)).toHaveLength(1);
    expect($eventList.getAllByText(/마틴 외데고르/i)).toHaveLength(1);
  });

  // 요구사항 3
  it('캘린더에 표시되는 일정 중 반복일정을 구분한다.', async () => {
    vi.setSystemTime(new Date('2024-11-15'));
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

  // 요구사항 5
  it('반복일정을 수정하면 그 반복일정은 메인일정이 된다.', async () => {
    vi.setSystemTime(new Date('2024-11-15'));

    setupMockHandlerUpdating([
      {
        id: '2ab06561-10f8-4e7f-8128-4b2dd343c6b9',
        title: '🔂마틴 외데고르',
        date: '2024-11-14',
        startTime: '07:39',
        endTime: '19:39',
        description: '아스날',
        location: '런던',
        category: '업무',
        repeat: { type: 'weekly', interval: 1, endDate: '2024-12-07', id: '1' },
        notificationTime: 10,
      },
    ]);
    const { user } = setup(<App />);

    const $eventList = within(screen.getByTestId('event-list'));

    expect(await $eventList.findByText(/🔂/i)).toBeInTheDocument();

    await user.click(await screen.findByLabelText('Edit event'));

    await user.clear(screen.getByLabelText('제목'));
    await user.type(screen.getByLabelText('제목'), '다비드 라야');
    await user.click(screen.getByLabelText('반복 일정'));

    expect(screen.getByLabelText('반복 일정')).not.toBeChecked();

    await user.click(screen.getByTestId('event-submit-button'));

    expect($eventList.getAllByText(/다비드 라야/i)).toHaveLength(1);
    expect($eventList.queryByText(/🔂/i)).not.toBeInTheDocument();
  });

  it('반복 유형을 주간으로 변경하면 요일 지정을 할 수 있다.', async () => {
    vi.setSystemTime(new Date('2024-11-15'));

    const { user } = setup(<App />);

    await user.selectOptions(screen.getByLabelText('반복 유형'), 'weekly');

    expect(await screen.findByText(/요일 지정/i)).toBeInTheDocument();
  });
});
