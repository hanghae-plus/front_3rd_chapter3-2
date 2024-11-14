import { Event, EventForm, EventId } from '../types';
import { safeFetch } from '../utils/safeFetch';

const api = {
  events: '/api/events',
  eventsList: '/api/events-list',
};

type EventsResponse = { events: Event[] };

export const eventApi = {
  /** 이벤트 가져오기 */
  fetchEvents: async () => {
    const { events } = await safeFetch<EventsResponse>(api.events);
    return events;
  },

  /** 단일 이벤트 추가 */
  addEvent: async (eventForm: EventForm) => {
    const response = await safeFetch.post<Event>(api.events, eventForm);
    return response;
  },

  /** 단일 이벤트 수정 */
  editEvent: async (event: Event) => {
    const response = await safeFetch.put<Event>(`${api.events}/${event.id}`, event);
    return response;
  },

  /** 단일 이벤트 삭제 */
  deleteEvent: async (id: EventId) => {
    const response = await safeFetch.delete(`${api.events}/${id}`);
    return response;
  },

  /** 이벤트 목록 추가 */
  addEventList: async (events: EventForm[]) => {
    const response = await safeFetch.post<EventsResponse>(api.eventsList, { events });
    return response;
  },

  /** 이벤트 목록 수정 */
  editEventList: async (events: Event[]) => {
    const response = await safeFetch.put<EventsResponse>(api.eventsList, { events });
    return response;
  },
};
