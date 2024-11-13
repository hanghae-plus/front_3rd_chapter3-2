import { useInterval } from '@chakra-ui/react';
import { useFetchEvents } from '@hooks/events/useFetchEvents';
import useNotificationStore, { NotificationType } from '@stores/useNotificationStore';
import { getUpcomingEvents } from '@utils/notificationUtils';
import { Event } from 'src/types';

interface UseNotificationsResult {
  notifications: NotificationType[];
  notifiedEvents: Set<string>;
  updateNotifications: (events: Event[]) => void;
  deleteNotification: (index: number) => void;
  reset: () => void;
}

export const useNotifications = (): UseNotificationsResult => {
  const { events } = useFetchEvents();
  const notifications = useNotificationStore((state) => state.notifications);
  const updateNotifications = useNotificationStore((state) => state.updateNotifications);
  const deleteNotification = useNotificationStore((state) => state.deleteNotifications);
  const notifiedEvents = useNotificationStore((state) => state.notifiedEvents);
  const reset = useNotificationStore((state) => state.reset);

  const checkUpcomingEvents = () => {
    const now = new Date();
    const upcomingEvents = getUpcomingEvents(events, now, notifiedEvents);

    if (upcomingEvents.length === 0) return;
    updateNotifications(upcomingEvents);
  };

  useInterval(checkUpcomingEvents, 1000); // 1초마다 체크

  return {
    notifications,
    notifiedEvents,
    updateNotifications,
    deleteNotification,
    reset,
  };
};
