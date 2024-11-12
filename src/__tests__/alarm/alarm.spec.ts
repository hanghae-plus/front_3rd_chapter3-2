import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Event } from '../../entities/event/model/types';
import { EventForm } from '../../features/event-form/ui/EventForm';

describe('반복 유형 선택', () => {
  const mockOnSubmit = vi.fn();
  const mockInitialEvent: Event = {
    id: '1',
    title: '테스트 일정',
    date: '2024-01-01',
    startTime: '09:00',
    endTime: '10:00',
    description: '',
    location: '',
    category: '',
    repeat: {
      type: 'none',
      interval: 1,
      endDate: '',
    },
    notificationTime: 0,
    repeatCondition: 'date',
  };

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });
  it('일정 생성 또는 수정 시 반복 유형을 선택할 수 있다.', async () => {
    const repeatCheckbox = screen.getByRole('checkbox', { name: /반복 일정/i });
    expect(repeatCheckbox).toBeInTheDocument();

    await userEvent.click(repeatCheckbox);

    const repeatTypeSelect = screen.getByRole('combobox', { name: /반복 유형/i });
    expect(repeatTypeSelect).toBeInTheDocument();

    const repeatTypes = ['매일', '매주', '매월', '매년'];

    for (const type of repeatTypes) {
      await userEvent.selectOptions(repeatTypeSelect, type);
      expect(screen.getByRole('option', { name: type }) as HTMLOptionElement).toHaveProperty(
        'selected',
        true
      );
    }
  });
});
