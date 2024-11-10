import { InputWithLabel } from '@molecules/InputWithLabel';
import useScheduleForm from '@stores/useScheduleForm';
import React, { useCallback } from 'react';

export const RepeatIntervalSetting: React.FC = () => {
  const repeat = useScheduleForm((state) => state.repeat);
  const setRepeat = useScheduleForm((state) => state.setRepeat);

  const handleChange = useCallback((interval: number) => setRepeat({ interval }), [setRepeat]);

  return (
    <InputWithLabel
      data-testid="schedule-interval"
      type="number"
      label="반복 간격"
      value={repeat.interval}
      onChange={(v) => handleChange(Number(v))}
      min={1}
    />
  );
};
