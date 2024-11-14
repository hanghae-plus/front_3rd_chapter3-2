import { useInterval } from '@chakra-ui/react';
import { useState } from 'react';

import { Event, EventId, Notification } from '../types';
import { arraysEqual } from '../utils/arrayUtils';
import { createNotificationMessage, getUpcomingEvents } from '../utils/notificationUtils';

export const useNotifications = (events: Event[]) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifiedEvents, setNotifiedEvents] = useState<EventId[]>([]);

  /** 다가오는 이벤트를 확인하고 알림을 설정하는 함수 */
  const checkUpcomingEvents = () => {
    const now = new Date();
    const upcomingEvents = getUpcomingEvents(events, now, notifiedEvents);

    const upcomingEventIds = upcomingEvents.map(({ id }) => id);

    // 이전에 알림한 이벤트 목록과 다가오는 이벤트 ID 목록이 같으면 변경 사항이 없으므로 종료
    if (arraysEqual(notifiedEvents, upcomingEventIds)) {
      return;
    }

    // 새로운 알림 메세지 추가
    setNotifications((prev) => [
      ...prev,
      ...upcomingEvents.map((event) => ({
        id: event.id,
        message: createNotificationMessage(event),
      })),
    ]);

    // 알림이 발송된 이벤트 id 목록 업데이트
    setNotifiedEvents((prev) => [...prev, ...upcomingEventIds]);
  };

  /** 특정 인덱스의 알림을 제거하는 함수 */
  const removeNotification = (index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };

  useInterval(checkUpcomingEvents, 1000); // 1초마다 체크

  return { notifications, notifiedEvents, setNotifications, removeNotification };
};
