import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { EventForm } from '../../types';

export const fillEventForm = async (
  user: ReturnType<typeof userEvent.setup>,
  eventData: Partial<EventForm>
) => {
  await user.type(screen.getByLabelText('제목'), eventData.title!);
  await user.type(screen.getByLabelText('날짜'), eventData.date!);
  await user.type(screen.getByLabelText('시작 시간'), eventData.startTime!);
  await user.type(screen.getByLabelText('종료 시간'), eventData.endTime!);
  if (eventData.description) {
    await user.type(screen.getByLabelText('설명'), eventData.description!);
  }
  if (eventData.location) {
    await user.type(screen.getByLabelText('위치'), eventData.location!);
  }
  await user.selectOptions(screen.getByLabelText('카테고리'), eventData.category!);
};

export const activateAndCheckRepeatFields = async (user: ReturnType<typeof userEvent.setup>) => {
  const repeatCheckbox = screen.getByLabelText('반복 일정');
  await user.click(repeatCheckbox);
  expect(repeatCheckbox).toBeChecked();

  const repeatTypeSelect = screen.getByLabelText('반복 유형');
  expect(repeatTypeSelect).toHaveValue('daily');

  const repeatIntervalInput = screen.getByLabelText('반복 간격');
  expect(repeatIntervalInput).toHaveValue('1');

  const repeatEndDateInput = screen.getByLabelText('반복 종료일');
  expect(repeatEndDateInput).toHaveValue('');
};

export const setRepeatOptions = async (
  user: ReturnType<typeof userEvent.setup>,
  repeatType: string,
  endDate: string
) => {
  await user.click(screen.getByLabelText('반복 일정'));
  await user.selectOptions(screen.getByLabelText('반복 유형'), repeatType);
  await user.type(screen.getByLabelText('반복 종료일'), endDate);
};
