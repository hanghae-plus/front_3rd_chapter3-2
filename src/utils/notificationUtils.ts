import { Event } from '../types';

const 초 = 1000;
const 분 = 초 * 60;

export function getUpcomingEvents(
  events: Event[],
  now: Date,
  notifiedEvents: Set<string>,
  deletedNotifications: Set<string>
) {
  return events.filter((event) => {
    const eventStart = new Date(`${event.date}T${event.startTime}`);
    const timeDiff = Math.floor((eventStart.getTime() - now.getTime()) / 분);

    const isUpcoming = timeDiff > 0 && timeDiff === event.notificationTime;
    return isUpcoming && !deletedNotifications.has(event.id) && !notifiedEvents.has(event.id);
  });
}

export function createNotificationMessage({ notificationTime, title }: Event) {
  return `${notificationTime}분 후 ${title} 일정이 시작됩니다.`;
}
