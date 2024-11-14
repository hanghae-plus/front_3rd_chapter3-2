import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, waitFor, within } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { ReactElement } from 'react';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../__mocks__/handlersUtils';
import App from '../App';
import { Event } from '../types';

const setup = (element: ReactElement) => {
  const user = userEvent.setup();

  return { ...render(<ChakraProvider>{element}</ChakraProvider>), user };
};

const saveSchedule = async (user: UserEvent, form: Omit<Event, 'id' | 'notificationTime'>) => {
  const { title, date, startTime, endTime, location, description, category, repeat } = form;

  await user.type(screen.getByLabelText('제목'), title);
  await user.type(screen.getByLabelText('날짜'), date);
  await user.type(screen.getByLabelText('시작 시간'), startTime);
  await user.type(screen.getByLabelText('종료 시간'), endTime);
  await user.type(screen.getByLabelText('설명'), description);
  await user.type(screen.getByLabelText('위치'), location);
  await user.selectOptions(screen.getByLabelText('카테고리'), category);
  await user.selectOptions(screen.getByLabelText('반복 유형'), repeat.type);
  await user.type(screen.getByLabelText('반복 간격'), repeat.interval.toString());

  if (repeat.endDate) {
    await user.type(screen.getByLabelText('반복 종료일'), repeat.endDate);
  }

  await user.click(screen.getByTestId('event-submit-button'));
};

