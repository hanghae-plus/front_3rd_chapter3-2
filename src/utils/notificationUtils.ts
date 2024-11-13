import { Event } from '../entities/event/model/types';

const 초 = 1000;
const 분 = 초 * 60;

export function getUpcomingEvents(events: Event[], now: Date, notifiedEvents: string[]) {
  return events.filter((event) => {
    const eventStart = new Date(`${event.date}T${event.startTime}:00`);
    const timeDiff = (eventStart.getTime() - now.getTime()) / 분;

    return (
      timeDiff > 0 && timeDiff <= event.notificationTime.value && !notifiedEvents.includes(event.id)
    );
  });
}

export function createNotificationMessage(event: Event) {
  return `${event.notificationTime.value}분 후 ${event.title} 일정이 시작됩니다.`;
}
