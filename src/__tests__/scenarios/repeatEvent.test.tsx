// src/__tests__/e2e/repeatEvent.test.tsx
import { ChakraProvider } from '@chakra-ui/react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

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

    // 1. 2024년(윤년) 2월 29일 일정 생성
    await user.type(screen.getByLabelText('제목'), baseEventData.title!);
    await user.type(screen.getByLabelText('날짜'), '2024-02-29');
    await user.type(screen.getByLabelText('시작 시간'), baseEventData.startTime!);
    await user.type(screen.getByLabelText('종료 시간'), baseEventData.endTime!);

    // 2. 매년 반복 설정
    await user.click(screen.getByLabelText('반복 일정'));
    await user.selectOptions(screen.getByLabelText('반복 유형'), 'yearly');
    await user.click(screen.getByTestId('event-submit-button'));
  });
});
