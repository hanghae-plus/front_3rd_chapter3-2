import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within, act } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { ReactElement } from 'react';
import { Mock } from 'vitest';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../__mocks__/handlersUtils';
import App from '../App';
import { useEventForm } from '../hooks/useEventForm';
import { server } from '../setupTests';
import { Event } from '../types';

// ! Hard 여기 제공 안함
const setup = (element: ReactElement) => {
  const user = userEvent.setup();

  return { ...render(<ChakraProvider>{element}</ChakraProvider>), user }; // ? Med: 왜 ChakraProvider로 감싸는지 물어보자
};

// ! Hard 여기 제공 안함
const saveSchedule = async (user: UserEvent, form: Event) => {
  const {
    title,
    date,
    startTime,
    endTime,
    location,
    description,
    category,
    notificationTime,
    repeat,
  } = form;

  await user.click(screen.getAllByText('일정 추가')[0]);

  await user.type(screen.getByLabelText('제목'), title);
  await user.type(screen.getByLabelText('날짜'), date);
  await user.type(screen.getByLabelText('시작 시간'), startTime);
  await user.type(screen.getByLabelText('종료 시간'), endTime);
  await user.type(screen.getByLabelText('설명'), description);
  await user.type(screen.getByLabelText('위치'), location);
  await user.selectOptions(screen.getByLabelText('카테고리'), category);
  await user.selectOptions(screen.getByLabelText('반복 유형'), repeat.type);
  await user.type(screen.getByLabelText('반복 간격'), repeat.interval.toString());
  await user.type(screen.getByLabelText('반복 종료일'), repeat.endDate ?? '');

  await user.click(screen.getByTestId('event-submit-button'));
};

// 1. 반복 유형 선택
describe('반복 유형 선택', () => {
  it('반복 유형 옵션이 올바르게 렌더링되어야 한다', () => {
    const { user } = setup(<App />);
    const repeatCheckbox = screen.getByLabelText('반복 설정');
    user.click(repeatCheckbox);

    const repeatTypeSelect = screen.getByLabelText('반복 유형');
    expect(repeatTypeSelect).toBeInTheDocument();

    expect(screen.getByText('매일')).toBeInTheDocument();
    expect(screen.getByText('매주')).toBeInTheDocument();
    expect(screen.getByText('매월')).toBeInTheDocument();
    expect(screen.getByText('매년')).toBeInTheDocument();
  });

  it('사용자가 반복 유형으로 "매주"를 선택하면 반복 유형이 "매주"로 업데이트되어야 한다', async () => {
    const { user } = setup(<App />);
    const repeatCheckbox = screen.getByLabelText('반복 설정');
    user.click(repeatCheckbox);

    const repeatTypeSelect = screen.getByLabelText('반복 유형');
    const defaultOption = screen.getByRole('option', { name: '매일' }) as HTMLOptionElement;
    const selectedOption = screen.getByRole('option', { name: '매주' }) as HTMLOptionElement;

    await userEvent.selectOptions(repeatTypeSelect, 'weekly');

    expect(defaultOption.selected).toBeFalsy();
    expect(selectedOption.selected).toBeTruthy();
  });

  // 2. 반복 간격 설정
  describe('반복 간격 설정', () => {
    it('각 반복 유형에 대해 올바른 간격을 설정할 수 있어야 한다', async () => {
      const { user } = setup(<App />);
      const repeatCheckbox = screen.getByLabelText('반복 일정');
      user.click(repeatCheckbox);

      const repeatIntervalInput = screen.getByLabelText('반복 간격');
      await user.type(repeatIntervalInput, '3');

      expect(repeatIntervalInput).toHaveValue(3);
    });

    it('간격 입력이 정수가 아니면 에러를 표시해야 한다', async () => {
      const { user } = setup(<App />);
      const repeatCheckbox = screen.getByLabelText('반복 일정');
      user.click(repeatCheckbox);

      const repeatIntervalInput = screen.getByLabelText('반복 간격');
      await user.type(repeatIntervalInput, '1.5');
      expect(screen.getByText('반복 간격은 1 이상의 정수여야 합니다.')).toBeInTheDocument();
    });
  });
});

// 3. 반복 일정 표시
describe('반복 일정 표시', () => {
  it('반복 일정에는 "repeat" 아이콘이 표시되어야 한다', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '팀 회의',
        date: '2024-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'weekly', interval: 1 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '프로젝트 계획',
        date: '2024-10-16',
        startTime: '14:00',
        endTime: '15:00',
        description: '새 프로젝트 계획 수립',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
    ]);
    setup(<App />);
    // ! 일정 로딩 완료 후 테스트
    await screen.findByText('일정 로딩 완료!');
    const eventList = screen.getByTestId('event-list');
    const repeatIcon = within(eventList).getByTestId('repeat-icon-1');
    expect(repeatIcon).toBeInTheDocument();
    // 반복이 아닌 일정에는 아이콘이 없어야 함
    expect(within(eventList).queryByTestId('repeat-icon-2')).not.toBeInTheDocument();
  });
});
