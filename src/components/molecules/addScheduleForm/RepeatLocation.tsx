import useScheduleForm from '@stores/useScheduleForm';
import React from 'react';

import { InputWithLabel } from '../InputWithLabel';

import { TEST_ID } from '@/constants/testID';

export const RepeatLocation: React.FC = () => {
  const location = useScheduleForm((state) => state.location);
  const setLocation = useScheduleForm((state) => state.setLocation);

  return (
    <InputWithLabel
      data-testid={TEST_ID.FORM.LOCATION}
      label="위치"
      value={location}
      onChange={setLocation}
    />
  );
};
