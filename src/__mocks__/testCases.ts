import { Event } from 'src/types';

import { createEvent } from './Factory';
import { events } from '../__mocks__/response/events.json' assert { type: 'json' };

const mockEvents = [...events] as Event[];
export const searchTestCase = [
  {
    target: '제목',
    search: '점심',
    expected: [createEvent({ ...mockEvents[2] })],
  },
  {
    target: '설명',
    search: '리뷰',
    expected: [createEvent({ ...mockEvents[1] }), createEvent({ ...mockEvents[3] })],
  },
  {
    target: '위치',
    search: '식당',
    expected: [createEvent({ ...mockEvents[2] })],
  },
  {
    target: '제목+위치',
    search: '회의',
    expected: [
      createEvent({ ...mockEvents[0] }),
      createEvent({ ...mockEvents[1] }),
      createEvent({ ...mockEvents[3] }),
    ],
  },
];

export const viewEventTestCase = [
  {
    view: 'week' as 'month' | 'week',
    expected: [createEvent({ ...mockEvents[2] })],
  },
  {
    view: 'month' as 'month' | 'week',
    expected: [...mockEvents],
  },
];
