import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within, act } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { ReactElement } from 'react';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../__mocks__/handlersUtils';
import App from '../App';
import { server } from '../setupTests';
import { Event } from '../types';

// ! Hard 여기 제공 안함
const setup = (element: ReactElement) => {
  const user = userEvent.setup();

  return { ...render(<ChakraProvider>{element}</ChakraProvider>), user }; // ? Med: 왜 ChakraProvider로 감싸는지 물어보자
};

const saveSchedule = async (user: UserEvent, form: Omit<Event, 'id'>) => {
  const {
    title,
    date,
    startTime,
    endTime,
    location,
    description,
    category,
    repeat,
    notificationTime,
  } = form;

  await user.click(screen.getAllByText('일정 추가')[0]);

  await user.type(screen.getByLabelText('제목'), title);
  await user.type(screen.getByLabelText('날짜'), date);
  await user.type(screen.getByLabelText('시작 시간'), startTime);
  await user.type(screen.getByLabelText('종료 시간'), endTime);
  await user.type(screen.getByLabelText('설명'), description);
  await user.type(screen.getByLabelText('위치'), location);

  await user.selectOptions(screen.getByLabelText('카테고리'), category);

  await user.click(screen.getByLabelText('반복 설정'));
  await user.selectOptions(screen.getByLabelText('반복 유형'), repeat.type);
  await user.clear(screen.getByLabelText('반복 간격'));
  await user.type(screen.getByLabelText('반복 간격'), repeat.interval.toString());
  await user.clear(screen.getByLabelText('반복 종료일'));
  await user.type(screen.getByLabelText('반복 종료일'), repeat.endDate || '');

  await user.selectOptions(screen.getByLabelText('알림 설정'), notificationTime.toString());

  await user.click(screen.getByTestId('event-submit-button'));
};

describe('반복 일정 CRUD 및 기본 기능', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime('2024-11-20T00:00:00');
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('일정 생성 시 반복 유형을 선택할 수 있다.', async () => {
    setupMockHandlerCreation();

    const { user } = setup(<App />);

    await saveSchedule(user, {
      title: '새 회의A',
      date: '2024-11-15',
      startTime: '14:00',
      endTime: '15:00',
      description: '프로젝트 진행 상황 논의',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'daily', interval: 1, endDate: '2024-11-25' },
      notificationTime: 10,
    });

    await screen.findByText('일정이 추가되었습니다.');

    const eventList = within(screen.getByTestId('event-list'));

    expect(eventList.getByText('새 회의A')).toBeInTheDocument();
    expect(eventList.getByText(/반복: 1일마다 \(종료: 2024-11-25\)/)).toBeInTheDocument();
  });
});
