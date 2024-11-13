import { Event, EventForm, EventId } from '../types';
import { safeFetch } from '../utils/safeFetch';

const api = {
  events: '/api/events',
  eventsList: '/api/events-list',
};

type EventsResponse = { events: Event[] };

export const eventApi = {
  fetchEvents: async () => {
    const { events } = await safeFetch<EventsResponse>(api.events);
    return events;
  },

  addEvent: async (eventForm: EventForm) => {
    const response = await safeFetch.post<Event>(api.events, eventForm);
    return response;
  },

  editEvent: async (event: Event) => {
    const response = await safeFetch.put<Event>(`${api.events}/${event.id}`, event);
    return response;
  },

  deleteEvent: async (id: EventId) => {
    const response = await safeFetch.delete(`${api.events}/${id}`);
    return response;
  },

  addEventList: async (events: EventForm[]) => {
    const response = await safeFetch.post<EventsResponse>(api.eventsList, { events });
    return response;
  },

  editEventList: async (events: Event[]) => {
    const response = await safeFetch.put<EventsResponse>(api.eventsList, { events });
    return response;
  },
};
