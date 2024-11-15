import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { ReactElement } from 'react';

import {
  setupMockHandlerRepeatEvents,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils';
import App from '../../App';
import { CombinedContextProvider } from '../../provider';
import { Event } from '../../types';

const event2: Omit<Event, 'id' | 'notificationTime'> = {
  title: '기존 회의2',
  date: '2024-10-15',
  startTime: '14:00',
  endTime: '15:00',
  description: '프로젝트 진행 상황 논의',
  location: '회의실 A',
  category: '업무',
  repeat: { type: 'daily', interval: 7, endDate: '2024-10-30' },
};

const setup = (element: ReactElement) => {
  const user = userEvent.setup();

  return {
    ...render(
      <ChakraProvider>
        <CombinedContextProvider>{element}</CombinedContextProvider>
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

  await user.click(screen.getByLabelText('반복 일정'));

  await user.selectOptions(screen.getByLabelText('반복 유형'), repeat.type);
  await user.clear(screen.getByLabelText('반복 간격'));
  await user.type(screen.getByLabelText('반복 간격'), repeat.interval.toString());
  await user.type(screen.getByLabelText('반복 종료일'), repeat.endDate || '');

  await user.click(screen.getByTestId('event-submit-button'));
};

describe('통합 테스트', () => {
  describe('월간뷰 + 이벤트 리스트', () => {
    it('새로운 반복 일정 저장시 반복 일정이 이벤트 리스트에 정확히 저장된다.', async () => {
      setupMockHandlerRepeatEvents();

      const { user } = setup(<App />);
      await saveSchedule(user, event2);

      // 월간 뷰
      const monthView = screen.getByTestId('month-view');

      const firstRepeatEventCell = within(monthView).getByText('15').closest('td')!;
      expect(within(firstRepeatEventCell).getByText('기존 회의2')).toBeInTheDocument();

      expect(within(firstRepeatEventCell).queryByTestId('repeat-event')).toBeInTheDocument();

      const secondRepeatEventCell = within(monthView).getByText('22').closest('td')!;
      expect(within(secondRepeatEventCell).getByText('기존 회의2')).toBeInTheDocument();
      expect(within(secondRepeatEventCell).queryByTestId('repeat-event')).toBeInTheDocument();

      const thirdRepeatEventCell = within(monthView).getByText('29').closest('td')!;
      expect(within(thirdRepeatEventCell).getByText('기존 회의2')).toBeInTheDocument();
      expect(within(thirdRepeatEventCell).queryByTestId('repeat-event')).toBeInTheDocument();

      // 이벤트 리스트
      const eventList = within(screen.getByTestId('event-list'));

      expect(eventList.getAllByText('기존 회의2')).toHaveLength(3);
      expect(eventList.getByText('2024-10-15')).toBeInTheDocument();
      expect(eventList.getByText('2024-10-22')).toBeInTheDocument();
      expect(eventList.getByText('2024-10-29')).toBeInTheDocument();
      expect(eventList.getAllByText('14:00 - 15:00')).toHaveLength(3);
      expect(eventList.getAllByText('프로젝트 진행 상황 논의')).toHaveLength(3);
      expect(eventList.getAllByText('회의실 A')).toHaveLength(3);
      expect(eventList.getAllByText('카테고리: 업무')).toHaveLength(3);
      expect(eventList.getAllByText(/반복:/i)).toHaveLength(3);
    });

    it('반복 일정을 수정한 경우, 해당 일정은 단일 일정으로 변경된다.', async () => {
      const { user } = setup(<App />);

      setupMockHandlerUpdating(); // 물 마시기 일정 2024-10-15, 22, 29

      await user.click(await screen.findByLabelText('Edit event'));

      await user.clear(screen.getByLabelText('제목'));
      await user.type(screen.getByLabelText('제목'), '영양제 먹기');
      await user.clear(screen.getByLabelText('설명'));
      await user.type(screen.getByLabelText('설명'), '비타민 먹기');

      await user.click(screen.getByTestId('event-submit-button'));

      const monthView = screen.getByTestId('month-view');

      const firstRepeatEventCell = within(monthView).getByText('15').closest('td')!;
      expect(within(firstRepeatEventCell).getByText('영양제 먹기')).toBeInTheDocument();
      expect(within(firstRepeatEventCell).queryByTestId('repeat-event')).not.toBeInTheDocument();
    });

    it('윤년 2월 29일 매년 반복 일정 설정시, 다음해 2월 28일에 반복 일정이 추가된다.', async () => {
      setupMockHandlerRepeatEvents();

      vi.setSystemTime(new Date('2024-02-01'));

      const { user } = setup(<App />);
      await saveSchedule(user, {
        ...event2,
        date: '2024-02-29',
        repeat: { type: 'yearly', interval: 1, endDate: '2025-03-01' },
      });

      const eventList = within(screen.getByTestId('event-list'));
      const monthView = within(screen.getByTestId('month-view'));

      // 2024.02
      expect(monthView.getByTestId('repeat-event')).toBeInTheDocument();
      expect(eventList.getByText('기존 회의2')).toBeInTheDocument();
      expect(eventList.getByText('2024-02-29')).toBeInTheDocument();

      for (let i = 1; i <= 12; i++) {
        await user.click(screen.getByLabelText('Next'));
      }

      // 2025.02
      expect(monthView.getByTestId('repeat-event')).toBeInTheDocument();
      expect(eventList.getByText('기존 회의2')).toBeInTheDocument();
      expect(eventList.getByText('2025-02-28')).toBeInTheDocument();
    });

    it('1월 31일에 매달 반복 일정 설정시 31일 포함하지 않는 달에는 해당 월의 마지막 일에 추가된다', async () => {
      setupMockHandlerRepeatEvents();

      vi.setSystemTime(new Date('2024-01-01'));

      const { user } = setup(<App />);

      await saveSchedule(user, {
        ...event2,
        date: '2024-01-31',
        repeat: { type: 'monthly', interval: 1, endDate: '2024-12-31' },
      });

      const monthView = screen.getByTestId('month-view');

      const eventList = within(screen.getByTestId('event-list'));

      // 1월
      let repeatEventCell = within(monthView).getByText('31').closest('td')!;
      expect(within(repeatEventCell).getByText('기존 회의2')).toBeInTheDocument();
      expect(within(repeatEventCell).queryByTestId('repeat-event')).toBeInTheDocument();

      expect(eventList.getByText('기존 회의2')).toBeInTheDocument();
      expect(eventList.getByText('2024-01-31')).toBeInTheDocument();

      // 2월
      await user.click(screen.getByLabelText('Next'));

      repeatEventCell = within(monthView).getByText('29').closest('td')!;
      expect(within(repeatEventCell).getByText('기존 회의2')).toBeInTheDocument();
      expect(within(repeatEventCell).queryByTestId('repeat-event')).toBeInTheDocument();

      expect(eventList.getByText('기존 회의2')).toBeInTheDocument();
      expect(eventList.getByText('2024-02-29')).toBeInTheDocument();

      // 3월
      await user.click(screen.getByLabelText('Next'));

      repeatEventCell = within(monthView).getByText('31').closest('td')!;
      expect(within(repeatEventCell).getByText('기존 회의2')).toBeInTheDocument();
      expect(within(repeatEventCell).queryByTestId('repeat-event')).toBeInTheDocument();

      expect(eventList.getByText('기존 회의2')).toBeInTheDocument();
      expect(eventList.getByText('2024-03-31')).toBeInTheDocument();

      // 4월
      await user.click(screen.getByLabelText('Next'));

      repeatEventCell = within(monthView).getByText('30').closest('td')!;
      expect(within(repeatEventCell).getByText('기존 회의2')).toBeInTheDocument();
      expect(within(repeatEventCell).queryByTestId('repeat-event')).toBeInTheDocument();

      expect(eventList.getByText('기존 회의2')).toBeInTheDocument();
      expect(eventList.getByText('2024-04-30')).toBeInTheDocument();

      // 5월
      await user.click(screen.getByLabelText('Next'));

      repeatEventCell = within(monthView).getByText('31').closest('td')!;
      expect(within(repeatEventCell).getByText('기존 회의2')).toBeInTheDocument();
      expect(within(repeatEventCell).queryByTestId('repeat-event')).toBeInTheDocument();

      expect(eventList.getByText('기존 회의2')).toBeInTheDocument();
      expect(eventList.getByText('2024-05-31')).toBeInTheDocument();

      // 6월
      await user.click(screen.getByLabelText('Next'));

      repeatEventCell = within(monthView).getByText('30').closest('td')!;
      expect(within(repeatEventCell).getByText('기존 회의2')).toBeInTheDocument();
      expect(within(repeatEventCell).queryByTestId('repeat-event')).toBeInTheDocument();

      expect(eventList.getByText('기존 회의2')).toBeInTheDocument();
      expect(eventList.getByText('2024-06-30')).toBeInTheDocument();

      // 7월
      await user.click(screen.getByLabelText('Next'));

      repeatEventCell = within(monthView).getByText('31').closest('td')!;
      expect(within(repeatEventCell).getByText('기존 회의2')).toBeInTheDocument();
      expect(within(repeatEventCell).queryByTestId('repeat-event')).toBeInTheDocument();

      expect(eventList.getByText('기존 회의2')).toBeInTheDocument();
      expect(eventList.getByText('2024-07-31')).toBeInTheDocument();

      // 8월
      await user.click(screen.getByLabelText('Next'));

      repeatEventCell = within(monthView).getByText('31').closest('td')!;
      expect(within(repeatEventCell).getByText('기존 회의2')).toBeInTheDocument();
      expect(within(repeatEventCell).queryByTestId('repeat-event')).toBeInTheDocument();

      expect(eventList.getByText('기존 회의2')).toBeInTheDocument();
      expect(eventList.getByText('2024-08-31')).toBeInTheDocument();

      // 9월
      await user.click(screen.getByLabelText('Next'));

      repeatEventCell = within(monthView).getByText('30').closest('td')!;
      expect(within(repeatEventCell).getByText('기존 회의2')).toBeInTheDocument();
      expect(within(repeatEventCell).queryByTestId('repeat-event')).toBeInTheDocument();

      expect(eventList.getByText('기존 회의2')).toBeInTheDocument();
      expect(eventList.getByText('2024-09-30')).toBeInTheDocument();

      // 10월
      await user.click(screen.getByLabelText('Next'));

      repeatEventCell = within(monthView).getByText('31').closest('td')!;
      expect(within(repeatEventCell).getByText('기존 회의2')).toBeInTheDocument();
      expect(within(repeatEventCell).queryByTestId('repeat-event')).toBeInTheDocument();

      expect(eventList.getByText('기존 회의2')).toBeInTheDocument();
      expect(eventList.getByText('2024-10-31')).toBeInTheDocument();

      // 11월
      await user.click(screen.getByLabelText('Next'));

      repeatEventCell = within(monthView).getByText('30').closest('td')!;
      expect(within(repeatEventCell).getByText('기존 회의2')).toBeInTheDocument();
      expect(within(repeatEventCell).queryByTestId('repeat-event')).toBeInTheDocument();

      expect(eventList.getByText('기존 회의2')).toBeInTheDocument();
      expect(eventList.getByText('2024-11-30')).toBeInTheDocument();

      // 12월
      await user.click(screen.getByLabelText('Next'));

      repeatEventCell = within(monthView).getByText('31').closest('td')!;
      expect(within(repeatEventCell).getByText('기존 회의2')).toBeInTheDocument();
      expect(within(repeatEventCell).queryByTestId('repeat-event')).toBeInTheDocument();

      expect(eventList.getByText('기존 회의2')).toBeInTheDocument();
      expect(eventList.getByText('2024-12-31')).toBeInTheDocument();
    });
  });

  describe('주간뷰 + 이벤트 리스트', () => {
    it('주별 뷰 선택 후 새로운 반복 일정 저장시 반복 일정이 이벤트 리스트에 정확히 저장된다', async () => {
      setupMockHandlerRepeatEvents();

      const { user } = setup(<App />);
      await saveSchedule(user, {
        ...event2,
        date: '2024-10-01',
        repeat: { type: 'daily', interval: 2, endDate: '2024-10-30' },
      });

      await user.selectOptions(screen.getByLabelText('view'), 'week');

      // 주간 뷰
      const weekView = screen.getByTestId('week-view');

      const firstRepeatEventCell = within(weekView).getByText('1').closest('td')!;
      expect(within(firstRepeatEventCell).getByText('기존 회의2')).toBeInTheDocument();
      expect(within(firstRepeatEventCell).queryByTestId('repeat-event')).toBeInTheDocument();

      const secondRepeatEventCell = within(weekView).getByText('3').closest('td')!;
      expect(within(secondRepeatEventCell).getByText('기존 회의2')).toBeInTheDocument();
      expect(within(secondRepeatEventCell).queryByTestId('repeat-event')).toBeInTheDocument();

      const thirdRepeatEventCell = within(weekView).getByText('5').closest('td')!;
      expect(within(thirdRepeatEventCell).getByText('기존 회의2')).toBeInTheDocument();
      expect(within(thirdRepeatEventCell).queryByTestId('repeat-event')).toBeInTheDocument();

      // 이벤트 리스트
      const eventList = within(screen.getByTestId('event-list'));

      expect(eventList.getAllByText('기존 회의2')).toHaveLength(3);
      expect(eventList.getByText('2024-10-01')).toBeInTheDocument();
      expect(eventList.getByText('2024-10-03')).toBeInTheDocument();
      expect(eventList.getByText('2024-10-05')).toBeInTheDocument();
      expect(eventList.getAllByText('14:00 - 15:00')).toHaveLength(3);
      expect(eventList.getAllByText('프로젝트 진행 상황 논의')).toHaveLength(3);
      expect(eventList.getAllByText('회의실 A')).toHaveLength(3);
      expect(eventList.getAllByText('카테고리: 업무')).toHaveLength(3);
      expect(eventList.getAllByText(/반복:/i)).toHaveLength(3);
    });
  });

  it('반복 일정 삭제시, 해당 일정만 삭제된다.', async () => {
    setupMockHandlerDeletion();
    const { user } = setup(<App />);

    const eventList = within(screen.getByTestId('event-list'));

    expect(await eventList.findAllByText('반복 이벤트 입니다.')).toHaveLength(5);
    const allDeleteButton = await screen.findAllByLabelText('Delete event');
    await user.click(allDeleteButton[0]);

    expect(await eventList.findAllByText('반복 이벤트 입니다.')).toHaveLength(4);
  });
});
