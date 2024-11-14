import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { ReactElement } from 'react';

import { setupMockHandlerCreation, setupMockHandlerUpdating } from '../__mocks__/handlersUtils';
import App from '../App';
import { server } from '../setupTests';
import { Event } from '../types';

const setup = (element: ReactElement) => {
  const user = userEvent.setup();

  return { ...render(<ChakraProvider>{element}</ChakraProvider>), user }; // ? Med: 왜 ChakraProvider로 감싸는지 물어보자
};

describe('일정 CRUD 및 기본 기능', () => {
  it('일정 생성 또는 수정 시 반복 유형을 선택할 수 있다.', async () => {
    setupMockHandlerCreation();
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

  it('반복 유형을 매일로 선택하면 반복 유형이 매일로 업데이트되어야 한다.', async () => {
    const { user } = setup(<App />);
    setupMockHandlerUpdating();

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

describe('반복 간격 설정', () => {
  it('반복 간격을 숫자로 입력할 수 있다', async () => {
    const { user } = setup(<App />);
    const repeatCheckbox = screen.getByLabelText('반복 일정');

    user.click(repeatCheckbox);

    const repeatIntervalInput = screen.getByLabelText('반복 간격');
    await user.type(repeatIntervalInput, '3');

    expect(repeatIntervalInput).toHaveValue(3);
  });
});

describe('반복 일정 표시', () => {
  it('반복 일정이 있는 경우에만 반복 아이콘이 표시되어야 한다.', async () => {
    setupMockHandlerCreation();
    setup(<App />);

    const eventList = within(screen.getByTestId('event-list'));

    expect(eventList.queryByTestId('repeat-icon')).not.toBeInTheDocument();
  });
});

describe('반복 종료', () => {
  it('반복 일정 설정 시, 반복 종료일 날짜 입력 필드가 표시되어야 한다', () => {
    const { user } = setup(<App />);
    const repeatCheckbox = screen.getByLabelText('반복 일정');
    user.click(repeatCheckbox);

    const endConditionDateInput = screen.getByLabelText('반복 종료일');

    expect(endConditionDateInput).toBeInTheDocument();
  });

  it('반복 일정 설정 시, 간격 입력 필드가 표시되어야 한다', () => {
    const { user } = setup(<App />);
    const repeatCheckbox = screen.getByLabelText('반복 일정');
    user.click(repeatCheckbox);

    const endConditionCountInput = screen.getByLabelText('반복 간격');

    expect(endConditionCountInput).toBeInTheDocument();
  });
});

describe('반복 일정 단일 수정', () => {
  beforeEach(() => {
    setupMockHandlerUpdating();
  });

  it('반복 일정을 수정하면 단일 일정으로 변경되고 아이콘이 사라져야 한다', async () => {
    const mockEvents: Event[] = [
      {
        id: '1',
        title: '팀 회의',
        date: '2024-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'weekly', interval: 1 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '팀 회의',
        date: '2024-10-22',
        startTime: '09:00',
        endTime: '10:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'weekly', interval: 1 },
        notificationTime: 10,
      },
    ];
    setupMockHandlerCreation(mockEvents);

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: mockEvents });
      }),
      http.put('/api/events/:id', async ({ params, request }) => {
        const { id } = params;
        const updatedEvent = (await request.json()) as Event;
        const index = mockEvents.findIndex((event) => event.id === id);

        mockEvents[index] = { ...mockEvents[index], ...updatedEvent };
        return HttpResponse.json(mockEvents[index]);
      })
    );

    const { user } = setup(<App />);

    const eventList = screen.getByTestId('event-list');

    const repeatIcon = within(eventList).queryByTestId('repeat-icon');

    expect(repeatIcon).not.toBeInTheDocument();

    const editButton = (await screen.findAllByLabelText('Edit event'))[0];
    await user.click(editButton);

    await user.clear(screen.getByLabelText('제목'));
    await user.type(screen.getByLabelText('제목'), '제목 수정');
    await user.clear(screen.getByLabelText('설명'));
    await user.type(screen.getByLabelText('설명'), '설명 수정');

    await user.click(screen.getByTestId('event-submit-button'));
    screen.debug(eventList);
    expect(within(eventList).getByText('제목 수정')).toBeInTheDocument();
    expect(within(eventList).getByText('설명 수정')).toBeInTheDocument();

    expect(repeatIcon).not.toBeInTheDocument();
  });

  test('반복 일정을 수정할 수 있고 수정하면 단일 일정으로 변경된다', async () => {
    const { user } = setup(<App />);

    const editButtons = await screen.findAllByLabelText('Edit event');
    await user.click(editButtons[0]);

    await user.clear(screen.getByLabelText('제목'));
    await user.type(screen.getByLabelText('제목'), '수정된 회의');

    await user.click(screen.getByLabelText('반복 설정'));

    await user.click(screen.getByTestId('event-submit-button'));

    const eventList = await screen.findByTestId('event-list');
    const updatedEvent = await within(eventList).findByText('수정된 회의');
    expect(updatedEvent).toBeInTheDocument();

    const repeatIcon = within(updatedEvent.closest('div') as HTMLElement).queryByTestId(
      'repeat-icon'
    );
    expect(repeatIcon).not.toBeInTheDocument();
  });
});

describe('반복 일정 단일 삭제', () => {
  it('반복 일정을 단일 삭제하면 해당 일정만 삭제되어야 한다', async () => {
    const mockEvents: Event[] = [
      {
        id: '1',
        title: '팀 회의',
        date: '2024-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'weekly', interval: 1 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '팀 회의',
        date: '2024-10-22',
        startTime: '09:00',
        endTime: '10:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'weekly', interval: 1 },
        notificationTime: 10,
      },
    ];
    setupMockHandlerCreation(mockEvents);

    const { user } = setup(<App />);

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: mockEvents });
      }),
      http.delete('/api/events/:id', ({ params }) => {
        const { id } = params;
        const index = mockEvents.findIndex((event) => event.id === id);

        mockEvents.splice(index, 1);
        return new HttpResponse(null, { status: 204 });
      })
    );

    const allDeleteButtons = await screen.findAllByLabelText('Delete event');
    await user.click(allDeleteButtons[0]);
    const eventList = within(screen.getByTestId('event-list'));

    expect(eventList.getByText('팀 회의')).toBeInTheDocument();

    expect(eventList.queryByText('2024-10-15')).not.toBeInTheDocument();

    expect(eventList.getByText('2024-10-22')).toBeInTheDocument();
  });
});
