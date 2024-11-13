import {
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Select,
  Tooltip,
  VStack,
} from '@chakra-ui/react';

import { useAddOrUpdateEvent, UseAddOrUpdateEventProps } from './useAddOrUpdateEvent';
import { notificationOptions } from '../../constants/notification';
import { useEventFormStore } from '../../store/useEventFormStore';
import { RepeatType } from '../../types';
import { getTimeErrorMessage } from '../../utils/timeValidation';

const categories = ['업무', '개인', '가족', '기타'];

export const EventInputForm = (props: UseAddOrUpdateEventProps) => {
  const {
    eventForm: {
      title,
      date,
      startTime,
      endTime,
      description,
      location,
      category,
      isRepeating,
      repeat: { type: repeatType, interval: repeatInterval, endDate: repeatEndDate },
      notificationTime,
    },
    setEventForm,
    timeErrorRecord: { startTimeError, endTimeError },
    editingEvent,
    changeStartTime,
    changeEndTime,
  } = useEventFormStore();

  const addOrUpdateEvent = useAddOrUpdateEvent(props);

  return (
    <VStack w="400px" spacing={5} align="stretch">
      <Heading>{editingEvent ? '일정 수정' : '일정 추가'}</Heading>

      <FormControl>
        <FormLabel>제목</FormLabel>
        <Input value={title} onChange={(e) => setEventForm({ title: e.target.value })} />
      </FormControl>

      <FormControl>
        <FormLabel>날짜</FormLabel>
        <Input type="date" value={date} onChange={(e) => setEventForm({ date: e.target.value })} />
      </FormControl>

      <HStack width="100%">
        <FormControl>
          <FormLabel>시작 시간</FormLabel>
          <Tooltip label={startTimeError} isOpen={!!startTimeError} placement="top">
            <Input
              type="time"
              value={startTime}
              onChange={(e) => changeStartTime(e.target.value)}
              onBlur={() => getTimeErrorMessage(startTime, endTime)}
              isInvalid={!!startTimeError}
            />
          </Tooltip>
        </FormControl>
        <FormControl>
          <FormLabel>종료 시간</FormLabel>
          <Tooltip label={endTimeError} isOpen={!!endTimeError} placement="top">
            <Input
              type="time"
              value={endTime}
              onChange={(e) => changeEndTime(e.target.value)}
              onBlur={() => getTimeErrorMessage(startTime, endTime)}
              isInvalid={!!endTimeError}
            />
          </Tooltip>
        </FormControl>
      </HStack>

      <FormControl>
        <FormLabel>설명</FormLabel>
        <Input
          value={description}
          onChange={(e) => setEventForm({ description: e.target.value })}
        />
      </FormControl>

      <FormControl>
        <FormLabel>위치</FormLabel>
        <Input value={location} onChange={(e) => setEventForm({ location: e.target.value })} />
      </FormControl>

      <FormControl>
        <FormLabel>카테고리</FormLabel>
        <Select value={category} onChange={(e) => setEventForm({ category: e.target.value })}>
          <option value="">카테고리 선택</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </Select>
      </FormControl>

      <FormControl>
        <FormLabel>반복 설정</FormLabel>
        <Checkbox
          isChecked={isRepeating}
          onChange={(e) => setEventForm({ isRepeating: e.target.checked })}
          disabled={Boolean(editingEvent)}
        >
          반복 일정
        </Checkbox>
      </FormControl>

      <FormControl>
        <FormLabel>알림 설정</FormLabel>
        <Select
          value={notificationTime}
          onChange={(e) => setEventForm({ notificationTime: Number(e.target.value) })}
        >
          {notificationOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </FormControl>

      {isRepeating && (
        <VStack width="100%">
          <FormControl>
            <FormLabel>반복 유형</FormLabel>
            <Select
              value={repeatType}
              onChange={(e) => setEventForm({ repeat: { type: e.target.value as RepeatType } })}
              disabled={Boolean(editingEvent)}
            >
              <option value="none" disabled>
                선택하기
              </option>
              <option value="daily">매일</option>
              <option value="weekly">매주</option>
              <option value="monthly">매월</option>
              <option value="yearly">매년</option>
            </Select>
          </FormControl>
          <HStack width="100%">
            <FormControl>
              <FormLabel>반복 간격</FormLabel>
              <Input
                type="number"
                value={repeatInterval}
                onChange={(e) => setEventForm({ repeat: { interval: Number(e.target.value) } })}
                min={1}
                disabled={Boolean(editingEvent)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>반복 종료일</FormLabel>
              <Input
                type="date"
                value={repeatEndDate}
                onChange={(e) => setEventForm({ repeat: { endDate: e.target.value } })}
                disabled={Boolean(editingEvent)}
              />
            </FormControl>
          </HStack>
        </VStack>
      )}

      <Button data-testid="event-submit-button" onClick={addOrUpdateEvent} colorScheme="blue">
        {editingEvent ? '일정 수정' : '일정 추가'}
      </Button>
    </VStack>
  );
};
