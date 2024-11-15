import { ComponentMeta, ComponentStory } from '@storybook/react';

import EventList from '../components/EventList';
import { Event } from '../types';

export default {
  title: 'Components/EventList',
  component: EventList,
} as ComponentMeta<typeof EventList>;

const Template: ComponentStory<typeof EventList> = (args) => <EventList {...args} />;

export const Default = Template.bind({});
Default.args = {
  events: [
    {
      id: '1',
      title: '회의',
      date: '2024-11-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '팀 회의',
      location: '회의실',
      category: '업무',
      repeat: { type: 'weekly', interval: 1, endDate: '2024-12-31' }, // 반복 설정 추가
      notificationTime: 10,
    },
    {
      id: '2',
      title: '점심 식사',
      date: '2024-11-15',
      startTime: '12:00',
      endTime: '13:00',
      description: '친구와 점심',
      location: '식당',
      category: '개인',
      repeat: { type: 'none', interval: 0, endDate: '' },
      notificationTime: 60,
    },
  ],
  searchTerm: '',
  setSearchTerm: (term: string) => console.log('Search Term:', term),
  notifiedEvents: ['1'],
  notificationOptions: [
    { value: 1, label: '1분 전' },
    { value: 10, label: '10분 전' },
    { value: 60, label: '1시간 전' },
  ],
  editEvent: (event: Event) => console.log('Edit', event),
  deleteEvent: (id: string) => console.log('Delete', id),
  onRepeatIconClick: (event: Event) => console.log('Repeat Icon Clicked', event), // 콜백 추가
};

export const NoEvents = Template.bind({});
NoEvents.args = {
  events: [],
  searchTerm: '',
  setSearchTerm: (term: string) => console.log('Search Term:', term),
  notifiedEvents: [],
  notificationOptions: [
    { value: 1, label: '1분 전' },
    { value: 10, label: '10분 전' },
    { value: 60, label: '1시간 전' },
  ],
  editEvent: (event: Event) => console.log('Edit', event),
  deleteEvent: (id: string) => console.log('Delete', id),
  onRepeatIconClick: (event: Event) => console.log('Repeat Icon Clicked', event), // 콜백 추가
};

export const WithSearchTerm = Template.bind({});
WithSearchTerm.args = {
  events: [
    {
      id: '1',
      title: '회의',
      date: '2024-11-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '팀 회의',
      location: '회의실',
      category: '업무',
      repeat: { type: 'weekly', interval: 1, endDate: '2024-12-31' }, // 반복 설정 추가
      notificationTime: 10,
    },
    {
      id: '2',
      title: '점심 식사',
      date: '2024-11-15',
      startTime: '12:00',
      endTime: '13:00',
      description: '친구와 점심',
      location: '식당',
      category: '개인',
      repeat: { type: 'none', interval: 0, endDate: '' },
      notificationTime: 60,
    },
  ],
  searchTerm: '회의',
  setSearchTerm: (term: string) => console.log('Search Term:', term),
  notifiedEvents: ['1'],
  notificationOptions: [
    { value: 1, label: '1분 전' },
    { value: 10, label: '10분 전' },
    { value: 60, label: '1시간 전' },
  ],
  editEvent: (event: Event) => console.log('Edit', event),
  deleteEvent: (id: string) => console.log('Delete', id),
  onRepeatIconClick: (event: Event) => console.log('Repeat Icon Clicked', event), // 콜백 추가
};
