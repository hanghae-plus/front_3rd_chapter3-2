import { Event, EventForm, EventId } from '../types';
import { safeFetch } from '../utils/safeFetch';

export const eventApi = {
  fetchEvents: async () => {
    const { events } = await safeFetch<{ events: Event[] }>('/api/events');
    return events;
  },

  addEvent: async (eventForm: EventForm | Event) => {
    const response = await safeFetch.post<Event>('/api/events', eventForm);
    return response;
  },

  editEvent: async (event: Event) => {
    const response = await safeFetch.put<Event>(`/api/events/${event.id}`, event);
    return response;
  },

  deleteEvent: async (id: EventId) => {
    const response = await safeFetch.delete(`/api/events/${id}`);
    return response;
  },
};
