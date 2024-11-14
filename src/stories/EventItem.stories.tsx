/* eslint-disable no-unused-vars */
import { ComponentMeta } from '@storybook/react';
import { composeStory } from '@storybook/testing-react';
import EventItem from '../components/EventItem';
import { Event } from '../types';

export default {
  title: 'Components/EventItem',
  component: EventItem,
} as ComponentMeta<typeof EventItem>;

const Template = (args: any) => <EventItem {...args} />;

export const Default = composeStory(Template, {
  args: {
    event: {
      id: '1',
      title: '회의',
      date: '2024-11-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '팀 회의',
      location: '회의실',
      category: '업무',
      repeat: { type: 'none', interval: 0, endDate: '' },
      notificationTime: 10,
    },
    notifiedEvents: [],
    notificationOptions: [
      { value: 1, label: '1분 전' },
      { value: 10, label: '10분 전' },
      { value: 60, label: '1시간 전' },
    ],
    editEvent: (event: Event) => console.log('Edit', event),
    deleteEvent: (id: string) => console.log('Delete', id),
  },
});
