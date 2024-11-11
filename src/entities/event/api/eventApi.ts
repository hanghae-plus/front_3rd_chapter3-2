import { Event } from '@entities/event/model/types';
import { http } from '@shared/api';

interface EventsResponse {
  events: Event[];
}

export const eventsApi = {
  getEvents() {
    return http.get<EventsResponse>('/api/events');
  },

  createEvent(event: Omit<Event, 'id'>) {
    return http.post<Event>('/api/events', event);
  },

  updateEvent(id: string, event: Partial<Event>) {
    return http.put<Event>(`/api/events/${id}`, event);
  },

  deleteEvent(id: string) {
    return http.delete(`/api/events/${id}`);
  },

  createEventsList(events: Omit<Event, 'id'>[]) {
    return http.post<Event[]>('/api/events-list', { events });
  },

  updateEventsList(events: Partial<Event>[]) {
    return http.put<Event[]>('/api/events-list', { events });
  },

  deleteEventsList(eventIds: string[]) {
    return http.delete('/api/events-list', { data: { eventIds } });
  },
};
