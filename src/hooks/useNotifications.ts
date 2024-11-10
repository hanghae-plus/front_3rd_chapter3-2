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
