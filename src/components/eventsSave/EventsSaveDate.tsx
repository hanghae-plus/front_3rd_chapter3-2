import { FormControl, FormLabel, Input } from '@chakra-ui/react';
import React from 'react';

interface EventsSaveDateProps {
  date: string;
  // eslint-disable-next-line
  setDate: (value: React.SetStateAction<string>) => void;
}
const EventsSaveDate = ({ date, setDate }: EventsSaveDateProps) => {
  function handleDateChange(event: React.ChangeEvent<HTMLInputElement>) {
    setDate(event.target.value);
  }
  return (
    <>
      <FormControl>
        <FormLabel>날짜</FormLabel>
        <Input data-testid="date" type="date" value={date} onChange={handleDateChange} />
      </FormControl>
    </>
  );
};

export default EventsSaveDate;
