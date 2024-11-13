import type { Meta, StoryFn } from '@storybook/react';
import { fn } from '@storybook/test';
import { Provider } from 'jotai';
import { ChangeEvent } from 'react';

import RepeatSelect, { Props } from '../components/eventManageView/RepeatSelect';
import { useEventForm } from '../hooks/useEventForm';
import { RepeatType } from '../types';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta: Meta<typeof RepeatSelect> = {
  title: 'Select/RepeatSelect',
  component: RepeatSelect,
  decorators: [
    (Story) => (
      <Provider>
        <Story />
      </Provider>
    ),
  ],
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  // argTypes: {
  //   backgroundColor: { control: 'color' },
  // },
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: { onChange: fn() },
} satisfies Meta<typeof RepeatSelect>;

export default meta;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args

const Template: StoryFn<Props> = (args) => {
  const { repeatType, setRepeatType } = useEventForm();

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setRepeatType(e.target.value as RepeatType);
    if (args.onChange) {
      args.onChange(e);
    }
  };

  return <RepeatSelect repeatType={repeatType} onChange={handleChange} />;
};

export const DefaultRepeatSelect = Template.bind({});
DefaultRepeatSelect.args = {
  onChange: (e: ChangeEvent<HTMLSelectElement>) => {
    console.log('Selected:', e.target.value);
  },
};
