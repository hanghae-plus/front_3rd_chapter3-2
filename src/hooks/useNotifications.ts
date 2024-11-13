import { useInterval } from '@chakra-ui/react';
import { useState } from 'react';

import { Event, EventId, Notification } from '../types';
import { arraysEqual } from '../utils/arrayUtils';
import { createNotificationMessage, getUpcomingEvents } from '../utils/notificationUtils';

export const useNotifications = (events: Event[]) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifiedEvents, setNotifiedEvents] = useState<EventId[]>([]);

  const checkUpcomingEvents = () => {
    const now = new Date();
    const upcomingEvents = getUpcomingEvents(events, now, notifiedEvents);

    const upcomingEventIds = upcomingEvents.map(({ id }) => id);
    if (arraysEqual(notifiedEvents, upcomingEventIds)) {
      return;
    }

    setNotifications((prev) => [
      ...prev,
      ...upcomingEvents.map((event) => ({
        id: event.id,
        message: createNotificationMessage(event),
      })),
    ]);

    setNotifiedEvents((prev) => [...prev, ...upcomingEvents.map(({ id }) => id)]);
  };

  const removeNotification = (index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };

  useInterval(checkUpcomingEvents, 1000); // 1초마다 체크

  return { notifications, notifiedEvents, setNotifications, removeNotification };
};
