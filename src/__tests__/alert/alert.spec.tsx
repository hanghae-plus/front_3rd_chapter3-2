import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import { setupMockHandlerCreation } from '../../__mocks__/handlersUtils';
import App from '../../App';
import { Event } from '../../entities/event/model/types';
import { server } from '../../setupTests';

vi.mock(import('@chakra-ui/react'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
  };
});

const renderApp = () => {
  return render(
    <ChakraProvider>
      <App />
    </ChakraProvider>
  );
};

describe('반복 간격 설정', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2024-10-01'));
  });

  it('일정 생성 시 반복 설정을 할 수 있다.', async () => {
    renderApp();

    const repeatCheckbox = screen.getByRole('checkbox', { name: /반복 설정/i });
    expect(repeatCheckbox).toBeInTheDocument();

    // 체크박스 클릭
    await userEvent.click(repeatCheckbox);

    const repeatTypeSelect = screen.getByRole('combobox', { name: /반복 유형/i });

    await userEvent.selectOptions(repeatTypeSelect, '매주');
    expect(repeatTypeSelect).toHaveValue('weekly');

    await userEvent.selectOptions(repeatTypeSelect, '매월');
    expect(repeatTypeSelect).toHaveValue('monthly');

    await userEvent.selectOptions(repeatTypeSelect, '매년');
    expect(repeatTypeSelect).toHaveValue('yearly');

    await userEvent.selectOptions(repeatTypeSelect, '매일');
    expect(repeatTypeSelect).toHaveValue('daily');
  });

  it('각 반복 유형에 대해 간격을 설정할 수 있다.', async () => {
    renderApp();

    const repeatCheckbox = screen.getByRole('checkbox', { name: /반복 설정/i });
    expect(repeatCheckbox).toBeInTheDocument();

    await userEvent.click(repeatCheckbox);

    const repeatIntervalInput = screen.getByLabelText('반복 간격') as HTMLInputElement;
    expect(repeatIntervalInput).toBeInTheDocument();

    await userEvent.type(repeatIntervalInput, '{Backspace}2');

    const repeatTypeSelect = screen.getByRole('combobox', { name: /반복 유형/i });
    await userEvent.selectOptions(repeatTypeSelect, '매주');

    expect(repeatIntervalInput).toHaveValue(2);
  });

  it('반복 유형에 대해 간격을 설정하고 저장하면 해당 간격이 리스트에 표시된다.', async () => {
    setupMockHandlerCreation();
    renderApp();

    await userEvent.type(screen.getByLabelText(/제목/), '회의 제목');
    await userEvent.type(screen.getByLabelText(/날짜/), '2024-11-10');
    await userEvent.type(screen.getByLabelText(/시작 시간/), '09:00');
    await userEvent.type(screen.getByLabelText(/종료 시간/), '10:00');
    await userEvent.type(screen.getByLabelText(/설명/), '회의 설명');
    await userEvent.type(screen.getByLabelText(/위치/), '회의실');
    await userEvent.selectOptions(screen.getByLabelText(/카테고리/), '업무');

    await userEvent.click(screen.getByRole('checkbox', { name: /반복 일정/ }));
    await userEvent.selectOptions(screen.getByLabelText(/반복 유형/), '매주');
    await userEvent.selectOptions(screen.getByLabelText(/종료 조건/), '날짜');
    await userEvent.type(screen.getByLabelText(/반복 간격/), '2');
    await userEvent.type(screen.getByLabelText(/종료 날짜/), '2024-12-10');

    await userEvent.click(screen.getByRole('button', { name: /추가/ }));

    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).getAllByText('회의 제목')).toHaveLength(1);
  });

  it('반복 일정 추가 시 캘린더에 반복 아이콘이 표시된다.', async () => {
    setupMockHandlerCreation();
    renderApp();

    await userEvent.type(screen.getByLabelText(/제목/), '회의 제목');
    await userEvent.type(screen.getByLabelText(/날짜/), '2024-11-10');
    await userEvent.type(screen.getByLabelText(/시작 시간/), '09:00');
    await userEvent.type(screen.getByLabelText(/종료 시간/), '10:00');
    await userEvent.type(screen.getByLabelText(/설명/), '회의 설명');
    await userEvent.type(screen.getByLabelText(/위치/), '회의실');
    await userEvent.selectOptions(screen.getByLabelText(/카테고리/), '업무');

    await userEvent.click(screen.getByRole('checkbox', { name: /반복 일정/ }));
    await userEvent.selectOptions(screen.getByLabelText(/반복 유형/), '매주');
    await userEvent.selectOptions(screen.getByLabelText(/종료 조건/), '날짜');
    await userEvent.type(screen.getByLabelText(/반복 간격/), '2');
    await userEvent.type(screen.getByLabelText(/종료 날짜/), '2024-12-10');

    await userEvent.click(screen.getByRole('button', { name: /추가/ }));

    const repeatIcon = screen.getByTestId('repeat-icon');
    expect(repeatIcon).toBeInTheDocument();
  });

  it('반복 종료 조건을 지정할 수 있다.', async () => {
    renderApp();

    const repeatCheckbox = screen.getByRole('checkbox', { name: /반복 설정/i });
    expect(repeatCheckbox).toBeInTheDocument();

    await userEvent.click(repeatCheckbox);

    const repeatEndConditionSelect = screen.getByRole('combobox', { name: /종료 조건/i });
    await userEvent.selectOptions(repeatEndConditionSelect, '날짜');

    expect(repeatEndConditionSelect).toHaveValue('date');
  });

  it('반복 일정을 수정하면 단일 일정으로 변경되어야 한다.', async () => {
    const mockEvents: Event[] = [
      {
        id: '1',
        title: '기존 회의',
        date: '2024-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        isRepeating: true,
        repeat: {
          type: 'daily',
          interval: 2,
          endCondition: 'never',
        },
        notificationTime: {
          value: 10,
          label: '10분 전',
        },
      },
      {
        id: '2',
        title: '기존 회의2',
        date: '2024-10-15',
        startTime: '11:00',
        endTime: '12:00',
        description: '기존 팀 미팅 2',
        location: '회의실 C',
        category: '업무 회의',
        isRepeating: false,
        repeat: {
          type: 'none',
          interval: 0,
          endCondition: 'never',
        },
        notificationTime: {
          value: 5,
          label: '5분 전',
        },
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
    renderApp();

    const eventList = await screen.findByTestId('event-list');

    const repeatIcon = await screen.findByTestId('repeat-icon');
    expect(repeatIcon).toBeInTheDocument();

    const editButtons = await within(eventList).findAllByTestId('edit-button');
    await userEvent.click(editButtons[0]);

    const repeatCheckbox = screen.getByRole('checkbox', { name: /반복 설정/i }) as HTMLInputElement;
    expect(repeatCheckbox.checked).toBe(true);

    await userEvent.click(repeatCheckbox);
    expect(repeatCheckbox.checked).toBe(false);

    await userEvent.click(screen.getByRole('button', { name: /수정/ }));

    const editSubmitButton = screen.getByRole('button', { name: /수정/ });
    await userEvent.click(editSubmitButton);

    expect(screen.queryByTestId('repeat-icon')).not.toBeInTheDocument();
  });

  it('반복 일정을 삭제하면 해당 일정만 삭제되어야 한다.', async () => {
    let mockEvents: Event[] = [
      {
        id: '1',
        title: '삭제할 이벤트',
        date: '2024-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '삭제할 이벤트입니다',
        location: '어딘가',
        category: '기타',
        isRepeating: true,
        repeat: {
          type: 'weekly',
          interval: 1,
          endCondition: 'date',
          endDate: '2024-12-10',
        },
        notificationTime: {
          value: 10,
          label: '10분 전',
        },
      },
      {
        id: '2',
        title: '그냥 이벤트',
        date: '2024-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '그냥 이벤트입니다',
        location: '어딘가',
        category: '기타',
        isRepeating: false,
        repeat: {
          type: 'none',
          interval: 0,
          endCondition: 'never',
        },
        notificationTime: {
          value: 10,
          label: '10분 전',
        },
      },
    ];

    // MSW handler 직접 설정
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: mockEvents });
      }),

      http.delete('/api/events/:id', async ({ params }) => {
        const { id } = params;
        mockEvents = mockEvents.filter((event) => event.id !== id);
        return new HttpResponse(null, { status: 204 });
      })
    );

    renderApp();

    // 초기 이벤트 목록 렌더링 확인
    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).getByText('삭제할 이벤트')).toBeInTheDocument();
    expect(within(eventList).getByText('그냥 이벤트')).toBeInTheDocument();

    // 첫 번째 이벤트의 삭제 버튼 찾기 및 클릭
    const deleteButtons = screen.getAllByTestId('delete-button');
    expect(deleteButtons).toHaveLength(2);
    await userEvent.click(deleteButtons[0]);
    // 최종 상태 확인
    expect(screen.queryByText('삭제할 이벤트')).not.toBeInTheDocument();
  });
});
