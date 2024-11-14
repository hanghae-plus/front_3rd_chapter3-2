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
});
