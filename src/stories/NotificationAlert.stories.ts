import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { NotificationAlert } from '../components/alerts/NotificationAlert';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta: Meta<typeof NotificationAlert> = {
  title: 'Alerts/NotificationAlert',
  component: NotificationAlert,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: { onClick: fn() },
} satisfies Meta<typeof NotificationAlert>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
  args: {
    notification: { id: '1', message: '10분 후 신규 일정이 시작됩니다.' },
  },
};