describe('반복 유형 선택', () => {
  it('일정 생성 시 반복 유형을 선택할 수 있다.', async () => {
    const { user } = setup(<App />);

    setupMockHandlerCreation();

    await saveSchedule(user, {
      title: '새 회의',
      date: '2024-10-15',
      startTime: '14:00',
      endTime: '15:00',
      description: '프로젝트 진행 상황 논의',
      location: '회의실 A',
      category: '업무',
      repeat: {
        type: 'daily',
        interval: 10,
        endDate: '2024-11-15',
      },
    });

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('새 회의')).toBeInTheDocument();
    expect(eventList.getByText('2024-10-15')).toBeInTheDocument();
    expect(eventList.getByText('14:00 - 15:00')).toBeInTheDocument();
    expect(eventList.getByText('프로젝트 진행 상황 논의')).toBeInTheDocument();
    expect(eventList.getByText('회의실 A')).toBeInTheDocument();
    expect(eventList.getByText('카테고리: 업무')).toBeInTheDocument();
    expect(eventList.getByText('2024-11-15까지 10일 마다 반복')).toBeInTheDocument();
  });

  it('일정 수정 시 반복 유형을 선택할 수 있다.', async () => {
    const { user } = setup(<App />);

    setupMockHandlerUpdating();

    const [editButton] = await screen.findAllByLabelText('Edit event');
    await user.click(editButton);

    // 임시
    const repeatFlag = screen.getByText('반복 일정');
    await user.click(repeatFlag);

    // 2. 일정 수정
    await user.clear(screen.getByLabelText('제목'));
    await user.type(screen.getByLabelText('제목'), '수정된 회의');
    await user.selectOptions(screen.getByLabelText('반복 유형'), 'weekly');
    await user.type(screen.getByLabelText('반복 간격'), String(5));
    await user.type(screen.getByLabelText('반복 종료일'), '2024-11-20');

    await user.click(screen.getByTestId('event-submit-button'));

    const [afterEditButton] = await screen.findAllByLabelText('Edit event');
    await user.click(afterEditButton);

    // 임시
    const afterRepeatFlag = screen.getByText('반복 일정');
    await user.click(afterRepeatFlag);

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getAllByText('수정된 회의')[0]).toBeInTheDocument();
    expect(eventList.getAllByText('2024-10-15')[0]).toBeInTheDocument();
    expect(eventList.getAllByText('09:00 - 10:00')[0]).toBeInTheDocument();
    expect(eventList.getAllByText('기존 팀 미팅')[0]).toBeInTheDocument();
    expect(eventList.getAllByText('회의실 B')[0]).toBeInTheDocument();
    expect(eventList.getAllByText('카테고리: 업무')[0]).toBeInTheDocument();
    expect(eventList.getByText('2024-11-20까지 5주 마다 반복')).toBeInTheDocument();
  });

  it('일정 생성 시 매일, 매주, 매월, 매년 반복 유형을 선택할 수 있다.', async () => {
    const { user } = setup(<App />);
    setupMockHandlerCreation();

    // 매일 반복
    await saveSchedule(user, {
      title: '매일 미팅',
      date: '2024-10-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '데일리 스탠드업 미팅',
      location: '온라인',
      category: '업무',
      repeat: {
        type: 'daily',
        interval: 1,
        endDate: '2024-10-31',
      },
    });

    let eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('매일 미팅')).toBeInTheDocument();
    expect(eventList.getAllByText('1일 마다')[0]).toBeInTheDocument();

    // 매주 반복
    await saveSchedule(user, {
      title: '주간 회의',
      date: '2024-10-01',
      startTime: '14:00',
      endTime: '15:00',
      description: '주간 진행 상황 공유',
      location: '회의실 B',
      category: '업무',
      repeat: {
        type: 'weekly',
        interval: 1,
        endDate: '2024-12-01',
      },
    });

    eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('주간 회의')).toBeInTheDocument();
    expect(eventList.getByText('1주 마다')).toBeInTheDocument();

    // 매월 반복
    await saveSchedule(user, {
      title: '월간 보고',
      date: '2024-10-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '월간 성과 보고',
      location: '본사',
      category: '업무',
      repeat: {
        type: 'monthly',
        interval: 1,
        endDate: '2025-10-01',
      },
    });

    eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('월간 보고')).toBeInTheDocument();
    expect(eventList.getByText('1개월 마다')).toBeInTheDocument();

    // 매년 반복
    await saveSchedule(user, {
      title: '연례 회의',
      date: '2024-10-01',
      startTime: '10:00',
      endTime: '12:00',
      description: '연간 목표 설정',
      location: '컨퍼런스 룸',
      category: '업무',
      repeat: {
        type: 'yearly',
        interval: 1,
        endDate: '2027-10-01',
      },
    });

    eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('연례 회의')).toBeInTheDocument();
    expect(eventList.getByText('1년 마다')).toBeInTheDocument();
  });

  it('윤년 2월 29일에 매년 반복 일정을 설정할 수 있다.', async () => {
    const { user } = setup(<App />);
    setupMockHandlerCreation();

    await saveSchedule(user, {
      title: '윤년 회의',
      date: '2024-02-29',
      startTime: '10:00',
      endTime: '12:00',
      description: '특별 윤년 행사',
      location: '온라인',
      category: '행사',
      repeat: {
        type: 'yearly',
        interval: 1,
        endDate: '2028-02-29',
      },
    });

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('윤년 회의')).toBeInTheDocument();
    expect(eventList.getByText('매년 반복')).toBeInTheDocument();
    expect(eventList.getByText('2월 29일')).toBeInTheDocument();

    // 윤년이 아닌 연도에는 2월 28일로 대체되었는지 확인
    const nonLeapYearEvent = within(screen.getByTestId('non-leap-year-event'));
    expect(nonLeapYearEvent.getByText('2월 28일')).toBeInTheDocument();
  });

  it('매월 반복 일정을 31일로 설정할 때, 31일이 없는 달에 대해 처리할 수 있다.', async () => {
    const { user } = setup(<App />);
    setupMockHandlerCreation();

    await saveSchedule(user, {
      title: '월말 보고서',
      date: '2024-01-31',
      startTime: '10:00',
      endTime: '11:00',
      description: '월말 업무 보고서 제출',
      location: '본사',
      category: '업무',
      repeat: {
        type: 'monthly',
        interval: 1,
        endDate: '2024-12-31',
      },
    });

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('월말 보고서')).toBeInTheDocument();
    expect(eventList.getByText('매월 반복')).toBeInTheDocument();

    // 31일이 없는 달은 해당 월의 마지막 날로 대체되었는지 확인
    const adjustedDate = within(screen.getByTestId('adjusted-date-event'));
    expect(adjustedDate.getByText('2월 29일')).toBeInTheDocument(); // 윤년인 경우 2월 29일
    expect(adjustedDate.getByText('4월 30일')).toBeInTheDocument(); // 4월, 6월, 9월, 11월 등 31일이 없는 월
  });
});

