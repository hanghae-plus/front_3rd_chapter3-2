import { ChakraProvider, useToast } from '@chakra-ui/react';
import useCalendarViewStore from '@stores/useCalendarViewStore';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AddSchedule } from '@templates/AddSchedule';
import { CalendarManager } from '@/components/templates/CalendarManager';
import { ScheduleManager } from '@templates/ScheduleManager';
import { screen, act, renderHook, waitFor, fireEvent, within } from '@testing-library/react';
import React from 'react';

import { AlertDuplicateSchedule } from '@/components/templates/AlertDialog';
import { Notification } from '@/components/templates/Notification';
import DialogProvider from '@/context/DialogProvider';
import useScheduleForm from '@/stores/useScheduleForm';
import { createQueryClient } from '@/createQueryClient';
import { useEventOperations } from '@/hooks/useEventOperations';
import { eventFactory } from '@/__mocks__/Factory';
import { fillEventForm } from './helpers';
import userEvent from '@testing-library/user-event';
import { TEST_ID } from '@/constants/testID';
import { getEventsForDay } from '@/utils/dateUtils';

const createWrapper =
  (queryClient: QueryClient) =>
  ({ children }: { children: React.ReactNode }) => {
    return (
      <QueryClientProvider client={queryClient}>
        <ChakraProvider>
          <DialogProvider>
            <ScheduleManager />
            <AddSchedule />
            <CalendarManager />
            <AlertDuplicateSchedule />
            <Notification />
            {children}
          </DialogProvider>
        </ChakraProvider>
      </QueryClientProvider>
    );
  };
