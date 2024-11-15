import { FormControl, FormLabel, Input, Select, Tooltip } from '@chakra-ui/react';
import React, { useState } from 'react';

import { RepeatType, weekOptions } from '../../types';

interface EventSaveRepeatingOptionsProps {
  date: string;
  repeatType: RepeatType;
  repeatWeekOption: weekOptions;
  // eslint-disable-next-line
  setRepeatWeekOption: (value: React.SetStateAction<weekOptions>) => void;
  repeatMonthOption: string;
  // eslint-disable-next-line
  setRepeatMonthOption: (value: React.SetStateAction<string>) => void;
  excludedDate: string;
  // eslint-disable-next-line
  setExcludedDate: (value: React.SetStateAction<string>) => void;
}
const EventSaveRepeatingOptions = ({
  date,
  repeatType,
  repeatWeekOption,
  setRepeatWeekOption,
  repeatMonthOption,
  setRepeatMonthOption,
  excludedDate,
  setExcludedDate,
}: EventSaveRepeatingOptionsProps) => {
  const [isTooltip, setIsTooltip] = useState(false);

  const weekOptionsArray: weekOptions[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  const weekOptionsLabels = {
    Monday: '월요일',
    Tuesday: '화요일',
    Wednesday: '수요일',
    Thursday: '목요일',
    Friday: '금요일',
    Saturday: '토요일',
    Sunday: '일요일',
  };

  const excludedDateMsg = '일정 날짜 이후는 선택할 수 없습니다.';

  const daysOfMonth = Array.from({ length: 31 }, (_, index) => index + 1).map(String);

  function handleRepeatWeekOptionChange(event: React.ChangeEvent<HTMLSelectElement>) {
    setRepeatWeekOption(event.target.value as weekOptions);
  }

  function handleRepeatMonthOptionChange(event: React.ChangeEvent<HTMLSelectElement>) {
    setRepeatMonthOption(event.target.value);
  }

  function handleExcludedDateChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedDate = event.target.value;
    setExcludedDate(selectedDate);
    if (new Date(selectedDate) > new Date(date)) {
      setIsTooltip(true);
      setExcludedDate('');
    } else {
      setIsTooltip(false);
    }
  }

  return (
    <>
      {repeatType === 'weekly' && (
        <FormControl>
          <FormLabel>주간 반복 요일 설정</FormLabel>
          <Select
            data-testid="repeatWeekOption"
            value={repeatWeekOption}
            onChange={handleRepeatWeekOptionChange}
          >
            {weekOptionsArray.map((option) => (
              <option key={option} value={option}>
                {weekOptionsLabels[option]}
              </option>
            ))}
          </Select>
        </FormControl>
      )}

      {repeatType === 'monthly' && (
        <FormControl>
          <FormLabel>월에 반복할 일자</FormLabel>
          <Select
            data-testid="repeatMonthOptionDate"
            value={repeatMonthOption}
            onChange={handleRepeatMonthOptionChange}
          >
            {daysOfMonth.map((option) => (
              <option key={option} value={option}>
                {option}일
              </option>
            ))}
          </Select>
        </FormControl>
      )}
      <FormControl>
        <FormLabel>반복 일정 제외 날짜</FormLabel>
        <Tooltip label={excludedDateMsg} isOpen={!!isTooltip} placement="top">
          <Input
            data-testid="date"
            type="date"
            value={excludedDate}
            onChange={handleExcludedDateChange}
            min={new Date().toISOString().split('T')[0]}
          />
        </Tooltip>
      </FormControl>
    </>
  );
};

export default EventSaveRepeatingOptions;
