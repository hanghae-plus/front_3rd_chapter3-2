import { FormControl, FormLabel, HStack, Input, Tooltip } from '@chakra-ui/react';
import React from 'react';

import { getTimeErrorMessage } from '../../utils/timeValidation';

interface EventsSaveTimeSettingsProps {
  startTimeError: string | null;
  startTime: string;
  // eslint-disable-next-line
  handleStartTimeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  endTimeError: string | null;
  endTime: string;
  // eslint-disable-next-line
  handleEndTimeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const EventsSaveTimeSettings = ({
  startTimeError,
  startTime,
  handleStartTimeChange,
  endTimeError,
  endTime,
  handleEndTimeChange,
}: EventsSaveTimeSettingsProps) => {
  return (
    <>
      <HStack width="100%">
        <FormControl>
          <FormLabel>시작 시간</FormLabel>
          <Tooltip label={startTimeError} isOpen={!!startTimeError} placement="top">
            <Input
              data-testid="startTime"
              type="time"
              value={startTime}
              onChange={handleStartTimeChange}
              onBlur={() => getTimeErrorMessage(startTime, endTime)}
              isInvalid={!!startTimeError}
            />
          </Tooltip>
        </FormControl>
        <FormControl>
          <FormLabel>종료 시간</FormLabel>
          <Tooltip label={endTimeError} isOpen={!!endTimeError} placement="top">
            <Input
              data-testid="endTime"
              type="time"
              value={endTime}
              onChange={handleEndTimeChange}
              onBlur={() => getTimeErrorMessage(startTime, endTime)}
              isInvalid={!!endTimeError}
            />
          </Tooltip>
        </FormControl>
      </HStack>
    </>
  );
};

export default EventsSaveTimeSettings;
