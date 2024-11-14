import { NOTIFICATION_OPTIONS } from '@constants/notifications';
import { SelectWithLabel } from '@molecules/SelectWithLabel';
import useScheduleForm from '@stores/useScheduleForm';
import React from 'react';

import { TEST_ID } from '@/constants/testID';

export const RepeatAlarmSetting: React.FC = () => {
  const notificationTime = useScheduleForm((state) => state.notificationTime);
  const setNotificationTime = useScheduleForm((state) => state.setNotificationTime);

  return (
    <SelectWithLabel
      data-testid={TEST_ID.FORM.NOTIFICATION_TIME}
      label="알림 설정"
      value={notificationTime}
      onChange={(v) => setNotificationTime(Number(v))}
      options={[...NOTIFICATION_OPTIONS]}
    />
  );
};
