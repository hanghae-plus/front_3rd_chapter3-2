import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { ReactElement } from 'react';
import { expect } from 'vitest';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils.ts';
import App from '../../App.tsx';
import { Event } from '../../types.ts';

const setup = (element: ReactElement) => {
  const user = userEvent.setup();

  return { ...render(<ChakraProvider>{element}</ChakraProvider>), user };
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
  await user.clear(screen.getByLabelText(/반복 간격/));
  await user.type(screen.getByLabelText(/반복 간격/), String(repeat.interval));
  await user.type(screen.getByLabelText(/반복 종료일/), String(repeat.endDate));

  await user.click(screen.getByTestId('event-submit-button'));
};

describe('반복 일정 등록/조회', () => {
  it('일정 반복 설정 시 필수 입력 필드들이 표출된다.', async () => {
    setupMockHandlerCreation();

    setup(<App />);

    const eventForm = screen.getByTestId('event-form');

    expect(within(eventForm).getByLabelText('반복 유형')).toBeInTheDocument();
    expect(within(eventForm).getByLabelText('반복 간격')).toBeInTheDocument();
    expect(within(eventForm).getByLabelText('반복 종료일')).toBeInTheDocument();
  });

  it('일정 반복 설정 해제 시 필수 입력 필드들이 사라진다.', async () => {
    const { user } = setup(<App />);

    await user.click(screen.getByRole('checkbox', { name: /반복 일정/ }));

    const eventForm = screen.getByTestId('event-form');

    expect(within(eventForm).queryByText(/반복 유형/)).not.toBeInTheDocument();
    expect(within(eventForm).queryByText(/반복 간격/)).not.toBeInTheDocument();
    expect(within(eventForm).queryByText(/반복 종료일/)).not.toBeInTheDocument();
  });

  it('반복 등록 시 일정 뷰에서 아이콘과 함께 표시된다.', async () => {
    setupMockHandlerCreation();

    const { user } = setup(<App />);

    await saveSchedule(user, {
      title: '반복할 일정',
      date: '2024-10-01',
      startTime: '10:00',
      endTime: '12:00',
      description: 'test',
      location: 'test',
      category: '업무',
      repeat: { type: 'weekly', interval: 1, endDate: '2024-10-30' },
    });

    const monthView = screen.getByTestId('month-view');
    expect(within(monthView).getAllByText(/반복할 일정/)).toHaveLength(5);
    expect(within(monthView).getAllByLabelText('Repeat Event')).toHaveLength(5);
  });
});

describe('반복 일정 수정/삭제', () => {
  it('반복 일정 설정 해제 시 단일 일정으로 수정되고 일정 뷰에서도 아이콘이 사라진다.', async () => {
    setupMockHandlerUpdating([
      {
        id: '1',
        title: '반복할 일정',
        date: '2024-10-01',
        startTime: '10:00',
        endTime: '12:00',
        description: 'test',
        location: 'test',
        category: '업무',
        repeat: { type: 'yearly', interval: 1, endDate: '2025-10-30' },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);

    const eventList = screen.getByTestId('event-list');
    const monthView = screen.getByTestId('month-view');

    expect(await within(monthView).findAllByLabelText('Repeat Event')).toHaveLength(1);

    await user.click(await within(eventList).findByLabelText('Edit event'));
    await user.click(screen.getByTestId('event-submit-button'));

    expect(within(monthView).queryByLabelText('Repeat Event')).not.toBeInTheDocument();
  });

  it('반복 일정 삭제 시 선택한 해당 일정만 삭제된다.', async () => {
    setupMockHandlerDeletion([
      {
        id: '1',
        title: '반복할 일정',
        date: '2024-10-01',
        startTime: '10:00',
        endTime: '12:00',
        description: 'test',
        location: 'test',
        category: '업무',
        repeat: { type: 'weekly', interval: 1, endDate: '2024-10-12' },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '반복할 일정',
        date: '2024-10-08',
        startTime: '10:00',
        endTime: '12:00',
        description: 'test',
        location: 'test',
        category: '업무',
        repeat: { type: 'weekly', interval: 1, endDate: '2024-10-12' },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);

    const monthView = screen.getByTestId('month-view');
    expect(await within(monthView).findAllByLabelText('Repeat Event')).toHaveLength(2);

    const allDeleteButton = await screen.findAllByLabelText('Delete event');
    await user.click(allDeleteButton[0]);

    expect(within(monthView).getAllByLabelText('Repeat Event')).toHaveLength(1);
  });
});
