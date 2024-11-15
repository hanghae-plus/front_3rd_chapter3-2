import { FormControl, FormLabel, Select } from '@chakra-ui/react';
import React from 'react';

import { notificationOptions } from '../../constants';

interface EventsSaveSettingsProps {
  notificationTime: number;
  // eslint-disable-next-line
  setNotificationTime: (value: React.SetStateAction<number>) => void;
}
const EventsSaveSettings = ({ notificationTime, setNotificationTime }: EventsSaveSettingsProps) => {
  function handleNotificationTimeChange(event: React.ChangeEvent<HTMLSelectElement>) {
    setNotificationTime(Number(event.target.value));
  }
  return (
    <>
      <FormControl>
        <FormLabel>알림 설정</FormLabel>
        <Select
          data-testid="notificationTime"
          value={notificationTime}
          onChange={handleNotificationTimeChange}
        >
          {notificationOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </FormControl>
    </>
  );
};

export default EventsSaveSettings;
