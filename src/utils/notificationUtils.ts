import { Event } from '../types';

const 초 = 1000;
const 분 = 초 * 60;

export function getUpcomingEvents(events: Event[], now: Date, notifiedEvents: Set<string>) {
  return events.filter((event) => {
    const eventStart = new Date(`${event.date}T${event.startTime}`);
    const timeDiff = (eventStart.getTime() - now.getTime()) / 분;

    const min = event.notificationTime - 0.1 < 0 ? 0 : event.notificationTime - 0.1;
    const isUpcoming = timeDiff > min && timeDiff <= event.notificationTime;
    return isUpcoming && !notifiedEvents.has(event.id);
  });
}

export function createNotificationMessage({ notificationTime, title }: Event) {
  return `${notificationTime}분 후 ${title} 일정이 시작됩니다.`;
}
