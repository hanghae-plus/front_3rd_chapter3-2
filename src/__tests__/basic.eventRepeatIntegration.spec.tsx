import { ChakraProvider } from '@chakra-ui/react';
import { Event, EventForm } from '@entities/event/model/types';
import { render, screen, within } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { ReactElement } from 'react';

import { setupMockHandlerCreation } from '../__mocks__/handlersUtils';
import App from '../App';

const setup = (element: ReactElement) => {
  const user = userEvent.setup();

  return { ...render(<ChakraProvider>{element}</ChakraProvider>), user }; // ? Med: 왜 ChakraProvider로 감싸는지 물어보자
};

describe('반복 유형 UI가 올바르게 렌더링되는지 확인', () => {
  it('초기 UI 상태에서 반복 유형 선택을 할 수 없다.', async () => {
    setup(<App />);
    const repeatTypeSelect = screen.queryByLabelText(/반복 유형/);
    const repeatInterval = screen.queryByLabelText(/반복 간격/);
    const repeatEnd = screen.queryByLabelText(/반복 종료일/);

    expect(repeatTypeSelect).not.toBeInTheDocument();
    expect(repeatInterval).not.toBeInTheDocument();
    expect(repeatEnd).not.toBeInTheDocument();
  });

  it('반복 유형 체크시 반복 유형 선택 및 간격 설정 필드가 표시된다.', async () => {
    const { user } = setup(<App />);

    await user.click(screen.getByLabelText(/반복 일정/));

    const repeatTypeSelect = screen.queryByLabelText(/반복 유형/);
    const repeatInterval = screen.queryByLabelText(/반복 간격/);
    const repeatEnd = screen.queryByLabelText(/반복 종료일/);

    expect(repeatTypeSelect).toBeInTheDocument();
    expect(repeatInterval).toBeInTheDocument();
    expect(repeatEnd).toBeInTheDocument();
  });
});

const saveSchedule = async (
  user: UserEvent,
  form: Omit<Event, 'id' | 'notificationTime'> & { repeat: EventForm['repeat'] }
) => {
  const { title, date, startTime, endTime, location, description, category } = form;

  await user.click(screen.getAllByText('일정 추가')[0]);
  await user.click(screen.getByLabelText(/반복 일정/));

  await user.type(screen.getByLabelText('제목'), title);
  await user.type(screen.getByLabelText('날짜'), date);
  await user.type(screen.getByLabelText('시작 시간'), startTime);
  await user.type(screen.getByLabelText('종료 시간'), endTime);
  await user.type(screen.getByLabelText('설명'), description);
  await user.type(screen.getByLabelText('위치'), location);
  await user.selectOptions(screen.getByLabelText('카테고리'), category);
  // await user.selectOptions(screen.getByLabelText(/반복 유형/), repeat.type);
  // await user.type(screen.getByLabelText(/반복 간격/), repeat.interval.toString());
  // await user.type(screen.getByLabelText(/반복 종료일/), repeat.endDate ?? '');

  await user.click(screen.getByTestId('event-submit-button'));
};

describe('반복 일정 생성', () => {
  it('반복 일정 생성 시 반복 유형에 따라 반복 일정이 정확히 생성된다.', async () => {
    setupMockHandlerCreation();
    const { user } = setup(<App />);

    await saveSchedule(user, {
      title: '새 회의',
      date: '2024-10-15',
      startTime: '14:00',
      endTime: '15:00',
      description: '프로젝트 진행 상황 논의',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'daily', interval: 1, endDate: '2024-10-16' },
    });

    const eventList = within(screen.getByTestId('event-list'));
    screen.debug();
    expect(eventList.getByText('새 회의')).toBeInTheDocument();
    expect(eventList.getByText('2024-10-15')).toBeInTheDocument();
    expect(eventList.getByText('14:00 - 15:00')).toBeInTheDocument();
    expect(eventList.getByText('프로젝트 진행 상황 논의')).toBeInTheDocument();
    expect(eventList.getByText('회의실 A')).toBeInTheDocument();
    expect(eventList.getByText('카테고리: 업무')).toBeInTheDocument();
    // expect(eventList.getByText('반복: 1일마다')).toBeInTheDocument();
    // expect(eventList.getByText('종료: 2024-10-16')).toBeInTheDocument();
  });
});
