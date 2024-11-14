/*
  1. **(필수) 반복 유형 선택**
      - 일정 생성 또는 수정 시 반복 유형을 선택할 수 있다.
      - 반복 유형은 다음과 같다: 매일, 매주, 매월, 매년
          - 만약, 윤년 29일에 또는 31일에 매월 또는 매년 반복일정을 설정한다면 어떻게 처리할까요? 다른 서비스를 참고해보시고 자유롭게 작성해보세요.
  2. **(필수) 반복 간격 설정**
      - 각 반복 유형에 대해 간격을 설정할 수 있다.
      - 예: 2일마다, 3주마다, 2개월마다 등
  3. **(필수) 반복 일정 표시**
      - 캘린더 뷰에서 반복 일정을 시각적으로 구분하여 표시한다.
          - 아이콘을 넣든 태그를 넣든 자유롭게 해보세요!
  4. **(필수) 반복 종료**
      - 반복 종료 조건을 지정할 수 있다.
      - 옵션: 특정 날짜까지, 특정 횟수만큼, 또는 종료 없음 (예제 특성상, 2025-06-30까지)
  5. **(필수) 반복 일정 단일 수정**
      - 반복일정을 수정하면 단일 일정으로 변경됩니다.
      - 반복일정 아이콘도 사라집니다.
  6. **(필수)**  **반복 일정 단일 삭제**
      - 반복일정을 삭제하면 해당 일정만 삭제합니다.
**/

import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { ReactElement } from 'react';

import App from '../App';
import { EventForm } from '../types';
import { basicEvent } from './dummies/event';
import { setupMockHandlerCreation } from '../__mocks__/handlersUtils';

const setup = (element: ReactElement) => {
  const user = userEvent.setup();

  return { ...render(<ChakraProvider>{element}</ChakraProvider>), user };
};

const addEvent = async (user: UserEvent, form: Omit<EventForm, 'id' | 'notificationTime'>) => {
  const { title, date, startTime, endTime, location, description, category, repeat } = form;

  await user.click(screen.getAllByText('일정 추가')[0]);

  await user.type(screen.getByLabelText('제목'), title);
  await user.type(screen.getByLabelText('날짜'), date);
  await user.type(screen.getByLabelText('시작 시간'), startTime);
  await user.type(screen.getByLabelText('종료 시간'), endTime);
  await user.type(screen.getByLabelText('설명'), description);
  await user.type(screen.getByLabelText('위치'), location);
  await user.selectOptions(screen.getByLabelText('카테고리'), category);
  // await user.selectOptions(screen.getByLabelText('반복 유형'), repeat.type);
  // await user.type(screen.getByLabelText('반복 간격'), repeat.interval.toString());
  // await user.type(screen.getByLabelText('반복 종료일'), String(repeat.endDate));
  await user.click(screen.getByTestId('event-submit-button'));
};

