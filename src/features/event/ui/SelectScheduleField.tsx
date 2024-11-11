import { FormControl, FormLabel, HStack, Input, Tooltip } from '@chakra-ui/react';
import { useEventFormStore } from '@features/event/model/stores';
import { getTimeErrorMessage } from '@features/event/model/utils';
export const SelectScheduleField = () => {
  const {
    startTime,
    endTime,
    startTimeError,
    endTimeError,
    handleStartTimeChange,
    handleEndTimeChange,
  } = useEventFormStore();

  return (
    <HStack width="100%">
      <FormControl>
        <FormLabel>시작 시간</FormLabel>
        <Tooltip label={startTimeError} isOpen={!!startTimeError} placement="top">
          <Input
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
            type="time"
            value={endTime}
            onChange={handleEndTimeChange}
            onBlur={() => getTimeErrorMessage(startTime, endTime)}
            isInvalid={!!endTimeError}
          />
        </Tooltip>
      </FormControl>
    </HStack>
  );
};
