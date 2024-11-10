import { fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';

export async function fillInputByTestId({
  container,
  testId,
  value,
}: {
  container: HTMLElement;
  testId: string;
  value: string;
}) {
  try {
    const input = await waitFor(() => within(container).getByTestId(testId));

    act(() => fireEvent.change(input, { target: { value: value } }));
  } catch (error) {
    throw new Error(`Failed to fill input with testId "${testId}": ${error}`);
  }
}

export async function fillCheckByTestId({
  container,
  testId,
  value,
}: {
  container: HTMLElement;
  testId: string;
  value: boolean;
}) {
  try {
    const checkBox = await waitFor(() => within(container).getByTestId(testId));
    act(() => fireEvent.change(checkBox, { target: { checked: value } }));
  } catch (error) {
    throw new Error(`Failed to fill checkBox with testId "${testId}": ${error}`);
  }
}

export async function fillSelectByTestId({
  container,
  testId,
  value,
}: {
  container: HTMLElement;
  testId: string;
  value: string;
}) {
  try {
    const selectBox = await waitFor(() => within(container).getByTestId(testId));
    await userEvent.selectOptions(selectBox, value);
  } catch (error) {
    throw new Error(`Failed to fill selectBox with testId "${testId}": ${error}`);
  }
}

export async function fillEventForm({
  container,
  events,
}: {
  container: HTMLElement;
  events: { testId: string; value: string | boolean; type: 'input' | 'select' | 'check' }[];
}) {
  try {
    for (const { testId, value, type } of events) {
      if (type === 'input') {
        await fillInputByTestId({ container, testId, value: String(value) });
      }
      if (type === 'select') {
        await fillSelectByTestId({ container, testId, value: String(value) });
      }
      if (type === 'check') {
        await fillCheckByTestId({ container, testId, value: Boolean(value) });
      }
    }
  } catch (error) {
    throw new Error(`${error} ? ${error} : '입력폼 에러'`);
  }
}
