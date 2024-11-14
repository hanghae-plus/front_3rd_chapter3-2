import { FormControl, FormLabel, Select } from '@chakra-ui/react';

import { useEventForm } from '../../hooks/useEventForm';
import { NOTIFICATION_OPTIONS } from '../../shared/constants';

export function NotificationForm() {
  const { notificationTime, setNotificationTime } = useEventForm();

  return (
    <FormControl>
      <FormLabel>알림 설정</FormLabel>
      <Select
        value={notificationTime}
        onChange={(e) => setNotificationTime(Number(e.target.value))}
      >
        {NOTIFICATION_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </FormControl>
  );
}