describe('반복 간격 설정', () => {
  it('매일 유형에 대해 반복 간격을 설정할 수 있다.', async () => {
    const { user } = setup(<App />);
    setupMockHandlerCreation();

    await saveSchedule(user, {
      title: '반복 회의',
      date: '2024-10-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 보고 회의',
      location: '회의실 B',
      category: '업무',
      repeat: {
        type: 'daily',
        interval: 2,
        endDate: '2024-12-15',
      },
    });

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('반복 회의')).toBeInTheDocument();
    expect(eventList.getByText('2일 마다')).toBeInTheDocument();
  });

  it('매주 유형에 대해 반복 간격을 설정할 수 있다.', async () => {
    const { user } = setup(<App />);
    setupMockHandlerCreation();

    await saveSchedule(user, {
      title: '반복 회의',
      date: '2024-10-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 보고 회의',
      location: '회의실 B',
      category: '업무',
      repeat: {
        type: 'weekly',
        interval: 2,
        endDate: '2024-12-15',
      },
    });

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('반복 회의')).toBeInTheDocument();
    expect(eventList.getByText('2주 마다')).toBeInTheDocument();
  });

  it('매달 유형에 대해 반복 간격을 설정할 수 있다.', async () => {
    const { user } = setup(<App />);
    setupMockHandlerCreation();

    await saveSchedule(user, {
      title: '반복 회의',
      date: '2024-10-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 보고 회의',
      location: '회의실 B',
      category: '업무',
      repeat: {
        type: 'monthly',
        interval: 2,
        endDate: '2026-12-15',
      },
    });

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('반복 회의')).toBeInTheDocument();
    expect(eventList.getByText('2개월 마다')).toBeInTheDocument();
  });
});

describe('반복 일정 표시', () => {
  it('반복 일정 캘린더 뷰에서 시각적으로 구분할 수 있다.', async () => {
    const { user } = setup(<App />);
    setupMockHandlerCreation();

    await saveSchedule(user, {
      title: '업무 회의',
      date: '2024-10-15',
      startTime: '14:00',
      endTime: '15:00',
      description: '월간 업무 회의',
      location: '회의실 A',
      category: '업무',
      repeat: {
        type: 'monthly',
        interval: 1,
        endDate: '2025-01-15',
      },
    });

    // 캘린더에서 반복 일정에 아이콘으로 표시 확인
    const calendarView = screen.getByTestId('calendar-view');
    const repeatedEvent = within(calendarView).getByText('업무 회의');
    expect(repeatedEvent).toBeInTheDocument();
    expect(repeatedEvent.closest('.repeat-icon')).toBeInTheDocument();
  });
});

describe('반복 종료', () => {
  it('반복 종료 조건 설정이 가능하다.', async () => {
    const { user } = setup(<App />);
    setupMockHandlerCreation();

    await saveSchedule(user, {
      title: '월간 리뷰',
      date: '2024-10-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '월간 리뷰 미팅',
      location: '온라인',
      category: '리뷰',
      repeat: {
        type: 'monthly',
        interval: 1,
        endDate: '2025-06-30',
      },
    });

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('월간 리뷰')).toBeInTheDocument();
    expect(eventList.getByText('2025-06-30까지')).toBeInTheDocument();
  });
});

describe('반복 일정 단일 수정', () => {
  it('반복 일정을 수정하면 단일 일정으로 수정되며, 반복 아이콘이 사라진다.', async () => {
    const { user } = setup(<App />);
    setupMockHandlerUpdating();

    const [editButton] = await screen.findAllByLabelText('Edit event');
    await user.click(editButton);

    await user.clear(screen.getByLabelText('제목'));
    await user.type(screen.getByLabelText('제목'), '수정된 월간 리뷰');
    await user.click(screen.getByTestId('event-submit-button'));

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('수정된 월간 리뷰')).toBeInTheDocument();
    expect(screen.queryByTestId('repeat-icon')).not.toBeInTheDocument();
  });
});

describe('반복 일정 단일 삭제', () => {
  it('반복 일정을 삭제하면 해당 일정만 삭제된다.', async () => {
    const { user } = setup(<App />);
    setupMockHandlerDeletion();

    const [deleteButton] = await screen.findAllByLabelText('Delete event');
    await user.click(deleteButton);

    const eventList = screen.getByTestId('event-list');
    expect(within(eventList).queryByText('수정된 월간 리뷰')).not.toBeInTheDocument();
  });
});
