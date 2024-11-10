import useScheduleForm from '@stores/useScheduleForm';
import React from 'react';

import { InputWithLabel } from '../InputWithLabel';

export const RepeatLocation: React.FC = () => {
  const location = useScheduleForm((state) => state.location);
  const setLocation = useScheduleForm((state) => state.setLocation);

  return (
    <InputWithLabel
      data-testid="schedule-location"
      label="위치"
      value={location}
      onChange={setLocation}
    />
  );
};
