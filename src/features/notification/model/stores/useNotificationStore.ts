import { create } from 'zustand';

// notificationStore.ts
interface NotificationStore {
  notifications: { id: string; message: string }[];
  notifiedEvents: string[];
  setNotifications: (notifications: { id: string; message: string }[]) => void;
  setNotifiedEvents: (events: string[]) => void;
  removeNotification: (index: number) => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  notifiedEvents: [],
  setNotifications: (notifications) => set({ notifications }),
  setNotifiedEvents: (notifiedEvents) => set({ notifiedEvents }),
  removeNotification: (index) =>
    set((state) => ({
      notifications: state.notifications.filter((_, i) => i !== index),
    })),
}));
