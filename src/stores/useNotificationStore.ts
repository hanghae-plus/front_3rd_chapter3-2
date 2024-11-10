import { createNotificationMessage } from '@utils/notificationUtils';
import { Event } from 'src/types';
import { create } from 'zustand';

export interface NotificationType {
  id: string;
  message: string;
}

interface NotificationEvents {
  notifications: NotificationType[];

  updateNotifications: (events: Event[]) => void;

  deleteNotifications: (index: number) => void;

  dismissedNotifications: Set<string>;

  notifiedEvents: Set<string>;

  reset: () => void;
}

const useNotificationStore = create<NotificationEvents>((set) => ({
  notifications: [],
  updateNotifications: (events: Event[]) =>
    set((state) => {
      const newNotifications = new Map(
        new Map(state.notifications.map((notification) => [notification.id, notification.message]))
      );
      events.forEach((event: Event) => {
        newNotifications.set(event.id, createNotificationMessage(event));
      });
      return {
        notifications: Array.from(newNotifications, ([id, message]) => ({ id, message })),
        notifiedEvents: new Set(Array.from(newNotifications, ([id]) => id)),
      };
    }),
  deleteNotifications: (index: number) =>
    set((state) => {
      if (!state.notifications[index]) return state;
      return {
        dismissedNotifications: state.dismissedNotifications.add(state.notifications[index].id),
        notifications: state.notifications.filter((_, i) => i !== index),
      };
    }),

  dismissedNotifications: new Set(),

  notifiedEvents: new Set(),

  reset: () =>
    set(() => ({
      dismissedNotifications: new Set(),
      notifiedEvents: new Set(),
      notifications: [],
    })),
}));

export default useNotificationStore;
