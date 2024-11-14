/* eslint-disable no-unused-vars */
import { ComponentMeta, ComponentStory } from '@storybook/react';
import NotificationList from '../components/NotificationList';

export default {
  title: 'Components/NotificationList',
  component: NotificationList,
} as ComponentMeta<typeof NotificationList>;

const Template: ComponentStory<typeof NotificationList> = (args) => <NotificationList {...args} />;

export const Default = Template.bind({});
Default.args = {
  notifications: [
    { message: '첫 번째 알림입니다.' },
    { message: '두 번째 알림입니다.' },
    { message: '세 번째 알림입니다.' },
  ],
  onClose: (index: number) => console.log(`Notification ${index} closed`),
};

export const NoNotifications = Template.bind({});
NoNotifications.args = {
  notifications: [],
  onClose: (index: number) => console.log(`Notification ${index} closed`),
}; 