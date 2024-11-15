import { FormControl, FormLabel, Select } from '@chakra-ui/react';
import { RepeatDepth } from '@entities/event/model/types';
import { useEventFormStore } from '@features/event/model/stores';
import { isLastDayOfMonth } from '@features/event/model/utils';

export const LastDaySelect = () => {
  const { date, repeatType, repeatDepth, setRepeatDepth } = useEventFormStore();

  return (
    isLastDayOfMonth(date) &&
    (repeatType === 'monthly' || repeatType === 'yearly') && (
      <FormControl>
        <FormLabel>마지막 날 설정</FormLabel>
        <Select
          data-testid="repeatDepth"
          value={repeatDepth}
          onChange={(e) => setRepeatDepth(e.target.value as RepeatDepth)}
        >
          <option value="fix">
            {repeatType === 'monthly' ? '매월' : '매년'} {new Date(date).getDate()}일
          </option>
          <option value="last">매월 마지막 날</option>
        </Select>
      </FormControl>
    )
  );
};
