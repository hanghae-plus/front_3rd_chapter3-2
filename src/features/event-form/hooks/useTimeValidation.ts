import { useCallback, useState } from 'react';

import { validateTime } from '../lib/validation';
import { TimeErrorRecord } from '../model/types';

export const useTimeValidation = () => {
  const [timeErrors, setTimeErrors] = useState<TimeErrorRecord>({
    startTimeError: null,
    endTimeError: null,
  });

  const validateTimes = useCallback((newStartTime: string, newEndTime: string) => {
    const errors = validateTime(newStartTime, newEndTime);
    setTimeErrors({
      startTimeError: errors.startTime,
      endTimeError: errors.endTime,
    });
    return errors;
  }, []);

  return {
    timeErrors,
    validateTimes,
  };
};
