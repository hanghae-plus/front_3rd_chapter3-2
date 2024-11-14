import { ChakraProvider } from '@chakra-ui/react';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { setupMockHandlerCreation } from '../../__mocks__/handlersUtils';
import App from '../../App';
import { EventForm } from '../../types';

describe('반복 일정 생성 및 반복 유형 선택', () => {
  const baseEventData: Partial<EventForm> = {
    title: '반복 테스트',
    date: '2024-03-01',
    startTime: '09:00',
    endTime: '10:00',
    description: '반복 일정 테스트',
    location: '회의실',
    category: '업무',
    notificationTime: 10,
  };

  beforeEach(() => {
    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    // 기본 반복 일정 데이터를 핸들러에 설정
    setupMockHandlerCreation([
      {
        id: '1',
        title: '반복 테스트',
        date: '2024-02-29',
        startTime: '09:00',
        endTime: '10:00',
        description: '반복 일정 테스트',
        location: '회의실',
        category: '업무',
        repeat: { type: 'yearly', interval: 1 },
        notificationTime: 10,
      },
    ]);
  });

  afterEach(() => {
    cleanup();
  });

  it('반복 일정을 생성하고 기본값이 올바르게 설정된다', async () => {
    const user = userEvent.setup();

    // 1. 기본 필드 입력
    await user.type(screen.getByLabelText('제목'), baseEventData.title!);
    await user.type(screen.getByLabelText('날짜'), baseEventData.date!);
    await user.type(screen.getByLabelText('시작 시간'), baseEventData.startTime!);
    await user.type(screen.getByLabelText('종료 시간'), baseEventData.endTime!);

    // 2. 반복 설정 활성화
    const repeatCheckbox = screen.getByLabelText('반복 일정');
    expect(repeatCheckbox).not.toBeChecked();
    await user.click(repeatCheckbox);
    expect(repeatCheckbox).toBeChecked();

    // 3. 반복 설정 필드들이 올바르게 나타나는지 확인
    const repeatTypeSelect = screen.getByLabelText('반복 유형');
    const repeatIntervalInput = screen.getByLabelText('반복 간격');
    const repeatEndDateInput = screen.getByLabelText('반복 종료일');

    // 4. 기본값 확인
    expect(repeatTypeSelect).toHaveValue('daily');
    expect(repeatIntervalInput).toHaveValue('1');
    expect(repeatEndDateInput).toHaveValue('');
  });

  it('모든 반복 유형을 선택할 수 있다', async () => {
    const user = userEvent.setup();

    // 1. 반복 설정 활성화
    await user.click(screen.getByLabelText('반복 일정'));
    const repeatTypeSelect = screen.getByLabelText('반복 유형');

    // 2. 각 반복 유형 선택 및 확인
    const repeatTypes = ['daily', 'weekly', 'monthly', 'yearly'];

    for (const type of repeatTypes) {
      await user.selectOptions(repeatTypeSelect, type);
      expect(repeatTypeSelect).toHaveValue(type);
    }
  });

  it('윤년(2024년) 2월 29일의 매년 반복 일정이 올바르게 생성된다', async () => {
    const user = userEvent.setup();

    // 1. 기본 정보 입력
    await user.type(screen.getByLabelText('제목'), baseEventData.title!);
    await user.type(screen.getByLabelText('날짜'), '2024-02-29');
    await user.type(screen.getByLabelText('시작 시간'), baseEventData.startTime!);
    await user.type(screen.getByLabelText('종료 시간'), baseEventData.endTime!);
    await user.type(screen.getByLabelText('설명'), baseEventData.description!);
    await user.type(screen.getByLabelText('위치'), baseEventData.location!);
    await user.selectOptions(screen.getByLabelText('카테고리'), baseEventData.category!);

    // 2. 반복 설정
    await user.click(screen.getByLabelText('반복 일정'));
    await user.selectOptions(screen.getByLabelText('반복 유형'), 'yearly');
    await user.type(screen.getByLabelText('반복 종료일'), '2025-12-31');

    // 3. 저장
    await user.click(screen.getByTestId('event-submit-button'));

    // 4. month view로 변경
    await user.selectOptions(screen.getByLabelText('view'), 'month');

    // 5. 2024년 2월로 이동
    while (!screen.queryByText('2024년 2월')) {
      await user.click(screen.getByLabelText('Previous'));
    }

    // 6. 2024년 2월 29일 일정 찾기 (Box > HStack > Text 구조)
    const monthView = screen.getByTestId('month-view');
    const day29Cell = within(monthView).getByText('29').closest('td');

    // day29Cell 내에서 텍스트가 "반복 테스트"를 포함하는 첫 번째 요소 찾기
    const event2024 = Array.from(day29Cell!.querySelectorAll('*')).find((element) =>
      element.textContent?.includes(baseEventData.title!)
    );

    console.log(event2024);

    expect(event2024).toBeInTheDocument();

    // 7. 2025년 2월로 이동
    for (let i = 0; i < 12; i++) {
      await user.click(screen.getByLabelText('Next'));
    }

    // 8. 2025년 2월 28일 일정 찾기
    const day28Cell = within(monthView).getByText('28').closest('td');
    const event2025 = within(day28Cell!).getByText(baseEventData.title!);
    expect(event2025).toBeInTheDocument();

    // 9. 반복 정보가 있는지 확인 (event-list에서)
    const eventList = screen.getByTestId('event-list');
    const repeatInfo = within(eventList).getByText(/반복: 1년마다/);
    expect(repeatInfo).toBeInTheDocument();
  });
});
