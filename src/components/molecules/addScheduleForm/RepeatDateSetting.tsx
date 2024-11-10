import useScheduleForm from '@stores/useScheduleForm';
import React from 'react';

import { InputWithLabel } from '../InputWithLabel';

export const RepeatDateSetting: React.FC = () => {
  const data = useScheduleForm((state) => state.date);
  const setDate = useScheduleForm((state) => state.setDate);

  return (
    <InputWithLabel
      data-testid="schedule-date"
      type="date"
      value={data}
      onChange={setDate}
      label="날짜"
    />
  );
};
