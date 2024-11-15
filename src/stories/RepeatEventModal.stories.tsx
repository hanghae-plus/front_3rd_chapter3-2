import { ComponentMeta, ComponentStory } from '@storybook/react';

import RepeatEventModal from '../components/RepeatEventModal';

export default {
  title: 'Components/RepeatEventModal',
  component: RepeatEventModal,
} as ComponentMeta<typeof RepeatEventModal>;

const Template: ComponentStory<typeof RepeatEventModal> = (args) => <RepeatEventModal {...args} />;

export const Default = Template.bind({});
Default.args = {
  isOpen: true,
  onClose: () => console.log('Modal closed'),
  selectedEvent: {
    id: '1',
    title: '반복 회의',
    date: '2024-11-15',
    startTime: '10:00',
    endTime: '11:00',
    description: '팀 회의',
    location: '회의실',
    category: '업무',
    repeat: { type: 'weekly', interval: 1, endDate: '2024-12-31' },
    notificationTime: 10,
  },
};

export const NoRepeat = Template.bind({});
NoRepeat.args = {
  isOpen: true,
  onClose: () => console.log('Modal closed'),
  selectedEvent: {
    id: '2',
    title: '단일 회의',
    date: '2024-11-16',
    startTime: '14:00',
    endTime: '15:00',
    description: '프로젝트 회의',
    location: '온라인',
    category: '업무',
    repeat: { type: 'none', interval: 0, endDate: '' },
    notificationTime: 10,
  },
};

export const Closed = Template.bind({});
Closed.args = {
  isOpen: false,
  onClose: () => console.log('Modal closed'),
  selectedEvent: null,
};
