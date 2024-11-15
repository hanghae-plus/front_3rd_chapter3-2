import { Text } from '@chakra-ui/react';

import { Event } from '../../types';

interface AlertDialogBodyProps {
  overlappingEvents: Event[];
}

const AlertDialogBodyText = ({ overlappingEvents }: AlertDialogBodyProps) => {
  return (
    <>
      다음 일정과 겹칩니다 :
      {overlappingEvents.map((event) => (
        <Text key={event.id}>
          {event.title} ({event.date} {event.startTime}-{event.endTime})
        </Text>
      ))}
      계속 진행하시겠습니까?
    </>
  );
};

export default AlertDialogBodyText;
