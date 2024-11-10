import { setupServer } from 'msw/node';
import '@testing-library/jest-dom';

import { handlers } from './__mocks__/handlers';
import { setupMockHandlers } from './__mocks__/handlersUtils';
import { events } from './__mocks__/response/events.json' assert { type: 'json' };
import { Event } from './types';

/* msw */
export const server = setupServer(...handlers);
const initialEvents = [...events] as const;

vi.stubEnv('TZ', 'UTC');

beforeAll(() => {
  server.listen();
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

beforeEach(() => {
  server.use(...setupMockHandlers([...initialEvents] as Event[]));

  expect.hasAssertions();

  vi.setSystemTime(new Date('2024-10-01'));
});

afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});

afterAll(() => {
  vi.resetAllMocks();
  vi.useRealTimers();
  server.close();
});
