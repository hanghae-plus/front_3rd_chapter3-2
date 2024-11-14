import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within, act, fireEvent } from '@testing-library/react';
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
import { server } from '../setupTests';
import { Event } from '../types';
import { desc } from 'framer-motion/client';
import { useEventForm } from '../hooks/useEventForm';

// ! Hard 여기 제공 안함
const setup = (element: ReactElement) => {
  const user = userEvent.setup();

  return { ...render(<ChakraProvider>{element}</ChakraProvider>), user }; // ? Med: 왜 ChakraProvider로 감싸는지 물어보자
};
// ! Hard 여기 제공 안함
const saveSchedule = async (
  user: UserEvent,
  form: Omit<Event, 'id' | 'notificationTime' | 'repeat'>
) => {
  const { title, date, startTime, endTime, location, description, category } = form;

  await user.click(screen.getAllByText('일정 추가')[0]);

  await user.type(screen.getByLabelText('제목'), title);
  await user.type(screen.getByLabelText('날짜'), date);
  await user.type(screen.getByLabelText('시작 시간'), startTime);
  await user.type(screen.getByLabelText('종료 시간'), endTime);
  await user.type(screen.getByLabelText('설명'), description);
  await user.type(screen.getByLabelText('위치'), location);
  await user.selectOptions(screen.getByLabelText('카테고리'), category);

  await user.click(screen.getByTestId('event-submit-button'));
};

describe('반복 유형 선택', () => {
  it('일정 생성 또는 수정 시 반복 유형을 선택할 수 있다.', () => {
    const { user } = setup(<App />);
    user.click(screen.getByText('반복 일정'));

    // 반복 유형이 화면에 나타나는지 확인한다.
    expect(screen.getByText('반복 유형')).toBeInTheDocument();
  });

  it('일정 생성 시 매일 반복 유형을 선택할 수 있다.', async () => {
    const { user } = setup(<App />);
    user.click(screen.getByText('반복 일정'));

    const repeatTypeSelect = screen.getByLabelText('반복 유형');
    const dailyOption = screen.getByRole('option', { name: '매일' }) as HTMLOptionElement;

    await userEvent.selectOptions(repeatTypeSelect, 'daily');

    expect(dailyOption.selected).toBeTruthy();
  });

  it('일정 생성 시 매주 반복 유형을 선택할 수 있다.', async () => {
    const { user } = setup(<App />);
    user.click(screen.getByText('반복 일정'));

    const repeatTypeSelect = screen.getByLabelText('반복 유형');
    const weeklyOption = screen.getByRole('option', { name: '매주' }) as HTMLOptionElement;

    await userEvent.selectOptions(repeatTypeSelect, 'weekly');

    expect(weeklyOption.selected).toBeTruthy();
  });

  it('일정 생성 시 매월 반복 유형을 선택할 수 있다.', async () => {
    const { user } = setup(<App />);
    user.click(screen.getByText('반복 일정'));

    const repeatTypeSelect = screen.getByLabelText('반복 유형');
    const monthlyOption = screen.getByRole('option', { name: '매월' }) as HTMLOptionElement;

    await userEvent.selectOptions(repeatTypeSelect, 'monthly');

    expect(monthlyOption.selected).toBeTruthy();
  });
  it('일정 생성 시 매년 반복 유형을 선택할 수 있다.', async () => {
    const { user } = setup(<App />);
    user.click(screen.getByText('반복 일정'));

    const repeatTypeSelect = screen.getByLabelText('반복 유형');
    const yearlyOption = screen.getByRole('option', { name: '매년' }) as HTMLOptionElement;

    await userEvent.selectOptions(repeatTypeSelect, 'yearly');

    expect(yearlyOption.selected).toBeTruthy();
  });
});
describe('반복 간격 설정', () => {
  //각 반복 유형에 대해 간격을 설정할 수 있다.
  //예: 2일마다, 3주마다, 2개월마다 등

  it('매일 반복 시 간격을 설정할 수 있다.', async () => {
    const { user } = setup(<App />);
    user.click(screen.getByText('반복 일정'));

    const intervalInput = screen.getByLabelText('반복 간격');
    await user.type(intervalInput, '3');

    expect(intervalInput).toHaveValue(3);
  });
  it('간격 입력이 정수가 아니면 에러를 표시해야 한다', async () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    const { user } = setup(<App />);

    const repeatCheckbox = screen.getByLabelText('반복 일정');
    user.click(repeatCheckbox);

    const repeatIntervalInput = screen.getByLabelText('반복 간격');
    await user.type(repeatIntervalInput, '5.5');

    // 에러 메시지가 화면에 나타나는지 확인
    expect(screen.getByText('반복 주기는 정수로 입력해주세요.')).toBeInTheDocument();
  });
});

