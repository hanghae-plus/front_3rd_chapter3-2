import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, waitFor, within } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { expect, vi } from 'vitest';

import {
  setupMockHandlerBatchCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../__mocks__/handlersUtils';
import App from '../App';
import { Event, RepeatType } from '../entities/event/model/type.ts';
import { generateRecurringEvents } from '../features/calendar/lib/dateUtils';

interface SetupTestOptions {
  initialDate?: string;
  eventData?: Partial<Event>;
}

let user: UserEvent;
const mockToast = vi.fn();

describe('반복 일정 통합 테스트', () => {
  const setupTest = async ({
    initialDate = '2024-11-01',
    eventData = {},
  }: SetupTestOptions = {}) => {
    vi.setSystemTime(initialDate);
    user = userEvent.setup();

    const defaultEvent: Event = {
      id: '1',
      title: '테스트 이벤트',
      date: '2024-11-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '',
      repeat: {
        type: 'none',
        interval: 1,
        endDate: '',
      },
      notificationTime: 10,
      ...eventData,
    };

    return {
      render: () =>
        render(
          <ChakraProvider>
            <App />
          </ChakraProvider>
        ),
      defaultEvent,
    };
  };

  const createRecurringEvents = (
    startDate: string,
    interval: number,
    type: RepeatType,
    endDate: string,
    baseEvent: Event
  ) => {
    const dates = generateRecurringEvents(startDate, interval, type, endDate);
    return dates.map((date, index) => ({
      ...baseEvent,
      id: index.toString(),
      date,
    }));
  };

  const expectEventOnDate = async (
    date: string,
    eventTitle: string,
    shouldExist: boolean = true
  ) => {
    const dateElement = await screen.findByTestId(date);
    if (shouldExist) {
      expect(within(dateElement).getByText(eventTitle)).toBeInTheDocument();
    } else {
      expect(within(dateElement).queryByText(eventTitle)).not.toBeInTheDocument();
    }
  };

  beforeEach(() => {
    vi.mock('@chakra-ui/react', async () => {
      const original = await vi.importActual('@chakra-ui/react');
      return {
        ...original,
        useToast: () => mockToast,
      };
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('날짜 처리', () => {
    it('매달 31일 반복 일정은 31일이 없는 달에는 마지막 날에 표시된다', async () => {
      const { defaultEvent } = await setupTest({
        initialDate: '2024-10-01',
        eventData: {
          title: '31일 반복 이벤트',
          date: '2024-10-31',
          repeat: { type: 'monthly', interval: 1, endDate: '2025-03-31' },
        },
      });

      const events = createRecurringEvents('2024-10-31', 1, 'monthly', '2025-03-31', defaultEvent);

      setupMockHandlerBatchCreation(events);
      render(
        <ChakraProvider>
          <App />
        </ChakraProvider>
      );

      await expectEventOnDate('31', '31일 반복 이벤트');

      await user.click(screen.getByLabelText(/Next/));
      await expectEventOnDate('30', '31일 반복 이벤트');
    });

    it('윤년 2월 29일 반복 일정은 평년에는 28일에 표시된다', async () => {
      const { defaultEvent } = await setupTest({
        initialDate: '2024-02-01',
        eventData: {
          title: '윤년 반복 이벤트',
          date: '2024-02-29',
          repeat: { type: 'yearly', interval: 1, endDate: '2026-02-28' },
        },
      });

      const events = createRecurringEvents('2024-02-29', 1, 'yearly', '2026-02-28', defaultEvent);

      setupMockHandlerBatchCreation(events);
      render(
        <ChakraProvider>
          <App />
        </ChakraProvider>
      );

      await expectEventOnDate('29', '윤년 반복 이벤트');

      // 2025년 2월로 이동
      for (let i = 0; i < 12; i++) {
        await user.click(screen.getByLabelText(/Next/));
      }

      await expectEventOnDate('28', '윤년 반복 이벤트');
    });
  });

  describe('반복 간격', () => {
    it('반복 간격이 0일 경우 자동으로 1로 설정된다', async () => {
      await setupTest();
      render(
        <ChakraProvider>
          <App />
        </ChakraProvider>
      );

      await user.click(screen.getByLabelText('반복 일정'));
      await user.selectOptions(screen.getByLabelText('반복 유형'), 'daily');
      await user.clear(screen.getByLabelText('반복 간격'));

      const repeatIntervalInput = screen.getByLabelText('반복 간격') as HTMLInputElement;
      await waitFor(() => {
        expect(repeatIntervalInput.value).toBe('1');
      });
    });

    it('2일 간격으로 반복되는 일정이 올바르게 표시된다', async () => {
      const { defaultEvent } = await setupTest({
        initialDate: '2024-11-01',
        eventData: {
          title: '2일 반복 이벤트',
          repeat: { type: 'daily', interval: 2, endDate: '2024-11-05' },
        },
      });

      const events = createRecurringEvents('2024-11-01', 2, 'daily', '2024-11-05', defaultEvent);

      setupMockHandlerBatchCreation(events);
      render(
        <ChakraProvider>
          <App />
        </ChakraProvider>
      );

      await expectEventOnDate('1', '2일 반복 이벤트', true);
      await expectEventOnDate('2', '2일 반복 이벤트', false);
      await expectEventOnDate('3', '2일 반복 이벤트', true);
      await expectEventOnDate('4', '2일 반복 이벤트', false);
      await expectEventOnDate('5', '2일 반복 이벤트', true);
    });
  });

  describe('종료일 처리', () => {
    it('종료일을 지정하지 않으면 기본값으로 2025년 6월 30일까지 반복된다', async () => {
      const { defaultEvent } = await setupTest({
        initialDate: '2024-11-01',
        eventData: {
          title: '종료일 미지정 이벤트',
          repeat: { type: 'monthly', interval: 1, endDate: '' },
        },
      });

      const events = createRecurringEvents('2024-11-01', 1, 'monthly', '2025-06-30', defaultEvent);

      setupMockHandlerBatchCreation(events);
      render(
        <ChakraProvider>
          <App />
        </ChakraProvider>
      );

      // 2025년 6월로 이동
      for (let i = 0; i < 7; i++) {
        await user.click(screen.getByLabelText(/Next/));
      }

      const monthView = await screen.findByTestId('month-view');
      expect(within(monthView).getByText('종료일 미지정 이벤트')).toBeInTheDocument();

      // 2025년 7월 확인
      await user.click(screen.getByLabelText(/Next/));
      expect(within(monthView).queryByText('종료일 미지정 이벤트')).not.toBeInTheDocument();
    });

    it('종료일이 시작일보다 이전이면 에러 메시지를 표시한다', async () => {
      await setupTest();
      render(
        <ChakraProvider>
          <App />
        </ChakraProvider>
      );

      // 이벤트 입력
      await user.type(screen.getByLabelText('제목'), '테스트 이벤트');
      await user.type(screen.getByLabelText('날짜'), '2024-11-01');
      await user.type(screen.getByLabelText('시작 시간'), '10:00');
      await user.type(screen.getByLabelText('종료 시간'), '11:00');

      // 반복 설정
      await user.click(screen.getByLabelText('반복 일정'));
      await user.selectOptions(screen.getByLabelText('반복 유형'), 'monthly');
      await user.type(screen.getByLabelText('반복 종료일'), '2024-10-01');

      await user.click(screen.getByRole('button', { name: /일정 추가/ }));

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '반복 종료일이 일정 시작일보다 늦어야 합니다.',
          status: 'error',
        })
      );
    });
  });

  describe('반복 일정 수정 및 삭제', () => {
    it('반복 일정을 수정하면 단일 일정으로 변경된다', async () => {
      const { defaultEvent } = await setupTest({
        initialDate: '2024-11-01',
        eventData: {
          title: '반복 이벤트',
          repeat: { type: 'weekly', interval: 1, endDate: '2025-11-14' },
        },
      });

      const events = createRecurringEvents('2024-11-01', 1, 'weekly', '2025-11-14', defaultEvent);

      setupMockHandlerBatchCreation(events);
      setupMockHandlerUpdating(events);
      render(
        <ChakraProvider>
          <App />
        </ChakraProvider>
      );

      const editButtons = await screen.findAllByRole('button', { name: /Edit event/i });
      await user.click(editButtons[0]);

      // 이벤트 수정
      await user.clear(screen.getByLabelText('제목'));
      await user.type(screen.getByLabelText('제목'), '단일 이벤트');
      await user.clear(screen.getByLabelText('날짜'));
      await user.type(screen.getByLabelText('날짜'), '2024-11-03');

      await user.click(screen.getByRole('button', { name: /일정 수정/ }));

      const dayElement = await screen.findByTestId('3');
      expect(within(dayElement).queryByRole('img')).not.toBeInTheDocument();
      expect(within(dayElement).getByText('단일 이벤트')).toBeInTheDocument();
    });

    it('반복 일정 중 하나를 삭제하면 해당 일정만 삭제된다', async () => {
      const { defaultEvent } = await setupTest({
        initialDate: '2024-11-01',
        eventData: {
          title: '반복 이벤트',
          repeat: { type: 'daily', interval: 1, endDate: '2024-11-10' },
        },
      });

      const events = createRecurringEvents('2024-11-01', 1, 'daily', '2024-11-10', defaultEvent);

      setupMockHandlerBatchCreation(events);
      setupMockHandlerDeletion(events);
      render(
        <ChakraProvider>
          <App />
        </ChakraProvider>
      );

      await expectEventOnDate('1', '반복 이벤트');
      await expectEventOnDate('2', '반복 이벤트');

      const deleteButtons = await screen.findAllByLabelText('Delete event');
      await user.click(deleteButtons[0]);

      await expectEventOnDate('1', '반복 이벤트', false);
      await expectEventOnDate('2', '반복 이벤트', true);
    });
  });
});
