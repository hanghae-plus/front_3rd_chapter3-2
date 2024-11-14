import { useState, useEffect } from 'react';

import { Event } from '../../../entities/event/model/types';

interface Notification {
  id: string;
  message: string;
  repeatCount: number;
}

interface NotifiedEventsState {
  [key: string]: number;
}

export const useNotifications = (events: Event[]) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifiedEvents, setNotifiedEvents] = useState<NotifiedEventsState>({});

  useEffect(() => {
    const checkNotifications = () => {
      events.forEach((event) => {
        const eventDate = new Date(`${event.date}T${event.startTime}`);
        const notificationTime = new Date(
          eventDate.getTime() - event.notificationTime.value * 60 * 1000
        );
        const now = new Date();

        const currentRepeatCount = notifiedEvents[event.id] || 0;
        const maxRepeatCount = event.repeat.endCondition === 'count' ? event.repeat.count || 1 : 1;

        if (now >= notificationTime && now <= eventDate && currentRepeatCount < maxRepeatCount) {
          setNotifiedEvents((prev) => ({
            ...prev,
            [event.id]: currentRepeatCount + 1,
          }));

          setNotifications((prev) => [
            ...prev,
            {
              id: `${event.id}-${Date.now()}`,
              message: `${event.title} 일정이 곧 시작됩니다.`,
              repeatCount: currentRepeatCount + 1,
            },
          ]);
        }
      });
    };

    const interval = setInterval(checkNotifications, 60000);
    checkNotifications();

    return () => clearInterval(interval);
  }, [events, notifiedEvents]);

  const clearNotification = (notificationId: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== notificationId));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setNotifiedEvents({});
  };

  const resetNotifiedEvent = (eventId: string) => {
    setNotifiedEvents((prev) => {
      const newState = { ...prev };
      delete newState[eventId];
      return newState;
    });
  };

  return {
    notifications,
    notifiedEvents,
    clearNotification,
    clearAllNotifications,
    resetNotifiedEvent,
  };
};
