import useScheduleForm from '@stores/useScheduleForm';
import React from 'react';

import { InputWithLabel } from '../InputWithLabel';

import { TEST_ID } from '@/__tests__/constants';

export const RepeatDateSetting: React.FC = () => {
  const data = useScheduleForm((state) => state.date);
  const setDate = useScheduleForm((state) => state.setDate);

  return (
    <InputWithLabel
      data-testid={TEST_ID.FORM.DATE}
      type="date"
      value={data}
      onChange={setDate}
      label="날짜"
    />
  );
};