beforeEach(() => {});
describe('반복 유형 선택', () => {
  it('반복 일정 체크 시 하위 메뉴로 반복 유형이 출력된다.', async () => {
    const { user } = setup(<App />);

    // 쿼링의 세가지 방법 : getByRole, getByText, getByTestId
    // 01. 초기 체크 여부 확인
    const checkbox = screen.getByRole('checkbox', { name: 'repeat setting' });
    expect(checkbox).toBeChecked();

    // 02. 체크 -> 반복 유형 없는 거 확인
    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
    expect(screen.queryByLabelText('반복 유형')).not.toBeInTheDocument();

    // 03. 체크 -> 반복 유형 있는 거 확인
    await user.click(checkbox);
    expect(screen.queryByLabelText('반복 유형')).toBeInTheDocument();
  });

  it('일정 생성 시 반복 유형을 선택할 수 있다.', async () => {
    const { user } = setup(<App />);

    const selectElement = screen.getByRole('combobox', { name: '반복 유형' });
    // 각 옵션 선택하고 값을 확인
    await user.selectOptions(selectElement, 'daily');
    expect(screen.getByText('매일')).toBeInTheDocument();
    await user.selectOptions(selectElement, 'weekly');
    expect(screen.getByText('매주')).toBeInTheDocument();
    await user.selectOptions(selectElement, 'monthly');
    expect(screen.getByText('매월')).toBeInTheDocument();
    await user.selectOptions(selectElement, 'yearly');
    expect(screen.getByText('매년')).toBeInTheDocument();
  });

  it('일정 수정 시 반복 유형을 선택할 수 있다.', async () => {
    setupMockHandlerCreation([]);
    const { user } = setup(<App />);

    // 01. 이벤트 추가
    await addEvent(user, basicEvent);

    // 02. 수정 상태 변경
    const editIcon = screen.getAllByRole('button', { name: 'Edit event' })[0];
    await user.click(editIcon);
    const titleElement = screen.getByRole('heading', {
      name: '일정 수정',
      level: 2,
    });
    expect(titleElement).toBeDefined();

    // 03. 반복 유형 설정
    const checkbox = screen.getByRole('checkbox', { name: 'repeat setting' });
    await user.click(checkbox);
    const selectElement = screen.getByRole('combobox', { name: '반복 유형' });
    // 각 옵션 선택하고 값을 확인
    await user.selectOptions(selectElement, 'daily');
    expect(screen.getByRole('option', { name: '매일' })).toBeInTheDocument();
    await user.selectOptions(selectElement, 'weekly');
    expect(screen.getByRole('option', { name: '매주' })).toBeInTheDocument();
    await user.selectOptions(selectElement, 'monthly');
    expect(screen.getByRole('option', { name: '매월' })).toBeInTheDocument();
    await user.selectOptions(selectElement, 'yearly');
    expect(screen.getByRole('option', { name: '매년' })).toBeInTheDocument();
  });
});

describe('반복 간격 설정', () => {
  // 예: 2일마다, 3주마다, 2개월마다 등
  it('반복 일정 체크 시 하위 메뉴로 반복 간격이 출력된다.', async () => {
    const { user } = setup(<App />);

    // 01. 초기 체크 여부 확인
    const checkbox = screen.getByRole('checkbox', { name: 'repeat setting' });
    expect(checkbox).toBeChecked();

    // 02. 체크 -> 반복 간격 없는 거 확인
    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
    expect(screen.queryByLabelText('반복 간격')).not.toBeInTheDocument();

    // 03. 체크 -> 반복 간격 있는 거 확인
    await user.click(checkbox);
    expect(screen.queryByLabelText('반복 간격')).toBeInTheDocument();
  });

  it('일정 생성 시 반복 간격을 선택할 수 있다.', async () => {
    const { user } = setup(<App />);

    // 01. 초기값 확인
    const inputElement = screen.getByRole('spinbutton', { name: '반복 간격' });
    expect(inputElement).toHaveValue(1);
    await user.clear(inputElement);

    // 02. 값이 정상적으로 입력되는 지 확인
    await user.type(inputElement, '1');
    expect(inputElement).toHaveValue(1);
    await user.clear(inputElement);
    await user.type(inputElement, '365');
    expect(inputElement).toHaveValue(365);
    await user.clear(inputElement);
  });

  it('일정 수정 시 반복 간격을 선택할 수 있다.', async () => {
    setupMockHandlerCreation([]);
    const { user } = setup(<App />);

    // 01. 이벤트 추가
    await addEvent(user, basicEvent);

    // 02. 수정 상태 변경
    const editIcon = screen.getAllByRole('button', { name: 'Edit event' })[0];
    await user.click(editIcon);
    const titleElement = screen.getByRole('heading', {
      name: '일정 수정',
      level: 2,
    });
    expect(titleElement).toBeDefined();

    // 03. 초기값 확인
    const checkbox = screen.getByRole('checkbox', { name: 'repeat setting' });
    await user.click(checkbox);
    const inputElement = screen.getByRole('spinbutton', { name: '반복 간격' });
    expect(inputElement).toHaveValue(1);
    await user.clear(inputElement);

    // 04. 반복 간격 설정
    await user.type(inputElement, '1');
    expect(inputElement).toHaveValue(1);
    await user.clear(inputElement);
    await user.type(inputElement, '365');
    expect(inputElement).toHaveValue(365);
    await user.clear(inputElement);
  });
});

