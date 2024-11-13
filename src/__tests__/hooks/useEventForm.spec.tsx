import { ChakraProvider } from '@chakra-ui/react';
import { act, render, screen, renderHook } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { ChangeEvent, ReactElement } from 'react';

import App from '../../App.tsx';
import { useEventForm } from '../../hooks/useEventForm.ts';
import { Event } from '../../types.ts';

const setup = (element: ReactElement) => {
  const user = userEvent.setup();

  return { ...render(<ChakraProvider>{element}</ChakraProvider>), user }; // ? Med: 왜 ChakraProvider로 감싸는지 물어보자
};

describe('반복 설정', () => {
  it('isRepeating은 일정 생성시 false이어야 한다', () => {
    const { result } = renderHook(() => useEventForm());

    expect(result.current.isRepeating).toBe(false);
  });

  it('isRepeating은 일정 수정시 원래 값을 유지해야 한다', () => {
    const repeatEvent = {
      repeat: { type: 'none' },
    } as Event;

    const { result } = renderHook(() => useEventForm(repeatEvent));

    expect(result.current.isRepeating).toBe(false);
  });

  it('isRepeating이 false일 때 repeatType은 none이어야 한다', () => {
    const { result } = renderHook(() => useEventForm());

    expect(result.current.isRepeating).toBe(false);
    expect(result.current.repeatType).toBe('none');
  });
});

describe('반복 유형 선택', () => {
  it('isRepeating이 true일 때 repeatType은 none이 아니어야 하며, "daily"이어야 한다', () => {
    const { result } = renderHook(() => useEventForm());

    act(() => {
      result.current.handleIsRepeatingChange({
        target: { checked: true },
      } as ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.isRepeating).toBe(true);
    expect(result.current.repeatType).not.toBe('none');
    expect(result.current.repeatType).toBe('daily');
  });

  it('isRepeating이 true일 때 유저가 repeatType을 클릭하면 repeatType도 변경되어야 한다', async () => {
    const { user } = setup(<App />);

    await user.click(screen.getByLabelText('반복 일정'));
    await user.selectOptions(screen.getByLabelText('반복 유형'), 'weekly');

    expect(screen.getByLabelText('반복 일정')).toBeChecked();
    expect(screen.getByLabelText('반복 유형')).toHaveValue('weekly');
  });
});
  });
});
