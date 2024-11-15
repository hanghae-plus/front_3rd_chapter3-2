import { RepeatIcon } from '@chakra-ui/icons';
import { HStack, Text } from '@chakra-ui/react';
import { RepeatEvent } from '../types';

interface EventItemProps {
  event: RepeatEvent;
}

const EventItem = ({ event }: EventItemProps) => {
  const getRepeatText = () => {
    if (!event.isRepeating) return '';

    const intervalText = event.repeatInterval > 1 ? event.repeatInterval : '';
    switch (event.repeatType) {
      case 'daily':
        return `${intervalText}일마다 반복`;
      case 'weekly':
        return `${intervalText}주마다 반복`;
      case 'monthly':
        return `${intervalText}개월마다 반복`;
      case 'yearly':
        return `${intervalText}년마다 반복`;
      default:
        return '';
    }
  };

  return (
    <HStack spacing={2}>
      <Text>{event.title}</Text>
      {event.isRepeating && (
        <RepeatIcon
          data-testid="repeat-icon"
          title={getRepeatText()}
          color="blue.500"
          cursor="help"
        />
      )}
    </HStack>
  );
};

export default EventItem;
