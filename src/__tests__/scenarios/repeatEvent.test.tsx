import { ChakraProvider } from '@chakra-ui/react';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { setupMockHandlerCreation } from '../../__mocks__/handlersUtils';
import App from '../../App';
import { EventForm } from '../../types';
import { checkEventInEventList } from '../helpers/eventHelpers';
import {
  activateAndCheckRepeatFields,
  fillEventForm,
  setRepeatOptions,
} from '../helpers/repeatFormHelpers';

describe('반복 일정과 관련된 기능들이 모두 올바르게 동작한다', () => {
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
    // 모든 모의 함수 초기화
    vi.clearAllMocks();

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

  describe('반복 유형 선택', () => {
    it('반복 일정을 생성할 수 있다', async () => {
      const user = userEvent.setup();

      await fillEventForm(user, baseEventData);
      await activateAndCheckRepeatFields(user);
    });

    it('반복 유형을 선택할 수 있다', async () => {
      const user = userEvent.setup();

      await userEvent.click(screen.getByLabelText('반복 일정'));
      const repeatTypeSelect = screen.getByLabelText('반복 유형');
      const repeatTypes = ['daily', 'weekly', 'monthly', 'yearly'];

      for (const type of repeatTypes) {
        await user.selectOptions(repeatTypeSelect, type);
        expect(repeatTypeSelect).toHaveValue(type);
      }
    });

    it('윤년(2024년) 2월 29일의 매년 반복 일정이 올바르게 생성된다', async () => {
      const user = userEvent.setup();

      await fillEventForm(user, { ...baseEventData, date: '2024-02-29' });
      await setRepeatOptions(user, 'yearly', '2025-12-31');
      await user.click(screen.getByTestId('event-submit-button'));

      await user.selectOptions(screen.getByLabelText('view'), 'month');
      while (!screen.queryByText('2024년 2월')) {
        await user.click(screen.getByLabelText('Previous'));
      }
      checkEventInEventList(baseEventData.title!);

      for (let i = 0; i < 12; i++) {
        await user.click(screen.getByLabelText('Next'));
      }
      checkEventInEventList(baseEventData.title!);

      const eventList = await screen.findByTestId('event-list');
      const repeatInfo = within(eventList).getByText(/반복: 1년마다/);
      expect(repeatInfo).toBeInTheDocument();
    });
  });

  describe('반복 간격 설정', () => {
    it('이벤트 폼을 채우고 반복 옵션을 설정할 수 있다', async () => {
      const user = userEvent.setup();
      await fillEventForm(user, baseEventData);
      await setRepeatOptions(user, 'monthly', '2024-12-31');

      const repeatCheckbox = screen.getByLabelText('반복 일정');
      expect(repeatCheckbox).toBeChecked();

      const repeatTypeSelect = screen.getByLabelText('반복 유형');
      expect(repeatTypeSelect).toHaveValue('monthly');

      const repeatIntervalInput = screen.getByLabelText('반복 간격');
      expect(repeatIntervalInput).toHaveValue('1');

      const repeatEndDateInput = screen.getByLabelText('반복 종료일');
      expect(repeatEndDateInput).toHaveValue('2024-12-31');
    });

    it('간격을 설정할 수 있다', async () => {
      const user = userEvent.setup();
      await setRepeatOptions(user, 'monthly', '2024-12-31');

      const intervalInput = await screen.findByRole('spinbutton');

      await user.clear(intervalInput);
      await user.type(intervalInput, '2');
      expect(intervalInput).toHaveValue('2');

      await user.clear(intervalInput);
      await user.type(intervalInput, '5');
      expect(intervalInput).toHaveValue('5');
    });

    it('이벤트를 제출하고 반복 정보가 올바르게 표시된다', async () => {
      const user = userEvent.setup();
      await fillEventForm(user, baseEventData);
      await setRepeatOptions(user, 'monthly', '2024-12-31');

      const intervalInput = await screen.findByRole('spinbutton');

      await user.clear(intervalInput);
      await user.type(intervalInput, '2');

      await user.click(screen.getByTestId('event-submit-button'));
      await user.selectOptions(screen.getByLabelText('view'), 'month');

      while (!screen.queryByText('2024년 3월')) {
        await user.click(screen.getByLabelText('Previous'));
      }

      const eventList = await screen.findByTestId('event-list');
      const repeatInfo = within(eventList).getByText(/반복: 2월/);
      expect(repeatInfo).toBeInTheDocument();
    });
  });

  describe('반복 일정 표시', () => {
    it('캘린더 뷰에서 반복 일정을 시각적으로 구분하여 표시한다', async () => {
      const user = userEvent.setup();

      await fillEventForm(user, baseEventData);
      await setRepeatOptions(user, 'weekly', '2024-03-31');
      await user.click(screen.getByTestId('event-submit-button'));

      await user.selectOptions(screen.getByLabelText('view'), 'month');

      while (!screen.queryByText('2024년 3월')) {
        await user.click(screen.getByLabelText('Previous'));
      }

      const repeatIcons = screen.getAllByTestId('repeat-icon');
      expect(repeatIcons.length).toBeGreaterThan(0);
    });
  });
});