describe('반복 종료 설정', () => {
  // 옵션: 특정 날짜까지, 특정 횟수만큼, 또는 종료 없음 (예제 특성상, 2025-06-30까지)
  // => 기본값(종료일 설정)만 진행하겠습니다...ㅠ
  it('반복 일정 체크 시 하위 메뉴로 반복 종료일이 출력된다.', async () => {
    const { user } = setup(<App />);

    // 01. 초기 체크 여부 확인
    const checkbox = screen.getByRole('checkbox', { name: 'repeat setting' });
    expect(checkbox).toBeChecked();

    // 02. 체크 -> 반복 종료일 없는 거 확인
    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
    expect(screen.queryByLabelText('반복 종료일')).not.toBeInTheDocument();

    // 03. 체크 -> 반복 종료일 있는 거 확인
    await user.click(checkbox);
    expect(screen.queryByLabelText('반복 종료일')).toBeInTheDocument();
  });

  it('일정 생성 시 반복 종료일을 선택할 수 있다.', async () => {
    const { user } = setup(<App />);

    // 01. 초기값 확인
    // const inputElement = screen.getByRole('input', { name: '반복 종료일' }); // 얘 왜 안잡힐까요 ㅠㅠ
    const inputElement = screen.getByTestId('test001');

    // 02. 값이 정상적으로 입력되는 지 확인
    await user.type(inputElement, '2025-01-01');
    expect(inputElement).toHaveValue('2025-01-01');
    await user.clear(inputElement);
    await user.type(inputElement, '2024-12-31');
    expect(inputElement).toHaveValue('2024-12-31');
    await user.clear(inputElement);
  });
});

