import { NOTIFICATION_OPTIONS } from '@constants/notifications';
import { SelectWithLabel } from '@molecules/SelectWithLabel';
import useScheduleForm from '@stores/useScheduleForm';
import React from 'react';

export const RepeatAlarmSetting: React.FC = () => {
  const notificationTime = useScheduleForm((state) => state.notificationTime);
  const setNotificationTime = useScheduleForm((state) => state.setNotificationTime);

  return (
    <SelectWithLabel
      data-testid="schedule-notification-time"
      label="알림 설정"
      value={notificationTime}
      onChange={(v) => setNotificationTime(Number(v))}
      options={[...NOTIFICATION_OPTIONS]}
    />
  );
};
