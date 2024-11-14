import { fetchJson, RequestInit } from '@apis/fetchJson';

export const fetchEvents = async (
  url: string = '',
  requestInit?: Omit<RequestInit, 'body'> & { body?: any }
) => {
  return await fetchJson(`/api/events${url}`, { ...requestInit });
};
