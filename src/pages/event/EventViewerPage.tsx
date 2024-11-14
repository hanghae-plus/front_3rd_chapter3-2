import { Box } from '@chakra-ui/react';

import { EventAlert, EventNotifications } from '@/features/event/ui';
import { EventViewer } from '@/widget/event/ui';
export const EventViewerPage = () => {
  return (
    <Box w="full" h="100vh" m="auto" p={5}>
      <EventViewer />
      {/* 일정 겹침 알림 */}
      <EventAlert />
      {/* 일정 알림 */}
      <EventNotifications />
    </Box>
  );
};
