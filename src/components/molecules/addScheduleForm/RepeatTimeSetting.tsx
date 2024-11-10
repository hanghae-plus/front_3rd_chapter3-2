import useScheduleForm from '@stores/useScheduleForm';
import { getTimeErrorMessage } from '@utils/timeValidation';
import React, { useCallback } from 'react';

import { InputWithToolTipLabel } from '../InputWithToolTipLabel';

export const RepeatTimeSetting: React.FC = () => {
  const startTimeError = useScheduleForm((state) => state.startTimeError);
  const setStartTimeError = useScheduleForm((state) => state.setStartTimeError);

  const endTimeError = useScheduleForm((state) => state.endTimeError);
  const setEndTimeError = useScheduleForm((state) => state.setEndTimeError);

  const startTime = useScheduleForm((state) => state.startTime);
  const setStartTime = useScheduleForm((state) => state.setStartTime);

  const endTime = useScheduleForm((state) => state.endTime);
  const setEndTime = useScheduleForm((state) => state.setEndTime);

  const handleValidation = useCallback(() => {
    const { startTimeError, endTimeError } = getTimeErrorMessage(startTime, endTime);
    setStartTimeError(startTimeError ?? '');
    setEndTimeError(endTimeError ?? '');
  }, [startTime, endTime, setStartTimeError, setEndTimeError]);

  const handleStartTime = useCallback((v: string) => setStartTime(v), [setStartTime]);
  const handleEndTime = useCallback((v: string) => setEndTime(v), [setEndTime]);

  return (
    <>
      <InputWithToolTipLabel
        data-testid="schedule-start-time"
        type="time"
        label="시작 시간"
        value={startTime}
        onChange={handleStartTime}
        toolTipIsOpen={Boolean(startTimeError)}
        toolTipLabel={startTimeError}
        onBlur={() => handleValidation()}
        isInvalid={Boolean(startTimeError)}
      />
      <InputWithToolTipLabel
        data-testid="schedule-end-time"
        type="time"
        label="종료 시간"
        value={endTime}
        onChange={handleEndTime}
        toolTipIsOpen={Boolean(endTimeError)}
        toolTipLabel={endTimeError}
        onBlur={() => handleValidation()}
        isInvalid={Boolean(endTimeError)}
        placement="bottom"
      />
    </>
  );
};