describe('반복 일정 표시', () => {
  // 기본 동작 테스트
  it('3일 연속 반복하는 일정을 추가한다.', () => {
    setupMockHandlerCreation([]);
    const { user } = setup(<App />);

    const event: EventForm = {
      title: '3일 반복 테스트',
      date: '2024-10-16',
      startTime: '09:00',
      endTime: '10:00',
      description: '기본 설명',
      location: '기본 장소',
      category: '기타',
      repeat: { type: 'daily', interval: 3 },
      notificationTime: 10,
    };

    addEvent(user, event);

    const eventCalendarView = screen.getByTestId('event-calendar-view');
    const eventListView = screen.getByTestId('event-list-view');

    const testEvents = within(eventCalendarView).getAllByText('3일 반복 테스트');
    expect(testEvents.length).toBe(3);
    const firstEventDay = within(eventListView).getByText('2024-10-16');
    expect(firstEventDay).toBeInTheDocument();
    const secondEventDay = within(eventListView).getByText('2024-10-17');
    expect(secondEventDay).toBeInTheDocument();
    const thirdEventDay = within(eventListView).getByText('2024-10-18');
    expect(thirdEventDay).toBeInTheDocument();
  });

  it('3주 연속 반복하는 일정을 추가한다.', () => {
    setupMockHandlerCreation([]);
    const { user } = setup(<App />);

    const event: EventForm = {
      title: '3주 반복 테스트',
      date: '2024-10-16',
      startTime: '09:00',
      endTime: '10:00',
      description: '기본 설명',
      location: '기본 장소',
      category: '기타',
      repeat: { type: 'weekly', interval: 3 },
      notificationTime: 10,
    };

    addEvent(user, event);
    const eventCalendarView = screen.getByTestId('event-calendar-view');
    const eventListView = screen.getByTestId('event-list-view');

    const testEvents = within(eventCalendarView).getAllByText('3주 반복 테스트');
    expect(testEvents.length).toBe(3);
    const firstEventDay = within(eventListView).getByText('2024-10-16');
    expect(firstEventDay).toBeInTheDocument();
    const secondEventDay = within(eventListView).getByText('2024-10-23');
    expect(secondEventDay).toBeInTheDocument();
    const thirdEventDay = within(eventListView).getByText('2024-10-30');
    expect(thirdEventDay).toBeInTheDocument();
  });

  it('3개월 연속 반복하는 일정을 추가한다.', async () => {
    setupMockHandlerCreation([]);
    const { user } = setup(<App />);

    const event: EventForm = {
      title: '3개월 반복 테스트',
      date: '2024-10-16',
      startTime: '09:00',
      endTime: '10:00',
      description: '기본 설명',
      location: '기본 장소',
      category: '기타',
      repeat: { type: 'monthly', interval: 3 },
      notificationTime: 10,
    };

    addEvent(user, event);
    const eventCalendarView = screen.getByTestId('event-calendar-view');
    const eventListView = screen.getByTestId('event-list-view');
    const nextBtn = screen.getByRole('button', { name: 'Next' });

    let testEventTitle = within(eventCalendarView).getByText('3개월 반복 테스트');
    expect(testEventTitle).toBeInTheDocument();
    const firstEventDay = within(eventListView).getByText('2024-10-16');
    expect(firstEventDay).toBeInTheDocument();

    await user.click(nextBtn);

    testEventTitle = within(eventCalendarView).getByText('3개월 반복 테스트');
    expect(testEventTitle).toBeInTheDocument();
    const secondEventDay = within(eventListView).getByText('2024-11-16');
    expect(secondEventDay).toBeInTheDocument();

    await user.click(nextBtn);

    testEventTitle = within(eventCalendarView).getByText('3개월 반복 테스트');
    expect(testEventTitle).toBeInTheDocument();
    const thirdEventDay = within(eventListView).getByText('2024-12-16');
    expect(thirdEventDay).toBeInTheDocument();
  });

  it('3년 연속 반복하는 일정을 추가한다.', async () => {
    setupMockHandlerCreation([]);
    const { user } = setup(<App />);

    const event: EventForm = {
      title: '3년 반복 테스트',
      date: '2024-10-16',
      startTime: '09:00',
      endTime: '10:00',
      description: '기본 설명',
      location: '기본 장소',
      category: '기타',
      repeat: { type: 'yearly', interval: 3 },
      notificationTime: 10,
    };

    addEvent(user, event);
    const eventCalendarView = screen.getByTestId('event-calendar-view');
    const eventListView = screen.getByTestId('event-list-view');
    const nextBtn = screen.getByRole('button', { name: 'Next' });

    let testEventTitle = within(eventCalendarView).getByText('3년 반복 테스트');
    expect(testEventTitle).toBeInTheDocument();
    const firstEventDay = within(eventListView).getByText('2024-10-16');
    expect(firstEventDay).toBeInTheDocument();

    for (let i = 0; i < 12; i++) {
      await user.click(nextBtn);
    }

    testEventTitle = within(eventCalendarView).getByText('3년 반복 테스트');
    expect(testEventTitle).toBeInTheDocument();
    const secondEventDay = within(eventListView).getByText('2025-10-16');
    expect(secondEventDay).toBeInTheDocument();

    for (let i = 0; i < 12; i++) {
      await user.click(nextBtn);
    }

    testEventTitle = within(eventCalendarView).getByText('3년 반복 테스트');
    expect(testEventTitle).toBeInTheDocument();
    const thirdEventMonth = within(eventListView).getByText('2026-10-16');
    expect(thirdEventMonth).toBeInTheDocument();
  });

  // 경계값 테스트
  it('매일 반복하는 일정이 한 주를 넘어가는 경우 다음 view에서 볼 수 있다.', async () => {
    setupMockHandlerCreation([]);
    const { user } = setup(<App />);

    const event: EventForm = {
      title: '매일 경계값 테스트',
      date: '2024-10-19',
      startTime: '09:00',
      endTime: '10:00',
      description: '기본 설명',
      location: '기본 장소',
      category: '기타',
      repeat: { type: 'daily', interval: 2 },
      notificationTime: 10,
    };
    const selectElement = screen.getByRole('combobox', { name: 'view' });
    await user.selectOptions(selectElement, 'week');

    addEvent(user, event);

    const eventCalendarView = screen.getByTestId('event-calendar-view');
    const eventListView = screen.getByTestId('event-list-view');
    const nextBtn = screen.getByRole('button', { name: 'Next' });

    let testEventTitle = within(eventCalendarView).getByText('매일 경계값 테스트');
    expect(testEventTitle).toBeInTheDocument();
    const firstEventDay = within(eventListView).getByText('2024-10-19');
    expect(firstEventDay).toBeInTheDocument();

    await user.click(nextBtn);

    testEventTitle = within(eventCalendarView).getByText('매일 경계값 테스트');
    expect(testEventTitle).toBeInTheDocument();
    const secondEventDay = within(eventListView).getByText('2024-10-20');
    expect(secondEventDay).toBeInTheDocument();
  });

  it('매일 반복하는 일정이 한 개월을 넘어가는 경우 다음 view에서 볼 수 있다.', async () => {
    setupMockHandlerCreation([]);
    const { user } = setup(<App />);

    const event: EventForm = {
      title: '매일 경계값 테스트',
      date: '2024-10-30',
      startTime: '09:00',
      endTime: '10:00',
      description: '기본 설명',
      location: '기본 장소',
      category: '기타',
      repeat: { type: 'daily', interval: 2 },
      notificationTime: 10,
    };

    addEvent(user, event);

    const eventCalendarView = screen.getByTestId('event-calendar-view');
    const eventListView = screen.getByTestId('event-list-view');
    const nextBtn = screen.getByRole('button', { name: 'Next' });

    let testEventTitle = within(eventCalendarView).getByText('매일 경계값 테스트');
    expect(testEventTitle).toBeInTheDocument();
    const firstEventDay = within(eventListView).getByText('2024-10-30');
    expect(firstEventDay).toBeInTheDocument();

    await user.click(nextBtn);

    testEventTitle = within(eventCalendarView).getByText('매일 경계값 테스트');
    expect(testEventTitle).toBeInTheDocument();
    const secondEventDay = within(eventListView).getByText('2024-11-01');
    expect(secondEventDay).toBeInTheDocument();
  });

  it('매주 반복하는 일정이 한 주를 넘어가는 경우 다음 view에서 볼 수 있다.', async () => {
    setupMockHandlerCreation([]);
    const { user } = setup(<App />);

    const event: EventForm = {
      title: '매주 경계값 테스트',
      date: '2024-10-19',
      startTime: '09:00',
      endTime: '10:00',
      description: '기본 설명',
      location: '기본 장소',
      category: '기타',
      repeat: { type: 'daily', interval: 2 },
      notificationTime: 10,
    };
    const selectElement = screen.getByRole('combobox', { name: 'view' });
    await user.selectOptions(selectElement, 'week');

    addEvent(user, event);

    const eventCalendarView = screen.getByTestId('event-calendar-view');
    const eventListView = screen.getByTestId('event-list-view');
    const nextBtn = screen.getByRole('button', { name: 'Next' });

    let testEventTitle = within(eventCalendarView).getByText('매주 경계값 테스트');
    expect(testEventTitle).toBeInTheDocument();
    const firstEventDay = within(eventListView).getByText('2024-10-19');
    expect(firstEventDay).toBeInTheDocument();

    await user.click(nextBtn);

    testEventTitle = within(eventCalendarView).getByText('매주 경계값 테스트');
    expect(testEventTitle).toBeInTheDocument();
    const secondEventDay = within(eventListView).getByText('2024-10-26');
    expect(secondEventDay).toBeInTheDocument();
  });

  it('매주 반복하는 일정이 한 개월을 넘어가는 경우 다음 view에서 볼 수 있다.', async () => {
    setupMockHandlerCreation([]);
    const { user } = setup(<App />);

    const event: EventForm = {
      title: '매주 경계값 테스트',
      date: '2024-10-26',
      startTime: '09:00',
      endTime: '10:00',
      description: '기본 설명',
      location: '기본 장소',
      category: '기타',
      repeat: { type: 'weekly', interval: 2 },
      notificationTime: 10,
    };

    addEvent(user, event);

    const eventCalendarView = screen.getByTestId('event-calendar-view');
    const eventListView = screen.getByTestId('event-list-view');
    const nextBtn = screen.getByRole('button', { name: 'Next' });

    let testEventTitle = within(eventCalendarView).getByText('매주 경계값 테스트');
    expect(testEventTitle).toBeInTheDocument();
    const firstEventDay = within(eventListView).getByText('2024-10-26');
    expect(firstEventDay).toBeInTheDocument();

    await user.click(nextBtn);

    testEventTitle = within(eventCalendarView).getByText('매주 경계값 테스트');
    expect(testEventTitle).toBeInTheDocument();
    const secondEventDay = within(eventListView).getByText('2024-11-03');
    expect(secondEventDay).toBeInTheDocument();
  });

  // 기타 예외 테스트
  // Q. 만약, 윤년 29일에 또는 31일에 매월 또는 매년 반복일정을 설정한다면 어떻게 처리할까요? 다른 서비스를 참고해보시고 자유롭게 작성해보세요.
  /* A.
    - From. 네이버 캘린더
    - 매월 : 31일 | 5번째 금요일 | 마지막 금요일 | 마지막 날 중에서 선택
    - 매년 : 31일 | 0월 5번째 금요일 | 0월 마지막 금요일 | 0월 마지막 날 중에서 선택
    - 31일 선택 시 31일이 없는 달에는 생성되지 않음
    - 윤년에 대한 처리도 동일
    - 위 선택지를 모두 구현하기는 어렵고 첫번째 선택지만 구현해보자! => "반복 일정 표시"에 포함
   **/
});

