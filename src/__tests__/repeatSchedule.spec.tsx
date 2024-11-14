import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { ReactElement } from 'react';

import {
  setupMockHandlerRepeatCreation,
  setupMockHandlerRepeatDeletion,
  setupMockHandlerRepeatUpdating,
} from '../__mocks__/handlersUtils';
import App from '../App';
import { ScheduleDay } from '../components/calendar/ScheduleDay';
import { Event, RepeatInfo } from '../types';
import { generateFutureRepeatEvents } from '../utils/eventRepeat';

const event1: Event = {
  id: '1',
  title: '기존 회의',
  date: '2024-10-01',
  startTime: '09:00',
  endTime: '10:00',
  description: '기존 팀 미팅',
  location: '회의실 B',
  category: '업무',
  repeat: { type: 'daily', interval: 0, endDate: '' },
  notificationTime: 10,
};

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

  await user.click(screen.getByLabelText('반복 일정'));
  await user.selectOptions(screen.getByLabelText('반복 유형'), repeat.type);
  await user.clear(screen.getByLabelText('반복 간격'));
  await user.type(screen.getByLabelText('반복 간격'), repeat.interval.toString());
  await user.type(screen.getByLabelText('반복 종료일'), repeat.endDate || '');

  await user.click(screen.getByTestId('event-submit-button'));
};

