import { useInterval } from '@chakra-ui/react';
import { atom, useAtom } from 'jotai';

import { Event } from '../types';
import { createNotificationMessage, getUpcomingEvents } from '../utils/notificationUtils';

const notificationsAtom = atom<{ id: string; message: string }[]>([]);
const notifiedEventsAtom = atom<string[]>([]);

export const useNotifications = (events: Event[]) => {
  const [notifications, setNotifications] = useAtom(notificationsAtom);
  const [notifiedEvents, setNotifiedEvents] = useAtom(notifiedEventsAtom);

  const checkUpcomingEvents = () => {
    const now = new Date();
    const upcomingEvents = getUpcomingEvents(events, now, notifiedEvents);

    if (upcomingEvents.length > 0) {
      const newNotifications = upcomingEvents.map((event) => ({
        id: event.id,
        message: createNotificationMessage(event),
      }));

      setNotifications((prev) => {
        const existingIds = new Set(prev.map((n) => n.id));
        const uniqueNewNotifications = newNotifications.filter((n) => !existingIds.has(n.id));
        return [...prev, ...uniqueNewNotifications];
      });

      setNotifiedEvents((prev) => [...prev, ...upcomingEvents.map(({ id }) => id)]);
    }
  };

  const removeNotification = (index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };

  useInterval(checkUpcomingEvents, 1000);

  return { notifications, notifiedEvents, setNotifications, removeNotification };
};
