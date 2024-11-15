import { FormControl, FormLabel, HStack, Input, Select, VStack } from '@chakra-ui/react';
import React from 'react';

import { RepeatType, weekOptions } from '../../types';
import EventSaveRepeatingOptions from '../eventsSave/EventSaveRepeatingOptions';

interface RepeatingProps {
  date: string;
  repeatType: RepeatType;
  setRepeatType: React.Dispatch<React.SetStateAction<RepeatType>>;
  repeatInterval: number;
  setRepeatInterval: React.Dispatch<React.SetStateAction<number>>;
  repeatEndDate: string;
  setRepeatEndDate: React.Dispatch<React.SetStateAction<string>>;
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

const Repeating = ({
  date,
  repeatType,
  setRepeatType,
  repeatInterval,
  setRepeatInterval,
  repeatEndDate,
  setRepeatEndDate,
  repeatWeekOption,
  setRepeatWeekOption,
  repeatMonthOption,
  setRepeatMonthOption,
  excludedDate,
  setExcludedDate,
}: RepeatingProps) => {
  function handleRepeatTypeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setRepeatType(e.target.value as RepeatType);
  }

  function handleRepeatIntervalChange(e: React.ChangeEvent<HTMLInputElement>) {
    setRepeatInterval(Number(e.target.value));
  }

  function handleRepeatEndDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    setRepeatEndDate(e.target.value);
  }

  return (
    <>
      <VStack width="100%">
        <FormControl>
          <FormLabel>반복 유형</FormLabel>
          <Select data-testid="repeatType" value={repeatType} onChange={handleRepeatTypeChange}>
            <option value="daily">매일</option>
            <option value="weekly">매주</option>
            <option value="monthly">매월</option>
            <option value="yearly">매년</option>
          </Select>
        </FormControl>
        <EventSaveRepeatingOptions
          date={date}
          repeatType={repeatType}
          repeatWeekOption={repeatWeekOption}
          setRepeatWeekOption={setRepeatWeekOption}
          repeatMonthOption={repeatMonthOption}
          setRepeatMonthOption={setRepeatMonthOption}
          excludedDate={excludedDate}
          setExcludedDate={setExcludedDate}
        />

        <HStack width="100%">
          <FormControl>
            <FormLabel>반복 간격</FormLabel>
            <Input
              data-testid="repeatInterval"
              type="number"
              value={repeatInterval}
              onChange={handleRepeatIntervalChange}
              min={1}
            />
          </FormControl>
          <FormControl>
            <FormLabel>반복 종료일</FormLabel>
            <Input
              data-testid="repeatEndDate"
              type="date"
              value={repeatEndDate}
              onChange={handleRepeatEndDateChange}
              min={new Date().toISOString().split('T')[0]}
              max="2025-06-30"
            />
          </FormControl>
        </HStack>
      </VStack>
    </>
  );
};

export default Repeating;
