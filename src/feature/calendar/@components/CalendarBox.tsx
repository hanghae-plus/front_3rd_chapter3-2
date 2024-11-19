import { BellIcon } from '@chakra-ui/icons';
import { Box, HStack, Text } from '@chakra-ui/react';

type Props = {
  title: string;
  isNotified: boolean;
  isRepeat: boolean;
};

export function CalendarBox({ isNotified, title, isRepeat }: Props) {
  return (
    <Box
      p={1}
      my={1}
      bg={isNotified ? 'red.100' : 'gray.100'}
      borderRadius="md"
      fontWeight={isNotified ? 'bold' : 'normal'}
      color={isNotified ? 'red.500' : 'inherit'}
    >
      <HStack spacing={1}>
        {isNotified && <BellIcon />}
        <Text fontSize="sm" noOfLines={1} data-testid={isRepeat ? 'repeat-event' : undefined}>
          {isRepeat && <span>🔄</span>}
          {title}
        </Text>
      </HStack>
    </Box>
  );
}
