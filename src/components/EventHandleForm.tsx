/* eslint-disable no-unused-vars */
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
  useToast,
  VStack,
} from '@chakra-ui/react';
import { overlay } from 'overlay-kit';
import { ChangeEvent } from 'react';

import { Event, EventForm, RepeatInfo, RepeatType } from '../types';
import { OverlappingEventDialog } from './OverlappingEventDialog';
import { findOverlappingEvents } from '../utils/eventOverlap';
import { getTimeErrorMessage } from '../utils/timeValidation';

interface EventFormStateProps {
  eventForm: EventForm;
  handleChangeFormContent: <K extends keyof EventForm>(key: K, value: EventForm[K]) => void;
  handleChangeFormRepeat: <K extends keyof RepeatInfo>(key: K, value: RepeatInfo[K]) => void;
  isRepeating: boolean;
  handleChangeIsRepeating: (checked: boolean) => void;
  startTimeError: string | null;
  endTimeError: string | null;
  handleStartTimeChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleEndTimeChange: (e: ChangeEvent<HTMLInputElement>) => void;
  resetForm: () => void;
}

interface EventHandleFormProps {
  events: Event[];
  editingEvent: Event | null;
  eventFormState: EventFormStateProps;
  repeatExceptDate: string;
  weeklyDay: string;
  handleChangeWeeklyDay: (day: string) => void;
  saveEvent: (eventData: Event | EventForm, exceptDate?: string) => Promise<void>;
  handleChangeExceptDate: (date: string) => void;
}

const categories = ['업무', '개인', '가족', '기타'];

const notificationOptions = [
  { value: 1, label: '1분 전' },
  { value: 10, label: '10분 전' },
  { value: 60, label: '1시간 전' },
  { value: 120, label: '2시간 전' },
  { value: 1440, label: '1일 전' },
];

