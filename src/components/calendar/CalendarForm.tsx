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

import { CALENDAR_NOTIFICATION_OPTIONS } from '../../constants.ts';
import { useDialog } from '../../hooks/useDialog.ts';
import { useEventForm } from '../../hooks/useEventForm.ts';
import { Dialog_e } from '../../providers/DialogProvider.tsx';
import { Event, EventForm, RepeatType } from '../../types.ts';
import { findOverlappingEvents } from '../../utils/eventOverlap.ts';
import { generateFutureRepeatEvents } from '../../utils/eventRepeat.ts';
import { getTimeErrorMessage } from '../../utils/timeValidation.ts';

type CalendarFormProps = {
  events: Event[];
  editingEvent: Event | null;
  // eslint-disable-next-line no-unused-vars
  saveEvent: (event: Event | EventForm) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  saveEventsList: (events: Event[] | EventForm[]) => Promise<void>;
};

export const CalendarForm = ({
  events,
  editingEvent,
  saveEvent,
  saveEventsList,
}: CalendarFormProps) => {
  const categories = ['업무', '개인', '가족', '기타'];

  const { openDialog } = useDialog();
  const toast = useToast();

  const {
    title,
    setTitle,
    date,
    setDate,
    startTime,
    endTime,
    description,
    setDescription,
    location,
    setLocation,
    category,
    setCategory,
    isRepeating,
    repeatType,
    setRepeatType,
    repeatInterval,
    setRepeatInterval,
    repeatEndDate,
    setRepeatEndDate,
    notificationTime,
    setNotificationTime,
    startTimeError,
    endTimeError,
    handleStartTimeChange,
    handleEndTimeChange,
    resetForm,
  } = useEventForm(editingEvent ?? undefined);

  const addOrUpdateEvent = async () => {
    if (!title || !date || !startTime || !endTime) {
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

    const _eventDate = new Date(date);
    const _repeatEndDate = new Date(repeatEndDate);
    if (_repeatEndDate.getTime() < _eventDate.getTime()) {
      toast({
        title: '반복 종료일은 해당 이벤트 날짜 이후여야 해요.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const eventData: Event | EventForm = {
      id: editingEvent ? editingEvent.id : undefined,
      title,
      date,
      startTime,
      endTime,
      description,
      location,
      category,
      repeat: {
        type: editingEvent ? 'none' : isRepeating ? repeatType : 'none',
        interval: editingEvent ? 0 : repeatInterval,
        endDate: editingEvent ? undefined : repeatEndDate,
      },
      notificationTime,
    };

    const overlapping = findOverlappingEvents(eventData, events);

    resetForm();
    if (overlapping.length > 0) {
      openDialog(Dialog_e.ScheduleOverlap, {
        overlappingEvents: overlapping,
        saveEvent: () => saveEvent(eventData),
      });
    } else {
      if (!editingEvent && isRepeating) {
        const repeatEvents = [eventData, ...generateFutureRepeatEvents(eventData)];
        await saveEventsList(repeatEvents);
      } else {
        await saveEvent(eventData);
      }
      resetForm();
    }
  };

  return (
    <VStack w="400px" spacing={5} align="stretch">
      <Heading>{editingEvent ? '일정 수정' : '일정 추가'}</Heading>

      <FormControl>
        <FormLabel>제목</FormLabel>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </FormControl>

      <FormControl>
        <FormLabel>날짜</FormLabel>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </FormControl>

      <HStack width="100%">
        <FormControl>
          <FormLabel>시작 시간</FormLabel>
          <Tooltip label={startTimeError} isOpen={!!startTimeError} placement="top">
            <Input
              type="time"
              value={startTime}
              onChange={handleStartTimeChange}
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
              onChange={handleEndTimeChange}
              onBlur={() => getTimeErrorMessage(startTime, endTime)}
              isInvalid={!!endTimeError}
            />
          </Tooltip>
        </FormControl>
      </HStack>

      <FormControl>
        <FormLabel>설명</FormLabel>
        <Input value={description} onChange={(e) => setDescription(e.target.value)} />
      </FormControl>

      <FormControl>
        <FormLabel>위치</FormLabel>
        <Input value={location} onChange={(e) => setLocation(e.target.value)} />
      </FormControl>

      <FormControl>
        <FormLabel>카테고리</FormLabel>
        <Select value={category} onChange={(e) => setCategory(e.target.value)}>
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
          onChange={(e) => setRepeatType(e.target.checked ? 'daily' : 'none')}
        >
          반복 일정
        </Checkbox>
      </FormControl>

      <FormControl>
        <FormLabel>알림 설정</FormLabel>
        <Select
          value={notificationTime}
          onChange={(e) => setNotificationTime(Number(e.target.value))}
        >
          {CALENDAR_NOTIFICATION_OPTIONS.map((option) => (
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
              onChange={(e) => setRepeatType(e.target.value as RepeatType)}
            >
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
                onChange={(e) => setRepeatInterval(Number(e.target.value))}
                min={1}
              />
            </FormControl>
            <FormControl>
              <FormLabel>반복 종료일</FormLabel>
              <Input
                type="date"
                value={repeatEndDate}
                onChange={(e) => setRepeatEndDate(e.target.value)}
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
