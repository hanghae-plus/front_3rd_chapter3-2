import { useState, useEffect } from 'react';

import { Event } from '../../../entities/event/model/types';

interface Notification {
  id: string;
  message: string;
}

export const useNotifications = (events: Event[]) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifiedEvents, setNotifiedEvents] = useState<string[]>([]);

  // 알림 검사 및 생성
  useEffect(() => {
    const checkNotifications = () => {
      events.forEach((event) => {
        const eventDate = new Date(`${event.date}T${event.startTime}`);
        const notificationTime = new Date(eventDate.getTime() - event.notificationTime * 60 * 1000);
        const now = new Date();

        if (now >= notificationTime && now <= eventDate && !notifiedEvents.includes(event.id)) {
          // 새로운 알림 추가
          setNotifiedEvents((prev) => [...prev, event.id]);
          setNotifications((prev) => [
            ...prev,
            {
              id: `${event.id}-${Date.now()}`,
              message: `${event.title} 일정이 곧 시작됩니다.`,
            },
          ]);
        }
      });
    };

    // 1분마다 알림 체크
    const interval = setInterval(checkNotifications, 60000);

    // 초기 체크
    checkNotifications();

    return () => clearInterval(interval);
  }, [events, notifiedEvents]);

  // 알림 제거
  const removeNotification = (notificationId: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== notificationId));
  };

  // 모든 알림 제거
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // 이벤트 알림 상태 초기화
  const resetNotifiedEvent = (eventId: string) => {
    setNotifiedEvents((prev) => prev.filter((id) => id !== eventId));
  };

  const clearNotification = (notificationId: string) => {
    removeNotification(notificationId);
  };

  return {
    notifications,
    notifiedEvents,
    removeNotification,
    clearAllNotifications,
    resetNotifiedEvent,
    clearNotification,
  };
};
