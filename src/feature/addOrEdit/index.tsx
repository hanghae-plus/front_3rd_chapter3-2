import {
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  HStack,
  Tooltip,
  Select,
  Checkbox,
  Button,
  useToast,
} from '@chakra-ui/react';
import React from 'react';

import { CATEGORIES, NOTIFICATION_OPTIONS } from './@constant';
import { useEventForm } from './@hooks/useEventForm';
import { useCombinedContext } from '../../provider';
import { EventForm, Event } from '../../types';
import { findOverlappingEvents } from '../../utils/eventOverlap';
import { getTimeErrorMessage } from '../../utils/timeValidation';

export function AddOrEdit() {
  const { events, saveEvent, editingEvent, openOverlapDialog, setOverlappingEvents, editing } =
    useCombinedContext();

  const {
    eventForm,
    setEventForm,
    handleStartTimeChange,
    handleEndTimeChange,
    startTimeError,
    endTimeError,
    resetForm,
  } = useEventForm(editingEvent || undefined);

  const {
    title,
    date,
    startTime,
    endTime,
    description,
    location,
    category,
    repeat,
    notificationTime,
  } = eventForm;

  const { type, interval, endDate } = repeat;

  const toast = useToast();

  const isRepeating = repeat.type !== 'none';

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

    const eventData: Event | EventForm = {
      id: editingEvent ? editingEvent.id : undefined,
      ...eventForm,
    };

    const overlapping = findOverlappingEvents(eventData, events);
    if (overlapping.length > 0) {
      setOverlappingEvents(overlapping);
      openOverlapDialog(eventData as Event);
      resetForm();
    } else {
      await saveEvent(eventData);
      resetForm();
    }
  };

  const onClickRepeatCheckbox = () => {
    setEventForm((prev) => ({
      ...prev,
      repeat: { ...repeat, type: isRepeating ? 'none' : 'daily' },
    }));
  };

  const onChangeEventForm = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEventForm((prev) => ({ ...prev, [name]: value }));
  };

  const onChangeRepeatForm = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setEventForm((prev) => ({ ...prev, repeat: { ...repeat, [name]: value } }));
  };

  return (
    <VStack w="400px" spacing={5} align="stretch">
      <Heading>{editingEvent ? '일정 수정' : '일정 추가'}</Heading>

      <FormControl>
        <FormLabel>제목</FormLabel>
        <Input value={title} name="title" onChange={onChangeEventForm} />
      </FormControl>

      <FormControl>
        <FormLabel>날짜</FormLabel>
        <Input type="date" value={date} name="date" onChange={onChangeEventForm} />
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
        <Input value={description} name="description" onChange={onChangeEventForm} />
      </FormControl>

      <FormControl>
        <FormLabel>위치</FormLabel>
        <Input value={location} name="location" onChange={onChangeEventForm} />
      </FormControl>

      <FormControl>
        <FormLabel>카테고리</FormLabel>
        <Select value={category} name="category" onChange={onChangeEventForm}>
          <option value="">카테고리 선택</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </Select>
      </FormControl>

      {!editing && (
        <>
          <FormControl>
            <FormLabel>반복 설정</FormLabel>
            <Checkbox isChecked={isRepeating} onChange={onClickRepeatCheckbox}>
              반복 일정
            </Checkbox>
          </FormControl>

          <FormControl>
            <FormLabel>알림 설정</FormLabel>
            <Select value={notificationTime} name="notificationTime" onChange={onChangeEventForm}>
              {NOTIFICATION_OPTIONS.map((option) => (
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
                <Select name="type" value={type} onChange={onChangeRepeatForm}>
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
                    name="interval"
                    value={interval}
                    onChange={onChangeRepeatForm}
                    min={1}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>반복 종료일</FormLabel>
                  <Input type="date" name="endDate" value={endDate} onChange={onChangeRepeatForm} />
                </FormControl>
              </HStack>
            </VStack>
          )}
        </>
      )}

      <Button data-testid="event-submit-button" onClick={addOrUpdateEvent} colorScheme="blue">
        {editingEvent ? '일정 수정' : '일정 추가'}
      </Button>
    </VStack>
  );
}
