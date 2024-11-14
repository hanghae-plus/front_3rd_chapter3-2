import { EditingEventHeading } from '@atoms/EditingEventHeading';
import { HStack, VStack } from '@chakra-ui/react';
import { NewScheduleTitle } from '@molecules/addScheduleForm/NewScheduleTitle';
import { RepeatAlarmSetting } from '@molecules/addScheduleForm/RepeatAlarmSetting';
import { RepeatCheckBox } from '@molecules/addScheduleForm/RepeatCheckBox';
import { RepeatDateSetting } from '@molecules/addScheduleForm/RepeatDateSetting';
import { RepeatDescription } from '@molecules/addScheduleForm/RepeatDescription';
import { RepeatLocation } from '@molecules/addScheduleForm/RepeatLocation';
import { RepeatTimeSetting } from '@molecules/addScheduleForm/RepeatTimeSetting';
import { EditingEventButton } from '@molecules/EditingEventButton';
import { SelectCategory } from '@molecules/SelectCategory';
import { SetRepeatDetail } from '@organisms/SetRepeatDetail';
import React from 'react';

import { TEST_ID } from '@/constants/testID';

export const AddSchedule: React.FC = () => {
  return (
    <VStack w="400px" spacing={5} align="stretch" data-testid={TEST_ID.EDIT_AREA}>
      {/* 일정 수정 / 추가 Heading */}
      <EditingEventHeading />
      {/* 제목 */}
      <NewScheduleTitle />

      {/* 날짜 */}
      <RepeatDateSetting />

      {/* 시작시간 , 종료 시간 */}
      <HStack width="100%">
        <RepeatTimeSetting />
      </HStack>

      {/* 설명 */}
      <RepeatDescription />
      {/* 위치 */}
      <RepeatLocation />

      {/* 카테고리 선택 */}
      <SelectCategory />

      {/* 반복 설정 */}
      <RepeatCheckBox />

      {/* 알림 설정 */}
      <RepeatAlarmSetting />

      {/* 반복 상세 설정 */}
      <SetRepeatDetail />

      {/* 일정 추가/수정 버튼 */}
      <EditingEventButton />
    </VStack>
  );
};
