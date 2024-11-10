import useScheduleForm from '@stores/useScheduleForm';
import React from 'react';

import { InputWithLabel } from '../InputWithLabel';

export const RepeatEndDateSetting: React.FC = () => {
  const endDate = useScheduleForm((state) => state.repeat.endDate);
  const setEndDate = useScheduleForm((state) => state.setRepeat);

  return (
    <InputWithLabel
      data-testid="schedule-repeat-end-date"
      type="date"
      value={endDate}
      onChange={(date) => setEndDate({ endDate: date })}
      label="반복 종료일"
    />
  );
};