// 3. 반복 일정 표시
describe('반복 일정 표시', () => {
  it('반복 일정에 아이콘이 표시되어야 한다', async () => {
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

// 4. 반복 종료 조건 설정
describe('반복 종료 조건 설정', () => {
  it('반복 일정 설정 시, 반복 종료일 날짜 입력 필드가 표시되어야 한다', () => {
    const { user } = setup(<App />);
    const repeatCheckbox = screen.getByLabelText('반복 일정');
    user.click(repeatCheckbox);

    const endConditionDateInput = screen.getByLabelText('반복 종료일');

    expect(endConditionDateInput).toBeInTheDocument();
  });

  it('반복 일정 설정 시, 횟수 입력 필드가 표시되어야 한다', () => {
    const { user } = setup(<App />);
    const repeatCheckbox = screen.getByLabelText('반복 일정');
    user.click(repeatCheckbox);

    const endConditionCountInput = screen.getByLabelText('반복 횟수');

    expect(endConditionCountInput).toBeInTheDocument();
  });
});

// 5. 반복 일정 단일 수정
describe('반복 일정 단일 수정', () => {
  it('반복 일정을 수정하면 단일 일정으로 변경되고 아이콘이 사라져야 한다', async () => {
    const mockEvents: Event[] = [
      {
        id: '1',
        title: '팀 회의',
        date: '2024-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'weekly', interval: 1, count: 2 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '팀 회의',
        date: '2024-10-22',
        startTime: '09:00',
        endTime: '10:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'weekly', interval: 1, count: 2 },
        notificationTime: 10,
      },
    ];
    setupMockHandlerCreation(mockEvents);

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: mockEvents });
      }),
      http.put('/api/events/:id', async ({ params, request }) => {
        const { id } = params;
        const updatedEvent = (await request.json()) as Event;
        const index = mockEvents.findIndex((event) => event.id === id);

        mockEvents[index] = { ...mockEvents[index], ...updatedEvent };
        return HttpResponse.json(mockEvents[index]);
      })
    );

    const { user } = setup(<App />);
    // ! 일정 로딩 완료 후 테스트
    await screen.findByText('일정 로딩 완료!');
    const eventList = screen.getByTestId('event-list');
    // 반복일정인지 확인
    const repeatIcon = within(eventList).getByTestId('repeat-icon-1');
    const repeatIcon2 = within(eventList).getByTestId('repeat-icon-2');
    expect(repeatIcon).toBeInTheDocument();
    expect(repeatIcon2).toBeInTheDocument();

    const editButton = (await screen.findAllByLabelText('Edit event'))[0];
    await user.click(editButton);

    await user.clear(screen.getByLabelText('제목'));
    await user.type(screen.getByLabelText('제목'), '수정된 회의');
    await user.clear(screen.getByLabelText('설명'));
    await user.type(screen.getByLabelText('설명'), '회의 내용 변경');

    await user.click(screen.getByTestId('event-submit-button'));
    screen.debug(eventList);
    expect(within(eventList).getByText('수정된 회의')).toBeInTheDocument();
    expect(within(eventList).getByText('회의 내용 변경')).toBeInTheDocument();

    // 수정된 일정 id=1은 반복해제, id=2는 반복 그대로
    expect(repeatIcon).not.toBeInTheDocument();
    expect(repeatIcon2).toBeInTheDocument();
  });
});

// 6. 반복 일정 단일 삭제
describe('반복 일정 단일 삭제', () => {
  it('반복 일정을 단일 삭제하면 해당 일정만 삭제되어야 한다', async () => {
    const mockEvents: Event[] = [
      {
        id: '1',
        title: '팀 회의',
        date: '2024-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'weekly', interval: 1, count: 2 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '팀 회의',
        date: '2024-10-22',
        startTime: '09:00',
        endTime: '10:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'weekly', interval: 1, count: 2 },
        notificationTime: 10,
      },
    ];
    setupMockHandlerCreation(mockEvents);

    const { user } = setup(<App />);

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: mockEvents });
      }),
      http.delete('/api/events/:id', ({ params }) => {
        const { id } = params;
        const index = mockEvents.findIndex((event) => event.id === id);

        mockEvents.splice(index, 1);
        return new HttpResponse(null, { status: 204 });
      })
    );
    // 삭제 버튼 클릭
    const allDeleteButton = await screen.findAllByLabelText('Delete event');
    await user.click(allDeleteButton[0]);
    const eventList = within(screen.getByTestId('event-list'));
    // 모든 반복이벤트가 지워지지않았는지 확인(same title)
    expect(eventList.getByText('팀 회의')).toBeInTheDocument();
    // 첫 번째 이벤트가 더 이상 화면에 존재하지 않는지 확인
    expect(eventList.queryByText('2024-10-15')).not.toBeInTheDocument();
    // 두 번째 이벤트는 여전히 존재하는지 확인
    expect(eventList.getByText('2024-10-22')).toBeInTheDocument();
  });
});
