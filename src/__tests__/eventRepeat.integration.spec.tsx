import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, waitFor, within } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { expect, vi } from 'vitest';

import {
  setupMockHandlerBatchCreation,
  setupMockHandlerBatchUpdating,
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../__mocks__/handlersUtils.ts';
import App from '../App.tsx';
import { Event, RepeatType } from '../entities/event/model/type.ts';
import { generateRecurringEvents } from '../features/calendar/lib/dateUtils.ts';

let user: UserEvent;

beforeEach(() => {
  user = userEvent.setup();
});

const mockToast = vi.fn();
vi.mock('@chakra-ui/react', async () => {
  const original = await vi.importActual('@chakra-ui/react');
  return {
    ...original,
    useToast: () => mockToast,
  };
});

describe('이벤트 > 반복과 관련된 통합테스트', () => {
  it('반복 유형 > 매달 31일에 이벤트가 있는 경우 31일이 없는 달은 30일로 변경된다.', async () => {
    vi.setSystemTime('2024-10-01');

    const result = generateRecurringEvents('2024-10-31', 1, 'monthly' as RepeatType, '2025-03-31');

    const eventData: Event = {
      id: '1',
      title: '31일 반복 이벤트',
      date: '2024-10-31',
      startTime: '21:25',
      endTime: '23:31',
      description: '',
      location: '',
      category: '',
      repeat: {
        type: 'monthly',
        interval: 1,
        endDate: '2025-03-31',
      },
      notificationTime: 10,
    };

    const recurringEvents = result.map((eventDate, index) => ({
      ...eventData,
      id: index.toString(),
      date: eventDate,
    }));

    setupMockHandlerBatchCreation(recurringEvents);

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    const nextButton = screen.getByLabelText(/Next/);
    const monthView = await screen.findByTestId('month-view');

    const thirtyFirst = screen.getByTestId('31');

    await waitFor(() => {
      expect(within(monthView).getByText('2024년 10월')).toBeInTheDocument();
      expect(within(thirtyFirst).findAllByText('31일 반복 이벤트')).toBeTruthy();
    });

    await user.click(nextButton);
    const thirtieth = screen.getByTestId('30');

    await waitFor(() => {
      expect(within(monthView).getByText('2024년 11월')).toBeInTheDocument();
      expect(within(thirtieth).findAllByText('31일 반복 이벤트')).toBeTruthy();
    });
  });

  it('반복 유형 > 윤년 2월 29일에 등록된 이벤트는 윤년이 아닌해에는 2월 28일에 등록된다.', async () => {
    vi.setSystemTime('2024-02-01');

    const result = generateRecurringEvents('2024-02-29', 1, 'yearly' as RepeatType, '2026-02-28');

    const eventData: Event = {
      id: '1',
      title: '매년 반복 2월 29일',
      date: '2024-02-29',
      startTime: '21:25',
      endTime: '23:31',
      description: '',
      location: '',
      category: '',
      repeat: {
        type: 'yearly',
        interval: 1,
        endDate: '2026-02-28',
      },
      notificationTime: 10,
    };

    const recurringEvents = result.map((eventDate, index) => ({
      ...eventData,
      id: index.toString(),
      date: eventDate,
    }));

    setupMockHandlerBatchCreation(recurringEvents);

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    const nextButton = screen.getByLabelText(/Next/);
    const monthView = await screen.findByTestId('month-view');

    const twentyNinth = screen.getByTestId('29');

    await waitFor(() => {
      expect(within(monthView).getByText('2024년 2월')).toBeInTheDocument();
      expect(within(twentyNinth).findAllByText('매년 반복 2월 29일')).toBeTruthy();
    });

    await user.click(nextButton);
    await user.click(nextButton);
    await user.click(nextButton);
    await user.click(nextButton);
    await user.click(nextButton);
    await user.click(nextButton);
    await user.click(nextButton);
    await user.click(nextButton);
    await user.click(nextButton);
    await user.click(nextButton);
    await user.click(nextButton);
    await user.click(nextButton);

    const twentyEighth = screen.getByTestId('28');

    await waitFor(() => {
      expect(within(monthView).getByText('2025년 2월')).toBeInTheDocument();
      expect(within(twentyEighth).findAllByText('매년 반복 2월 29일')).toBeTruthy();
    });
  });

  it('반복 간격 > 반복 간격을 0을 입력할 경우 1로 변경된다.', async () => {
    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    const checkbox = screen.getByLabelText('반복 일정');
    await userEvent.click(checkbox);

    await user.selectOptions(screen.getByLabelText('반복 유형'), 'daily');

    const repeatIntervalInput = screen.getByLabelText('반복 간격') as HTMLInputElement;

    await user.clear(screen.getByLabelText('반복 간격'));

    await waitFor(() => {
      expect(repeatIntervalInput.value).toBe('1');
    });
  });

  it('반복 간격 > 반복 유형을 daily, 반복 간격을 2로 설정할 경우 이벤트는 2일 간격으로 등록된다.', async () => {
    vi.setSystemTime('2024-11-01');

    const result = generateRecurringEvents('2024-11-01', 2, 'daily' as RepeatType, '2024-11-05');

    const eventData: Event = {
      id: '1',
      title: '2일 반복 이벤트',
      date: '2025-11-01',
      startTime: '21:25',
      endTime: '23:31',
      description: '',
      location: '',
      category: '',
      repeat: {
        type: 'daily',
        interval: 2,
        endDate: '2024-11-05',
      },
      notificationTime: 10,
    };

    const recurringEvents = result.map((eventDate, index) => ({
      ...eventData,
      id: index.toString(),
      date: eventDate,
    }));

    setupMockHandlerBatchCreation(recurringEvents);

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    const firstDay = await screen.getByTestId('1');
    const secondDay = await screen.getByTestId('2');
    const thirdDay = await screen.getByTestId('3');
    const fourthDay = await screen.getByTestId('4');
    const fifthDay = await screen.getByTestId('5');

    await waitFor(() => {
      expect(within(firstDay).getByText('2일 반복 이벤트')).toBeInTheDocument();
      expect(within(secondDay).queryByText('2일 반복 이벤트')).toBeNull();
      expect(within(thirdDay).queryByText('2일 반복 이벤트')).toBeInTheDocument();
      expect(within(fourthDay).queryByText('2일 반복 이벤트')).toBeNull();
      expect(within(fifthDay).queryByText('2일 반복 이벤트')).toBeInTheDocument();
    });
  });

  it('반복 일정 > 반복 일정이 설정된 경우 반복 일정이 endDate까지 생성된다.', async () => {
    vi.useFakeTimers();
    vi.setSystemTime('2024-11-01');

    const result = generateRecurringEvents('2024-11-01', 1, 'monthly' as RepeatType, '2025-02-01');

    const eventData: Event = {
      id: '1',
      title: '매월 반복 이벤트',
      date: '2025-11-01',
      startTime: '21:25',
      endTime: '23:31',
      description: '',
      location: '',
      category: '',
      repeat: {
        type: 'monthly',
        interval: 1,
        endDate: '2025-02-01',
      },
      notificationTime: 10,
    };

    const recurringEvents = result.map((eventDate, index) => ({
      ...eventData,
      id: index.toString(),
      date: eventDate,
    }));

    setupMockHandlerBatchCreation(recurringEvents);

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    const eventList = screen.getByTestId('event-list');

    await waitFor(() => {
      expect(within(eventList).getByText('검색 결과가 없습니다.')).toBeTruthy();
    });

    await user.type(screen.getByLabelText('제목'), '매월 반복 이벤트');
    await user.type(screen.getByLabelText('날짜'), '2024-11-01');
    await user.type(screen.getByLabelText('시작 시간'), '10:00');
    await user.type(screen.getByLabelText('종료 시간'), '11:00');

    const checkbox = screen.getByLabelText('반복 일정') as HTMLInputElement;
    await userEvent.click(checkbox);

    await user.selectOptions(screen.getByLabelText('반복 유형'), 'monthly');
    await user.type(screen.getByLabelText('반복 간격'), '1');
    await user.type(screen.getByLabelText('반복 종료일'), '2025-12-01');

    await user.click(screen.getByRole('button', { name: /일정 추가/ }));

    const nextButton = screen.getByLabelText(/Next/);
    const monthView = await screen.findByTestId('month-view');

    await waitFor(() => {
      expect(within(monthView).getByText('2024년 11월')).toBeInTheDocument();
      expect(within(monthView).findAllByText('매월 반복 이벤트')).toBeTruthy();

      const atSignIcons = within(eventList).getAllByLabelText('at-sign-icon');
      expect(atSignIcons.length).toBeGreaterThan(0);
    });

    await user.click(nextButton);

    await waitFor(() => {
      expect(within(monthView).getByText('2024년 12월')).toBeInTheDocument();
      expect(within(monthView).findAllByText('매월 반복 이벤트')).toBeTruthy();

      const atSignIcons = within(eventList).getAllByLabelText('at-sign-icon');
      expect(atSignIcons.length).toBeGreaterThan(0);
    });

    await user.click(nextButton);

    await waitFor(() => {
      expect(within(monthView).getByText('2025년 1월')).toBeInTheDocument();
      expect(within(monthView).findAllByText('매월 반복 이벤트')).toBeTruthy();

      const atSignIcons = within(eventList).getAllByLabelText('at-sign-icon');
      expect(atSignIcons.length).toBeGreaterThan(0);
    });

    await user.click(nextButton);

    await waitFor(() => {
      expect(within(monthView).getByText('2025년 2월')).toBeInTheDocument();

      const atSignIcons = within(eventList).getAllByLabelText('at-sign-icon');
      expect(atSignIcons.length).toBeGreaterThan(0);
    });

    vi.useRealTimers();
  });

  it('반복 일정 > 반복 일정 등록 시 endDate를 설정하지 않으면 2025년 6월 30일이 endDate이다.', async () => {
    vi.setSystemTime('2024-11-01');

    const result = generateRecurringEvents('2024-11-01', 1, 'monthly' as RepeatType, '2025-02-01');

    const eventData: Event = {
      id: '1',
      title: '매월 반복 이벤트',
      date: '2025-11-01',
      startTime: '21:25',
      endTime: '23:31',
      description: '',
      location: '',
      category: '',
      repeat: {
        type: 'monthly',
        interval: 1,
        endDate: '',
      },
      notificationTime: 10,
    };

    const recurringEvents = result.map((eventDate, index) => ({
      ...eventData,
      id: index.toString(),
      date: eventDate,
    }));

    setupMockHandlerBatchCreation(recurringEvents);

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    const monthView = await screen.findByTestId('month-view');
    const nextButton = screen.getByLabelText(/Next/);

    await user.click(nextButton);
    await user.click(nextButton);
    await user.click(nextButton);
    await user.click(nextButton);
    await user.click(nextButton);
    await user.click(nextButton);
    await user.click(nextButton);

    await waitFor(() => {
      expect(within(monthView).getByText('2025년 6월')).toBeInTheDocument();
      expect(screen.getByText('매월 반복 이벤트')).toBeInTheDocument();
    });

    await user.click(nextButton);

    await waitFor(() => {
      expect(within(monthView).getByText('2025년 7월')).toBeInTheDocument();
      expect(within(monthView).queryAllByText('매월 반복 이벤트')).toHaveLength(0);
    });
  });

  it('반복 일정 > 반복 일정에는 at sign icon을 arai label로 가진 아이콘이 존재한다.', async () => {
    vi.setSystemTime('2024-11-01');

    const result = generateRecurringEvents('2024-11-01', 1, 'monthly' as RepeatType, '2025-02-01');

    const eventData: Event = {
      id: '1',
      title: '매월 반복 이벤트',
      date: '2025-11-01',
      startTime: '21:25',
      endTime: '23:31',
      description: '',
      location: '',
      category: '',
      repeat: {
        type: 'monthly',
        interval: 1,
        endDate: '',
      },
      notificationTime: 10,
    };

    const recurringEvents = result.map((eventDate, index) => ({
      ...eventData,
      id: index.toString(),
      date: eventDate,
    }));

    const noRepeatEvent: Event = {
      id: '1',
      title: '단일 일정 이벤트',
      date: '2025-11-03',
      startTime: '21:25',
      endTime: '23:31',
      description: '',
      location: '',
      category: '',
      repeat: {
        type: 'none',
        interval: 1,
        endDate: '',
      },
      notificationTime: 10,
    };
    setupMockHandlerCreation([noRepeatEvent]);
    setupMockHandlerBatchCreation(recurringEvents);

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    const firstDay = await screen.findByTestId('1');
    const thirdDay = await screen.findByTestId('3');

    expect(within(firstDay).getByLabelText('at-sign-icon')).toBeInTheDocument();
    expect(within(thirdDay).queryByRole('img')).toBeNull();
  });

  it('반복 종료 > 반복 종료일이 시작일보다 이전인 경우 오류 메시지가 표시된다.', async () => {
    vi.setSystemTime('2024-11-01');

    const result = generateRecurringEvents('2024-11-01', 1, 'monthly' as RepeatType, '2025-02-01');

    const eventData: Event = {
      id: '1',
      title: '반복 종료일이 시작일보다 이전인 이벤트',
      date: '2025-11-01',
      startTime: '21:25',
      endTime: '23:31',
      description: '',
      location: '',
      category: '',
      repeat: {
        type: 'monthly',
        interval: 1,
        endDate: '2025-10-01',
      },
      notificationTime: 10,
    };

    const recurringEvents = result.map((eventDate, index) => ({
      ...eventData,
      id: index.toString(),
      date: eventDate,
    }));

    setupMockHandlerBatchCreation(recurringEvents);

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    await user.type(screen.getByLabelText('제목'), '매월 반복 이벤트');
    await user.type(screen.getByLabelText('날짜'), '2024-11-01');
    await user.type(screen.getByLabelText('시작 시간'), '10:00');
    await user.type(screen.getByLabelText('종료 시간'), '11:00');

    const checkbox = screen.getByLabelText('반복 일정') as HTMLInputElement;
    await userEvent.click(checkbox);

    await user.selectOptions(screen.getByLabelText('반복 유형'), 'monthly');
    await user.type(screen.getByLabelText('반복 간격'), '1');
    await user.type(screen.getByLabelText('반복 종료일'), '2024-10-01');

    await user.click(screen.getByRole('button', { name: /일정 추가/ }));

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '반복 종료일이 일정 시작일보다 늦어야 합니다.',
        status: 'error',
      })
    );
  });

  it('반복 일정 단일 수정 > 반복 일정을 수정하면 단일 일정으로 변경되며 반복 일정 아이콘도 사라진다.', async () => {
    vi.setSystemTime(new Date('2024-11-01'));

    const recurringDates = generateRecurringEvents(
      '2024-11-01',
      1,
      'weekly' as RepeatType,
      '2025-11-14'
    );

    const eventData = {
      title: '매월 반복 이벤트',
      date: '2024-11-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '테스트 설명',
      location: '테스트 위치',
      category: '카테고리',
      repeat: {
        type: 'weekly',
        interval: 1,
        endDate: '2025-11-14',
      },
      notificationTime: 10,
    };

    const recurringEvents: Event[] = recurringDates.map((date, index) => ({
      ...eventData,
      id: index.toString(),
      date,
    }));

    setupMockHandlerBatchCreation(recurringEvents);
    setupMockHandlerBatchUpdating(recurringEvents);
    setupMockHandlerCreation(recurringEvents);
    setupMockHandlerUpdating(recurringEvents);

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    const editButton = await screen.findAllByRole('button', { name: /Edit event/i });
    await user.click(editButton[0]);

    await user.clear(screen.getByLabelText('제목'));
    await user.type(screen.getByLabelText('제목'), '단일 일정 이벤트');
    await user.clear(screen.getByLabelText('날짜'));
    await user.type(screen.getByLabelText('날짜'), '2024-11-03');
    await user.clear(screen.getByLabelText('시작 시간'));
    await user.type(screen.getByLabelText('시작 시간'), '10:00');
    await user.clear(screen.getByLabelText('종료 시간'));
    await user.type(screen.getByLabelText('종료 시간'), '11:00');

    const saveButton = screen.getByRole('button', { name: /일정 수정/ });

    const thirdDay = await screen.findByTestId('3');

    await user.click(saveButton);

    await waitFor(() => {
      expect(within(thirdDay).queryByRole('img')).toBeNull();
      expect(within(thirdDay).getByText('단일 일정 이벤트')).toBeInTheDocument();
    });

    vi.useRealTimers();
  });

  it('반복 일정 단일 삭제 > 매월 반복 일정 중 한개를 삭제할 경우 해당 일정만 삭제된다.', async () => {
    vi.setSystemTime('2024-11-01');

    const result = generateRecurringEvents('2024-11-01', 1, 'daily' as RepeatType, '2024-11-10');

    const eventData: Event = {
      id: '1',
      title: '매일 반복 이벤트',
      date: '2025-11-01',
      startTime: '21:25',
      endTime: '23:31',
      description: '',
      location: '',
      category: '',
      repeat: {
        type: 'daily',
        interval: 1,
        endDate: '2025-12-31',
      },
      notificationTime: 10,
    };

    const recurringEvents = result.map((eventDate, index) => ({
      ...eventData,
      id: index.toString(),
      date: eventDate,
    }));

    setupMockHandlerBatchCreation(recurringEvents);
    setupMockHandlerDeletion(recurringEvents);

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    const monthView = await screen.findByTestId('month-view');
    const firstDay = await screen.findByTestId('1');
    const secondDay = await screen.findByTestId('2');

    await waitFor(() => {
      expect(within(monthView).getByText('2024년 11월')).toBeInTheDocument();
      expect(within(firstDay).findAllByText('매일 반복 이벤트')).toBeTruthy();
      expect(within(secondDay).findAllByText('매일 반복 이벤트')).toBeTruthy();
    });

    const deleteButton = screen.getAllByLabelText('Delete event')[0];

    await user.click(deleteButton);

    await waitFor(() => {
      expect(within(monthView).getByText('2024년 11월')).toBeInTheDocument();
      expect(within(firstDay).queryByText('매일 반복 이벤트')).not.toBeInTheDocument();
      expect(within(secondDay).queryByText('매일 반복 이벤트')).toBeInTheDocument();
    });

    vi.useRealTimers();
  });
});
