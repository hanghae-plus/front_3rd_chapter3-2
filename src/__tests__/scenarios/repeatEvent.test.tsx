import { ChakraProvider } from '@chakra-ui/react';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { setupMockHandlerCreation } from '../../__mocks__/handlersUtils';
import App from '../../App';
import { EventForm } from '../../types';
import {
  activateAndCheckRepeatFields,
  fillEventForm,
  setRepeatOptions,
} from '../helpers/repeatFormHelpers';
import { checkEventInEventList } from '../helpers/eventHelpers';

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

    await fillEventForm(user, baseEventData);
    await activateAndCheckRepeatFields(user);
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
    await fillEventForm(user, { ...baseEventData, date: '2024-02-29' });

    // 2. 반복 설정
    await setRepeatOptions(user, 'yearly', '2025-12-31');

    // 3. 저장
    await user.click(screen.getByTestId('event-submit-button'));

    // 4. 월간 뷰로 변경
    await user.selectOptions(screen.getByLabelText('view'), 'month');

    // 5. 2024년 2월로 이동하고 event-list에서 확인
    while (!screen.queryByText('2024년 2월')) {
      await user.click(screen.getByLabelText('Previous'));
    }
    checkEventInEventList(baseEventData.title!);

    // 6. 2025년 2월로 이동하고 event-list에서 확인
    for (let i = 0; i < 12; i++) {
      await user.click(screen.getByLabelText('Next'));
    }
    checkEventInEventList(baseEventData.title!);

    // 7. 반복 정보가 있는지 확인 (event-list에서)
    const eventList = await screen.findByTestId('event-list');
    const repeatInfo = within(eventList).getByText(/반복: 1년마다/);
    expect(repeatInfo).toBeInTheDocument();
  });
});
