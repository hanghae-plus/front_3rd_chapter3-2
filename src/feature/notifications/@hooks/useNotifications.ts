/* eslint-disable no-unused-vars */
import { useInterval } from '@chakra-ui/react';
import React, { useState } from 'react';

import { Event } from '../../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../../utils/notificationUtils';

export type UseNotifications = {
  notifications: { id: string; message: string }[];
  notifiedEvents: string[];
  setNotifications: React.Dispatch<React.SetStateAction<{ id: string; message: string }[]>>;
  removeNotification: (index: number) => void;
};

export const useNotifications = (events: Event[]): UseNotifications => {
  const [notifications, setNotifications] = useState<{ id: string; message: string }[]>([]);
  const [notifiedEvents, setNotifiedEvents] = useState<string[]>([]);

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
