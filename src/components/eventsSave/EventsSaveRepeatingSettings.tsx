import { Checkbox, FormControl, FormLabel } from '@chakra-ui/react';
import React from 'react';

interface EventsRepeatingSettingsProps {
  isRepeating: boolean;
  // eslint-disable-next-line
  setIsRepeating: (value: React.SetStateAction<boolean>) => void;
}
const EventsSaveRepeatingSettings = ({
  isRepeating,
  setIsRepeating,
}: EventsRepeatingSettingsProps) => {
  function handleRepeatingChange(event: React.ChangeEvent<HTMLInputElement>) {
    setIsRepeating(event.target.checked);
  }

  return (
    <>
      <FormControl>
        <FormLabel>반복 설정</FormLabel>
        <Checkbox
          data-testid="isRepeating"
          isChecked={isRepeating}
          onChange={handleRepeatingChange}
        >
          반복 일정
        </Checkbox>
      </FormControl>
    </>
  );
};

export default EventsSaveRepeatingSettings;
