import { Box, Flex, useToast } from '@chakra-ui/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AddSchedule } from '@templates/AddSchedule.tsx';
import { AlertDuplicateSchedule } from '@templates/AlertDialog.tsx';
import { CalendarManager } from '@/components/templates/CalendarManager';
import { Notification } from '@templates/Notification.tsx';
import { ScheduleManager } from '@templates/ScheduleManager.tsx';

import { createQueryClient } from './createQueryClient';

function App() {
  const toast = useToast();
  const queryClient = createQueryClient(toast);

  return (
    <QueryClientProvider client={queryClient}>
      <Box w="full" h="100vh" m="auto" p={5}>
        <Flex gap={6} h="full">
          {/* 일정 추가 */}
          <AddSchedule />

          {/* 일정 보기 */}
          <CalendarManager />

          {/* 일정 검색 */}
          <ScheduleManager />
        </Flex>

        <AlertDuplicateSchedule />

        <Notification />
      </Box>
      <ReactQueryDevtools initialIsOpen={false} position="right" />
    </QueryClientProvider>
  );
}

export default App;
