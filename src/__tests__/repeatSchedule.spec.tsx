import { ChakraProvider } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactElement } from 'react';

import App from '../App';
import { ScheduleDay } from '../components/calendar/ScheduleDay';
import { Event } from '../types';

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

const setup = (element: ReactElement) => {
  const user = userEvent.setup();

  return { ...render(<ChakraProvider>{element}</ChakraProvider>), user };
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
});