describe('반복 일정', () => {
  describe('컴포넌트', () => {
    it('반복 일정의 경우 아이콘이 표시된다.', () => {
      setup(<ScheduleDay event={event1} isNotified={false} />);

      expect(screen.getByTestId('repeat-icon')).toBeInTheDocument();
    });

    it('반복 일정이 선택되지 않은 경우, 반복 유형, 반복 간격, 반복 종료일이 표시되지 않는다.', async () => {
      setup(<App />);

      expect(screen.queryByLabelText('반복 유형')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('반복 간격')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('반복 종료일')).not.toBeInTheDocument();
    });

    it('반복 일정이 선택된 경우, 반복 유형, 반복 간격, 반복 종료일이 표시된다.', async () => {
      const { user } = setup(<App />);

      await user.click(screen.getByLabelText('반복 일정'));

      expect(screen.getByLabelText('반복 유형')).toBeInTheDocument();
      expect(screen.getByLabelText('반복 간격')).toBeInTheDocument();
      expect(screen.getByLabelText('반복 종료일')).toBeInTheDocument();
    });

    it('반복 유형에는 매일, 매주, 매월, 매년이 있다.', async () => {
      const { user } = setup(<App />);

      await user.click(screen.getByLabelText('반복 일정'));

      const options = Array.from(screen.getByLabelText('반복 유형').getElementsByTagName('option'));

      expect(options.map((option) => option.textContent)).toEqual(['매일', '매주', '매월', '매년']);
    });
  });

  describe('Utils - generateFutureRepeatEvents', () => {
    describe('반복 옵션 - 매일)', () => {
      it('반복 간격과 반복 종료일을 모두 설정하면, 반복 종료일까지 반복 옵션과 반복 간격에 맞춰 반복 이벤트가 생성된다.', () => {
        const repeatInfo: RepeatInfo = { type: 'daily', interval: 7, endDate: '2024-10-30' };
        const eventWithRepeat = { ...event1, repeat: repeatInfo };

        const repeatEvents = generateFutureRepeatEvents(eventWithRepeat);

        expect(repeatEvents).toHaveLength(4);
        expect(repeatEvents[0].date).toBe('2024-10-08');
        expect(repeatEvents[1].date).toBe('2024-10-15');
        expect(repeatEvents[2].date).toBe('2024-10-22');
        expect(repeatEvents[3].date).toBe('2024-10-29');
      });
    });

    describe('반복 옵션 - 매주)', () => {
      it('반복 간격과 반복 종료일을 모두 설정하면, 반복 종료일까지 반복 옵션과 반복 간격에 맞춰 반복 이벤트가 생성된다.', () => {
        const repeatInfo: RepeatInfo = { type: 'weekly', interval: 3, endDate: '2024-11-30' };
        const eventWithRepeat = { ...event1, repeat: repeatInfo };

        const repeatEvents = generateFutureRepeatEvents(eventWithRepeat);

        expect(repeatEvents).toHaveLength(2);
        expect(repeatEvents[0].date).toBe('2024-10-22');
        expect(repeatEvents[1].date).toBe('2024-11-12');
      });
    });

    describe('반복 옵션 - 매월)', () => {
      it('반복 간격과 반복 종료일을 모두 설정하면, 반복 종료일까지 반복 옵션과 반복 간격에 맞춰 반복 이벤트가 생성된다.', () => {
        const repeatInfo: RepeatInfo = { type: 'monthly', interval: 1, endDate: '2024-12-30' };
        const eventWithRepeat = { ...event1, repeat: repeatInfo };

        const repeatEvents = generateFutureRepeatEvents(eventWithRepeat);

        expect(repeatEvents).toHaveLength(2);
        expect(repeatEvents[0].date).toBe('2024-11-01');
        expect(repeatEvents[1].date).toBe('2024-12-01');
      });

      it('윤년 2월 29일에 매월 반복 일정 설정시, 매월 29일에 일정이 추가되고 다음 년도에는 2월 28일에 일정이 추가된다.', () => {
        const repeatInfo: RepeatInfo = { type: 'monthly', interval: 1, endDate: '2025-04-01' };
        const eventWithRepeat = { ...event1, date: '2024-01-29', repeat: repeatInfo };

        const repeatEvents = generateFutureRepeatEvents(eventWithRepeat);

        expect(repeatEvents[0].date).toBe('2024-02-29');
        expect(repeatEvents[1].date).toBe('2024-03-29');
        expect(repeatEvents[2].date).toBe('2024-04-29');
        expect(repeatEvents[3].date).toBe('2024-05-29');
        expect(repeatEvents[4].date).toBe('2024-06-29');
        expect(repeatEvents[5].date).toBe('2024-07-29');
        expect(repeatEvents[6].date).toBe('2024-08-29');
        expect(repeatEvents[7].date).toBe('2024-09-29');
        expect(repeatEvents[8].date).toBe('2024-10-29');
        expect(repeatEvents[9].date).toBe('2024-11-29');
        expect(repeatEvents[10].date).toBe('2024-12-29');
        expect(repeatEvents[11].date).toBe('2025-01-29');
        expect(repeatEvents[12].date).toBe('2025-02-28');
        expect(repeatEvents[13].date).toBe('2025-03-29');
      });
    });

    describe('반복 옵션 - 매년)', () => {
      it('반복 간격과 반복 종료일을 모두 설정하면, 반복 종료일까지 반복 옵션과 반복 간격에 맞춰 반복 이벤트가 생성된다.', () => {
        const repeatInfo: RepeatInfo = { type: 'yearly', interval: 1, endDate: '2026-11-30' };
        const eventWithRepeat = { ...event1, repeat: repeatInfo };

        const repeatEvents = generateFutureRepeatEvents(eventWithRepeat);

        expect(repeatEvents).toHaveLength(2);
        expect(repeatEvents[0].date).toBe('2025-10-01');
        expect(repeatEvents[1].date).toBe('2026-10-01');
      });

      it('윤년 2월 29일에 매년 반복 일정 설정시, 다음해에는 2월 28일에 일정이 추가된다.', () => {
        const repeatInfo: RepeatInfo = { type: 'yearly', interval: 1, endDate: '2025-04-01' };
        const eventWithRepeat = { ...event1, date: '2024-02-29', repeat: repeatInfo };

        const repeatEvents = generateFutureRepeatEvents(eventWithRepeat);

        expect(repeatEvents).toHaveLength(1);
        expect(repeatEvents[0].date).toBe('2025-02-28');
      });
    });

    describe('예외 케이스)', () => {
      it('반복 종료일이 이벤트 날짜보다 이전인 경우, 반복 일정을 생성하지 않는다.', () => {
        // ! 현재 시스템 시간 2024-10-01
        const repeatInfo: RepeatInfo = { type: 'daily', interval: 7, endDate: '2024-09-30' };
        const eventWithRepeat = { ...event1, repeat: repeatInfo };

        const repeatEvents = generateFutureRepeatEvents(eventWithRepeat);

        expect(repeatEvents).toHaveLength(0);
      });

      it('반복 간격만 설정하면, 2025-06-30까지 반복 옵션에 맞춰 입력한 횟수만큼 반복 이벤트가 생성된다.', () => {
        const repeatInfo: RepeatInfo = { type: 'daily', interval: 7, endDate: '' };
        const eventWithRepeat = { ...event1, repeat: repeatInfo };

        const repeatEvents = generateFutureRepeatEvents(eventWithRepeat);

        expect(repeatEvents).toHaveLength(38);
        // 반복 시작 일정 날짜 확인
        expect(repeatEvents[0].date).toBe('2024-10-08');
        expect(repeatEvents[1].date).toBe('2024-10-15');
        expect(repeatEvents[2].date).toBe('2024-10-22');
        expect(repeatEvents[3].date).toBe('2024-10-29');

        // 월이 바뀌는 시점의 일정 날짜 확인
        expect(repeatEvents[12].date).toBe('2024-12-31');
        expect(repeatEvents[13].date).toBe('2025-01-07');

        // 연도가 바뀌는 시점의 일정 날짜 확인
        expect(repeatEvents[25].date).toBe('2025-04-01');
        expect(repeatEvents[26].date).toBe('2025-04-08');

        // 반복 마지막 일정 날짜 확인
        expect(repeatEvents[34].date).toBe('2025-06-03');
        expect(repeatEvents[35].date).toBe('2025-06-10');
        expect(repeatEvents[36].date).toBe('2025-06-17');
        expect(repeatEvents[37].date).toBe('2025-06-24');
      });

      it('반복 간격과 반복 종료일을 설정하지 않으면, 반복 옵션에 맞춰 반복 이벤트가 생성된다.', () => {
        const repeatInfo: RepeatInfo = { type: 'monthly', interval: 1, endDate: '' };
        const eventWithRepeat = { ...event1, repeat: repeatInfo };

        const repeatEvents = generateFutureRepeatEvents(eventWithRepeat);

        expect(repeatEvents[0].date).toBe('2024-11-01');
        expect(repeatEvents[1].date).toBe('2024-12-01');
        expect(repeatEvents[2].date).toBe('2025-01-01');
        expect(repeatEvents[3].date).toBe('2025-02-01');
        expect(repeatEvents[4].date).toBe('2025-03-01');
        expect(repeatEvents[5].date).toBe('2025-04-01');
        expect(repeatEvents[6].date).toBe('2025-05-01');
        expect(repeatEvents[7].date).toBe('2025-06-01');
      });

      it('반복 간격이 0인 경우, 반복 이벤트가 생성되지 않는다.', () => {
        const repeatInfo: RepeatInfo = { ...event1.repeat, interval: 0 };
        const eventWithRepeat = { ...event1, repeat: repeatInfo };

        const repeatEvents = generateFutureRepeatEvents(eventWithRepeat);

        expect(repeatEvents).toHaveLength(0);
      });
    });
  });

  describe('통합 테스트', () => {
    describe('월간뷰 + 이벤트 리스트', () => {
      it('새로운 반복 일정 저장시 반복 일정이 이벤트 리스트에 정확히 저장된다.', async () => {
        setupMockHandlerRepeatCreation();

        const { user } = setup(<App />);
        await saveSchedule(user, event2);

        // 월간 뷰
        const monthView = screen.getByTestId('month-view');

        const firstRepeatEventCell = within(monthView).getByText('15').closest('td')!;
        expect(within(firstRepeatEventCell).getByText('기존 회의2')).toBeInTheDocument();
        expect(within(firstRepeatEventCell).queryByTestId('repeat-icon')).toBeInTheDocument();

        const secondRepeatEventCell = within(monthView).getByText('22').closest('td')!;
        expect(within(secondRepeatEventCell).getByText('기존 회의2')).toBeInTheDocument();
        expect(within(secondRepeatEventCell).queryByTestId('repeat-icon')).toBeInTheDocument();

        const thirdRepeatEventCell = within(monthView).getByText('29').closest('td')!;
        expect(within(thirdRepeatEventCell).getByText('기존 회의2')).toBeInTheDocument();
        expect(within(thirdRepeatEventCell).queryByTestId('repeat-icon')).toBeInTheDocument();

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

        setupMockHandlerRepeatUpdating(); // 물 마시기 일정 2024-10-15, 22, 29

        await user.click(await screen.findByLabelText('Edit event'));

        await user.clear(screen.getByLabelText('제목'));
        await user.type(screen.getByLabelText('제목'), '영양제 먹기');
        await user.clear(screen.getByLabelText('설명'));
        await user.type(screen.getByLabelText('설명'), '비타민 먹기');

        await user.click(screen.getByTestId('event-submit-button'));

        // 월간 뷰
        const monthView = screen.getByTestId('month-view');

        const firstRepeatEventCell = within(monthView).getByText('15').closest('td')!;
        expect(within(firstRepeatEventCell).getByText('영양제 먹기')).toBeInTheDocument();
        expect(within(firstRepeatEventCell).queryByTestId('repeat-icon')).not.toBeInTheDocument();

        const secondRepeatEventCell = within(monthView).getByText('16').closest('td')!;
        expect(within(secondRepeatEventCell).getByText('물 마시기')).toBeInTheDocument();
        expect(within(secondRepeatEventCell).queryByTestId('repeat-icon')).toBeInTheDocument();

        const thirdRepeatEventCell = within(monthView).getByText('17').closest('td')!;
        expect(within(thirdRepeatEventCell).getByText('물 마시기')).toBeInTheDocument();
        expect(within(thirdRepeatEventCell).queryByTestId('repeat-icon')).toBeInTheDocument();

        // 이벤트 리스트
        const eventList = within(screen.getByTestId('event-list'));

        expect(eventList.getByText('영양제 먹기')).toBeInTheDocument();
        expect(eventList.getAllByText('물 마시기')).toHaveLength(2);
        expect(eventList.getAllByText(/반복:/i)).toHaveLength(2);
      });

      it('월간 뷰에서 반복 간격이 0으로 설정된 경우, 해당 일정만 추가되고 반복 일정은 추가되지 않는다', async () => {
        setupMockHandlerRepeatCreation();

        // ! 현재 시스템 시간 2024-10-01
        const { user } = setup(<App />);

        await saveSchedule(user, {
          ...event2,
          date: '2024-10-01',
          repeat: { type: 'daily', interval: 0, endDate: '2024-10-30' },
        });

        // 월간 뷰
        const monthView = within(screen.getByTestId('month-view'));
        expect(monthView.getAllByText('기존 회의2')).toHaveLength(1);

        // 이벤트 리스트
        const eventList = within(screen.getByTestId('event-list'));
        expect(eventList.getAllByText('기존 회의2')).toHaveLength(1);
      });

      it('윤년 2월 29일 매년 반복 일정 설정시, 다음해 2월 28일에 반복 일정이 추가된다.', async () => {
        setupMockHandlerRepeatCreation();

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
        expect(monthView.getByTestId('repeat-icon')).toBeInTheDocument();
        expect(eventList.getByText('기존 회의2')).toBeInTheDocument();
        expect(eventList.getByText('2024-02-29')).toBeInTheDocument();

        for (let i = 1; i <= 12; i++) {
          await user.click(screen.getByLabelText('Next'));
        }

        // 2025.02
        expect(monthView.getByTestId('repeat-icon')).toBeInTheDocument();
        expect(eventList.getByText('기존 회의2')).toBeInTheDocument();
        expect(eventList.getByText('2025-02-28')).toBeInTheDocument();
      });

      it('1월 31일에 매달 반복 일정 설정시 31일 포함하지 않는 달에는 해당 월의 마지막 일에 추가된다', async () => {
        setupMockHandlerRepeatCreation();

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
        expect(within(repeatEventCell).queryByTestId('repeat-icon')).toBeInTheDocument();

        expect(eventList.getByText('기존 회의2')).toBeInTheDocument();
        expect(eventList.getByText('2024-01-31')).toBeInTheDocument();

        // 2월
        await user.click(screen.getByLabelText('Next'));

        repeatEventCell = within(monthView).getByText('29').closest('td')!;
        expect(within(repeatEventCell).getByText('기존 회의2')).toBeInTheDocument();
        expect(within(repeatEventCell).queryByTestId('repeat-icon')).toBeInTheDocument();

        expect(eventList.getByText('기존 회의2')).toBeInTheDocument();
        expect(eventList.getByText('2024-02-29')).toBeInTheDocument();

        // 3월
        await user.click(screen.getByLabelText('Next'));

        repeatEventCell = within(monthView).getByText('31').closest('td')!;
        expect(within(repeatEventCell).getByText('기존 회의2')).toBeInTheDocument();
        expect(within(repeatEventCell).queryByTestId('repeat-icon')).toBeInTheDocument();

        expect(eventList.getByText('기존 회의2')).toBeInTheDocument();
        expect(eventList.getByText('2024-03-31')).toBeInTheDocument();

        // 4월
        await user.click(screen.getByLabelText('Next'));

        repeatEventCell = within(monthView).getByText('30').closest('td')!;
        expect(within(repeatEventCell).getByText('기존 회의2')).toBeInTheDocument();
        expect(within(repeatEventCell).queryByTestId('repeat-icon')).toBeInTheDocument();

        expect(eventList.getByText('기존 회의2')).toBeInTheDocument();
        expect(eventList.getByText('2024-04-30')).toBeInTheDocument();

        // 5월
        await user.click(screen.getByLabelText('Next'));

        repeatEventCell = within(monthView).getByText('31').closest('td')!;
        expect(within(repeatEventCell).getByText('기존 회의2')).toBeInTheDocument();
        expect(within(repeatEventCell).queryByTestId('repeat-icon')).toBeInTheDocument();

        expect(eventList.getByText('기존 회의2')).toBeInTheDocument();
        expect(eventList.getByText('2024-05-31')).toBeInTheDocument();

        // 6월
        await user.click(screen.getByLabelText('Next'));

        repeatEventCell = within(monthView).getByText('30').closest('td')!;
        expect(within(repeatEventCell).getByText('기존 회의2')).toBeInTheDocument();
        expect(within(repeatEventCell).queryByTestId('repeat-icon')).toBeInTheDocument();

        expect(eventList.getByText('기존 회의2')).toBeInTheDocument();
        expect(eventList.getByText('2024-06-30')).toBeInTheDocument();

        // 7월
        await user.click(screen.getByLabelText('Next'));

        repeatEventCell = within(monthView).getByText('31').closest('td')!;
        expect(within(repeatEventCell).getByText('기존 회의2')).toBeInTheDocument();
        expect(within(repeatEventCell).queryByTestId('repeat-icon')).toBeInTheDocument();

        expect(eventList.getByText('기존 회의2')).toBeInTheDocument();
        expect(eventList.getByText('2024-07-31')).toBeInTheDocument();

        // 8월
        await user.click(screen.getByLabelText('Next'));

        repeatEventCell = within(monthView).getByText('31').closest('td')!;
        expect(within(repeatEventCell).getByText('기존 회의2')).toBeInTheDocument();
        expect(within(repeatEventCell).queryByTestId('repeat-icon')).toBeInTheDocument();

        expect(eventList.getByText('기존 회의2')).toBeInTheDocument();
        expect(eventList.getByText('2024-08-31')).toBeInTheDocument();

        // 9월
        await user.click(screen.getByLabelText('Next'));

        repeatEventCell = within(monthView).getByText('30').closest('td')!;
        expect(within(repeatEventCell).getByText('기존 회의2')).toBeInTheDocument();
        expect(within(repeatEventCell).queryByTestId('repeat-icon')).toBeInTheDocument();

        expect(eventList.getByText('기존 회의2')).toBeInTheDocument();
        expect(eventList.getByText('2024-09-30')).toBeInTheDocument();

        // 10월
        await user.click(screen.getByLabelText('Next'));

        repeatEventCell = within(monthView).getByText('31').closest('td')!;
        expect(within(repeatEventCell).getByText('기존 회의2')).toBeInTheDocument();
        expect(within(repeatEventCell).queryByTestId('repeat-icon')).toBeInTheDocument();

        expect(eventList.getByText('기존 회의2')).toBeInTheDocument();
        expect(eventList.getByText('2024-10-31')).toBeInTheDocument();

        // 11월
        await user.click(screen.getByLabelText('Next'));

        repeatEventCell = within(monthView).getByText('30').closest('td')!;
        expect(within(repeatEventCell).getByText('기존 회의2')).toBeInTheDocument();
        expect(within(repeatEventCell).queryByTestId('repeat-icon')).toBeInTheDocument();

        expect(eventList.getByText('기존 회의2')).toBeInTheDocument();
        expect(eventList.getByText('2024-11-30')).toBeInTheDocument();

        // 12월
        await user.click(screen.getByLabelText('Next'));

        repeatEventCell = within(monthView).getByText('31').closest('td')!;
        expect(within(repeatEventCell).getByText('기존 회의2')).toBeInTheDocument();
        expect(within(repeatEventCell).queryByTestId('repeat-icon')).toBeInTheDocument();

        expect(eventList.getByText('기존 회의2')).toBeInTheDocument();
        expect(eventList.getByText('2024-12-31')).toBeInTheDocument();
      });
    });

    describe('주간뷰 + 이벤트 리스트', () => {
      it('주별 뷰 선택 후 새로운 반복 일정 저장시 반복 일정이 이벤트 리스트에 정확히 저장된다', async () => {
        setupMockHandlerRepeatCreation();

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
        expect(within(firstRepeatEventCell).queryByTestId('repeat-icon')).toBeInTheDocument();

        const secondRepeatEventCell = within(weekView).getByText('3').closest('td')!;
        expect(within(secondRepeatEventCell).getByText('기존 회의2')).toBeInTheDocument();
        expect(within(secondRepeatEventCell).queryByTestId('repeat-icon')).toBeInTheDocument();

        const thirdRepeatEventCell = within(weekView).getByText('5').closest('td')!;
        expect(within(thirdRepeatEventCell).getByText('기존 회의2')).toBeInTheDocument();
        expect(within(thirdRepeatEventCell).queryByTestId('repeat-icon')).toBeInTheDocument();

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

    it('반복 종료일이 시작일 전인 경우, 에러 메세지가 표시된다', async () => {
      setupMockHandlerRepeatCreation();

      const { user } = setup(<App />);
      await saveSchedule(user, {
        ...event2,
        date: '2024-10-01',
        repeat: { type: 'daily', interval: 1, endDate: '2024-09-30' },
      });

      expect(screen.getByText('반복 종료일은 해당 이벤트 날짜 이후여야 해요.')).toBeInTheDocument();
    });

    it('반복 일정 삭제시, 해당 일정만 삭제된다.', async () => {
      setupMockHandlerRepeatDeletion();

      const { user } = setup(<App />);
      const eventList = within(screen.getByTestId('event-list'));
      expect(await eventList.findAllByText('기존 회의2')).toHaveLength(3);

      const allDeleteButton = await screen.findAllByLabelText('Delete event');
      await user.click(allDeleteButton[0]);

      expect(eventList.getAllByText('기존 회의2')).toHaveLength(2);
    });
  });
});