let queryEvent: {
  current: ReturnType<typeof useEventOperations>;
};
describe('-', () => {
  const toast = useToast();
  const queryClient = createQueryClient(toast);
  const wrapper = createWrapper(queryClient);

  beforeEach(async () => {
    // GIVEN: 각 테스트마다 초기 상태가 반영된 핸들러 설정
    queryClient.clear();
    useCalendarViewStore.setState({ currentDate: new Date() });
    useScheduleForm.setState({
      isEditing: false,
      id: '',
      title: '',
      date: '',
      startTime: '',
      endTime: '',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0, endDate: '' },
      notificationTime: 1,
    });

    // GIVEN: 초기상태 불러오기
    queryEvent = renderHook(() => useEventOperations(), { wrapper }).result;

    await waitFor(() => expect(queryClient.getQueryState(['events'])?.status).toBe('success'));
  });

  describe('반복 유형 선택_필수 기능', () => {
    it('각 반복 유형에 대해 간격을 설정할 수 있다.', async () => {
      // GIVEN: 2년 단위 반복 일정 데이터 가공한다.
      const TWO_YEAR_EVENT = eventFactory.build({
        title: '2년 반복',
        date: '2024-02-29',
        repeat: { type: 'yearly', interval: 2, endDate: '' },
        notificationTime: 10,
        exceptionList: [],
      });
      // THEN: 반복 날짜에 맞게 일정을 반환한다.
      expect(getEventsForDay([TWO_YEAR_EVENT], '2024-02-29')).toEqual([TWO_YEAR_EVENT]);
      expect(getEventsForDay([TWO_YEAR_EVENT], '2025-02-28')).toEqual([]);
      expect(getEventsForDay([TWO_YEAR_EVENT], '2026-02-28')).toEqual([TWO_YEAR_EVENT]);
      expect(getEventsForDay([TWO_YEAR_EVENT], '2027-02-28')).toEqual([]);
      expect(getEventsForDay([TWO_YEAR_EVENT], '2028-02-29')).toEqual([TWO_YEAR_EVENT]);

      expect(getEventsForDay([TWO_YEAR_EVENT], '2024-07-31')).toEqual([]);
      expect(getEventsForDay([TWO_YEAR_EVENT], '2025-08-31')).toEqual([]);
      expect(getEventsForDay([TWO_YEAR_EVENT], '2023-09-30')).toEqual([]);

      // GIVEN: 2달 단위 반복 일정 데이터 가공한다.
      const TWO_MONTH_EVENT = eventFactory.build({
        title: '두달 반복',
        date: '2024-02-29',
        repeat: { type: 'monthly', interval: 2, endDate: '' },
        notificationTime: 10,
        exceptionList: [],
      });
      // THEN: 반복 날짜에 맞게 일정을 반환한다.
      expect(getEventsForDay([TWO_MONTH_EVENT], '2024-02-29')).toEqual([TWO_MONTH_EVENT]);
      expect(getEventsForDay([TWO_MONTH_EVENT], '2024-03-31')).toEqual([]);
      expect(getEventsForDay([TWO_MONTH_EVENT], '2024-04-30')).toEqual([TWO_MONTH_EVENT]);
      expect(getEventsForDay([TWO_MONTH_EVENT], '2024-05-31')).toEqual([]);
      expect(getEventsForDay([TWO_MONTH_EVENT], '2024-06-30')).toEqual([TWO_MONTH_EVENT]);
      expect(getEventsForDay([TWO_MONTH_EVENT], '2024-07-31')).toEqual([]);
      expect(getEventsForDay([TWO_MONTH_EVENT], '2024-08-31')).toEqual([TWO_MONTH_EVENT]);
      expect(getEventsForDay([TWO_MONTH_EVENT], '2024-09-30')).toEqual([]);
      expect(getEventsForDay([TWO_MONTH_EVENT], '2024-10-31')).toEqual([TWO_MONTH_EVENT]);
      expect(getEventsForDay([TWO_MONTH_EVENT], '2024-11-30')).toEqual([]);
      expect(getEventsForDay([TWO_MONTH_EVENT], '2024-12-31')).toEqual([TWO_MONTH_EVENT]);
      expect(getEventsForDay([TWO_MONTH_EVENT], '2025-01-31')).toEqual([]);
      expect(getEventsForDay([TWO_MONTH_EVENT], '2025-02-28')).toEqual([TWO_MONTH_EVENT]);

      // 일
      const TWO_DATE_EVENT = eventFactory.build({
        title: '2일 반복',
        date: '2024-02-29',
        repeat: { type: 'daily', interval: 2, endDate: '' },
        notificationTime: 10,
        exceptionList: [],
      });
      expect(getEventsForDay([TWO_DATE_EVENT], '2024-02-29')).toEqual([TWO_DATE_EVENT]);
      expect(getEventsForDay([TWO_DATE_EVENT], '2024-03-01')).toEqual([]);
      expect(getEventsForDay([TWO_DATE_EVENT], '2024-03-02')).toEqual([TWO_DATE_EVENT]);
      expect(getEventsForDay([TWO_DATE_EVENT], '2024-03-03')).toEqual([]);
      expect(getEventsForDay([TWO_DATE_EVENT], '2024-03-04')).toEqual([TWO_DATE_EVENT]);
      expect(getEventsForDay([TWO_DATE_EVENT], '2024-03-05')).toEqual([]);
      expect(getEventsForDay([TWO_DATE_EVENT], '2024-03-06')).toEqual([TWO_DATE_EVENT]);
      expect(getEventsForDay([TWO_DATE_EVENT], '2024-03-07')).toEqual([]);
    });

    // it('반복 종료 조건을 지정할 수 있다.', async () => {
    //   expect(true).toBe(false);
    // });

    // it('반복 일정을 수정하면 단일 일정으로 변경된다.', async () => {
    //   expect(true).toBe(false);
    // });

    // it('반복 일정을 삭제하면 해당 일정만 삭제된다.', async () => {
    //   expect(true).toBe(false);
    // });
  });

  // describe('반복 유형 선택_부기능', () => {
  //   it('반복 일정 중 특정 날짜를 제외할 수 있다.', async () => {
  //     expect(true).toBe(false);
  //   });

  //   it('반복 일정 중 특정 날짜의 일정을 수정할 수 있다.', async () => {
  //     expect(true).toBe(false);
  //   });

  //   describe('주간 반복', () => {
  //     it('주간 반복 시 특정 요일을 선택할 수 있다.', async () => {
  //       expect(true).toBe(false);
  //     });
  //   });

  //   describe('월간 반복', () => {
  //     it('매월 특정 날짜에 반복되도록 설정할 수 있다.', async () => {
  //       expect(true).toBe(false);
  //     });

  //     it('매월 특정 순서의 요일에 반복되도록 설정할 수 있다.', async () => {
  //       expect(true).toBe(false);
  //     });
  //   });

  //   describe('반복 일정 수정 및 삭제', () => {
  //     it('반복 일정의 모든 일정을 수정할 수 있다.', async () => {
  //       expect(true).toBe(false);
  //     });

  //     it('반복 일정의 모든 일정을 삭제할 수 있다.', async () => {
  //       expect(true).toBe(false);
  //     });
  //   });
  // });
});
