import useScheduleForm from '@stores/useScheduleForm';
import React from 'react';

import { InputWithLabel } from '../InputWithLabel';

import { TEST_ID } from '@/__tests__/constants';

export const RepeatEndDateSetting: React.FC = () => {
  const endDate = useScheduleForm((state) => state.repeat.endDate);
  const setEndDate = useScheduleForm((state) => state.setRepeat);

  return (
    <InputWithLabel
      data-testid={TEST_ID.FORM.REPEAT_END_DATE}
      type="date"
      value={endDate!}
      onChange={(date) => setEndDate({ endDate: date })}
      label="반복 종료일"
    />
  );
};