export const EventHandleForm = ({
  events,
  editingEvent,
  eventFormState,
  repeatExceptDate,
  weeklyDay,
  saveEvent,
  handleChangeExceptDate,
  handleChangeWeeklyDay,
}: EventHandleFormProps) => {
  const toast = useToast();
  const {
    eventForm,
    startTimeError,
    endTimeError,
    handleChangeFormContent,
    handleChangeFormRepeat,
    handleEndTimeChange,
    handleStartTimeChange,
    isRepeating,
    resetForm,
    handleChangeIsRepeating,
  } = eventFormState;

  const addOrUpdateEvent = async () => {
    if (!eventForm.title || !eventForm.date || !eventForm.startTime || !eventForm.endTime) {
      toast({
        title: '필수 정보를 모두 입력해주세요.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (startTimeError || endTimeError) {
      toast({
        title: '시간 설정을 확인해주세요.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const eventData: Event | EventForm = { ...eventForm };

    if ('id' in eventData && editingEvent) {
      eventData.id = editingEvent.id;
    }

    const overlappingEvents = findOverlappingEvents(eventData, events);
    if (overlappingEvents.length > 0) {
      overlay.open(({ isOpen, close }) => {
        return (
          <OverlappingEventDialog
            isOpen={isOpen}
            close={close}
            overlappingEvents={overlappingEvents}
            saveEvent={saveEvent}
            eventForm={eventForm}
            editingEvent={editingEvent}
            isRepeating={isRepeating}
          />
        );
      });
    } else {
      await saveEvent(eventData, repeatExceptDate);
      resetForm();
    }
  };
  return (
    <VStack w="400px" spacing={5} align="stretch" overflowY="auto">
      <Heading position="fixed" zIndex={10} bg="white" w="full">
        {editingEvent ? '일정 수정' : '일정 추가'}
      </Heading>

      <FormControl mt={20}>
        <FormLabel>제목</FormLabel>
        <Input
          value={eventForm.title}
          onChange={(e) => handleChangeFormContent('title', e.target.value)}
        />
      </FormControl>

      <FormControl>
        <FormLabel>날짜</FormLabel>
        <Input
          type="date"
          value={eventForm.date}
          onChange={(e) => handleChangeFormContent('date', e.target.value)}
        />
      </FormControl>

      <HStack width="100%">
        <FormControl>
          <FormLabel>시작 시간</FormLabel>
          <Tooltip label={startTimeError} isOpen={!!startTimeError} placement="top">
            <Input
              type="time"
              value={eventForm.startTime}
              onChange={handleStartTimeChange}
              onBlur={() => getTimeErrorMessage(eventForm.startTime, eventForm.endTime)}
              isInvalid={!!startTimeError}
            />
          </Tooltip>
        </FormControl>
        <FormControl>
          <FormLabel>종료 시간</FormLabel>
          <Tooltip label={endTimeError} isOpen={!!endTimeError} placement="top">
            <Input
              type="time"
              value={eventForm.endTime}
              onChange={handleEndTimeChange}
              onBlur={() => getTimeErrorMessage(eventForm.startTime, eventForm.endTime)}
              isInvalid={!!endTimeError}
            />
          </Tooltip>
        </FormControl>
      </HStack>

      <FormControl>
        <FormLabel>설명</FormLabel>
        <Input
          value={eventForm.description}
          onChange={(e) => handleChangeFormContent('description', e.target.value)}
        />
      </FormControl>

      <FormControl>
        <FormLabel>위치</FormLabel>
        <Input
          value={eventForm.location}
          onChange={(e) => handleChangeFormContent('location', e.target.value)}
        />
      </FormControl>

      <FormControl>
        <FormLabel>카테고리</FormLabel>
        <Select
          value={eventForm.category}
          onChange={(e) => handleChangeFormContent('category', e.target.value)}
        >
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
          onChange={(e) => handleChangeIsRepeating(e.target.checked)}
        >
          반복 일정
        </Checkbox>
      </FormControl>

      <FormControl>
        <FormLabel>알림 설정</FormLabel>
        <Select
          value={eventForm.notificationTime}
          onChange={(e) => handleChangeFormContent('notificationTime', Number(e.target.value))}
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
          <HStack width="100%">
            <FormControl>
              <FormLabel>반복 유형</FormLabel>
              <Select
                value={eventForm.repeat.type}
                onChange={(e) => handleChangeFormRepeat('type', e.target.value as RepeatType)}
              >
                <option value="daily">매일</option>
                <option value="weekly">매주</option>
                <option value="monthly">매월</option>
                <option value="yearly">매년</option>
              </Select>
            </FormControl>
            {eventForm.repeat.type === 'weekly' && (
              <FormControl>
                <FormLabel>요일 지정</FormLabel>
                <Select value={weeklyDay} onChange={(e) => handleChangeWeeklyDay(e.target.value)}>
                  <option value="sun">일</option>
                  <option value="mon">월</option>
                  <option value="tue">화</option>
                  <option value="wed">수</option>
                  <option value="thu">목</option>
                  <option value="fri">금</option>
                  <option value="sat">토</option>
                </Select>
              </FormControl>
            )}
          </HStack>

          <HStack width="100%">
            <FormControl>
              <FormLabel>반복 간격</FormLabel>
              <Input
                type="number"
                value={eventForm.repeat.interval}
                onChange={(e) => handleChangeFormRepeat('interval', Number(e.target.value))}
                min={1}
              />
            </FormControl>
            <FormControl>
              <FormLabel>반복 종료일</FormLabel>
              <Input
                type="date"
                value={eventForm.repeat.endDate || ''}
                onChange={(e) => handleChangeFormRepeat('endDate', e.target.value)}
              />
            </FormControl>
          </HStack>
          <FormControl>
            <FormLabel>반복 제외 날짜</FormLabel>
            <Input
              type="date"
              value={repeatExceptDate}
              onChange={(e) => handleChangeExceptDate(e.target.value)}
            />
          </FormControl>
        </VStack>
      )}

      <Button
        data-testid="event-submit-button"
        onClick={addOrUpdateEvent}
        colorScheme="blue"
        h={10}
      >
        {editingEvent ? '일정 수정' : '일정 추가'}
      </Button>
    </VStack>
  );
};
