import { HStack, VStack } from '@chakra-ui/react';
import { RepeatEndDateSetting } from '@molecules/addScheduleForm/RepeatEndDateSetting';
import { RepeatIntervalSetting } from '@molecules/addScheduleForm/RepeatIntervalSetting';
import { RepeatTypeSetting } from '@molecules/addScheduleForm/RepeatTypeSetting';
import useScheduleForm from '@stores/useScheduleForm';
import React from 'react';

export const SetRepeatDetail: React.FC = () => {
  const isRepeating = useScheduleForm((state) => state.isRepeating);
  return (
    <>
      {isRepeating && (
        <VStack width="100%">
          {/* 반복 유형 */}
          <RepeatTypeSetting />

          <HStack width="100%">
            {/* 반복 간격 */}
            <RepeatIntervalSetting />

            {/* 반복 종료일 */}
            <RepeatEndDateSetting />
          </HStack>
        </VStack>
      )}
    </>
  );
};
