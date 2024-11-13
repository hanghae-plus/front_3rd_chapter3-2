// useNotifications.ts
import { useInterval } from '@chakra-ui/react';
import { useState, useCallback } from 'react';

import { Event } from '../entities/event/model/types';
import { createNotificationMessage, getUpcomingEvents } from '../utils/notificationUtils';

export const useNotifications = (events: Event[]) => {
  const [notifications, setNotifications] = useState<{ id: string; message: string }[]>([]);
  const [notifiedEvents, setNotifiedEvents] = useState<string[]>([]);

  const checkUpcomingEvents = useCallback(() => {
    const now = new Date();
    const upcomingEvents = getUpcomingEvents(events, now, notifiedEvents);

    if (upcomingEvents.length > 0) {
      setNotifications((prev) => [
        ...prev,
        ...upcomingEvents.map((event) => ({
          id: event.id,
          message: createNotificationMessage(event),
        })),
      ]);

      setNotifiedEvents((prev) => [...prev, ...upcomingEvents.map(({ id }) => id)]);
    }
  }, [events, notifiedEvents]);

  const removeNotification = (index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };

  useInterval(checkUpcomingEvents, 1000); // 1초마다 체크

  return {
    notifications,
    notifiedEvents,
    setNotifications,
    removeNotification,
  };
};