describe('반복 일정 단일 수정', () => {
  // 와우....!
  it('반복일정을 수정하면 단일 일정으로 변경됩니다.', async () => {
    setupMockHandlerCreation([]);
    const { user } = setup(<App />);

    const event: EventForm = {
      title: '반복 일정 수정',
      date: '2024-10-16',
      startTime: '09:00',
      endTime: '10:00',
      description: '기본 설명',
      location: '기본 장소',
      category: '기타',
      repeat: { type: 'daily', interval: 3 },
      notificationTime: 10,
    };

    addEvent(user, event);

    const eventListView = screen.getByTestId('event-list-view');
    const editButtons = within(eventListView).getAllByRole('button', { name: 'Edit event' });

    await user.click(editButtons[1]);

    await user.type(screen.getByLabelText('제목'), '!!!');
    await user.click(screen.getByTestId('event-submit-button'));

    const repeatEvents = within(eventListView).getAllByText('매일');
    expect(repeatEvents.length).toBe(2);
  });

  it.skip('반복일정 아이콘도 사라집니다.', () => {});
});

describe('반복 일정 단일 삭제', () => {
  // 가수면 상태에서 코딩중 ...
  it('반복일정을 삭제하면 해당 일정만 삭제합니다.', async () => {
    setupMockHandlerCreation([]);
    const { user } = setup(<App />);

    const event: EventForm = {
      title: '반복 일정 삭제',
      date: '2024-10-16',
      startTime: '09:00',
      endTime: '10:00',
      description: '기본 설명',
      location: '기본 장소',
      category: '기타',
      repeat: { type: 'daily', interval: 3 },
      notificationTime: 10,
    };

    addEvent(user, event);

    const eventListView = screen.getByTestId('event-list-view');
    const deleteButtons = within(eventListView).getAllByRole('button', { name: 'Delete event' });

    await user.click(deleteButtons[1]);

    const repeatEvents = within(eventListView).getAllByText('매일');
    expect(repeatEvents.length).toBe(2);
  });
});
