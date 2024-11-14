/* eslint-disable no-unused-vars */
import { useRef } from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import OverlapAlertDialog from '../components/OverlapAlertDialog';

export default {
  title: 'Components/OverlapAlertDialog',
  component: OverlapAlertDialog,
} as ComponentMeta<typeof OverlapAlertDialog>;

const Template: ComponentStory<typeof OverlapAlertDialog> = (args) => {
  const cancelRef = useRef<HTMLButtonElement>(null);
  return <OverlapAlertDialog {...args} cancelRef={cancelRef} />;
};

export const Default = Template.bind({});
Default.args = {
  isOpen: true,
  onClose: () => console.log('Dialog closed'),
  overlappingEvents: [
    {
      id: '1',
      title: '회의',
      date: '2024-11-15',
      startTime: '10:00',
      endTime: '11:00',
    },
    {
      id: '2',
      title: '점심 식사',
      date: '2024-11-15',
      startTime: '12:00',
      endTime: '13:00',
    },
  ],
  onConfirm: () => console.log('Confirmed'),
};

export const NoOverlap = Template.bind({});
NoOverlap.args = {
  isOpen: true,
  onClose: () => console.log('Dialog closed'),
  overlappingEvents: [],
  onConfirm: () => console.log('Confirmed'),
}; 