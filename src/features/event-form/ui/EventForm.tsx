import { Checkbox, Heading } from '@chakra-ui/react';
import { memo } from 'react';

import { Event } from '../../../entities/event/model/types';
import { categories, notificationOptions } from '../../../shared/config/constant';
import { Button } from '../../../shared/ui/Button';
import { FormControl, FormLabel } from '../../../shared/ui/FormControl';
import Input from '../../../shared/ui/Input';
import { Select } from '../../../shared/ui/Select';
import { HStack, VStack } from '../../../shared/ui/Stack';
import { useEventForm } from '../hooks/useEventForm';

export const EventForm = memo(
  ({
    initialEvent,
    onSubmit,
  }: {
    initialEvent: Event | null;
    onSubmit: (eventData: Event) => Promise<void>;
  }) => {
    const { formState, errors, handleInputChange, handleCheckboxChange } = useEventForm(
      initialEvent as unknown as Event
    );
    console.log(initialEvent);
    return (
      <VStack w="400px" spacing={5} align="stretch">
        <Heading>{initialEvent ? '일정 수정' : '일정 추가'}</Heading>
        <FormControl isRequired>
          <FormLabel>제목</FormLabel>
          <Input name="title" value={formState?.title} onChange={handleInputChange} />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>날짜</FormLabel>
          <Input type="date" name="date" value={formState?.date} onChange={handleInputChange} />
        </FormControl>

        <HStack>
          <FormControl isRequired isInvalid={!!errors?.startTime}>
            <FormLabel>시작 시간</FormLabel>
            <Input
              type="time"
              name="startTime"
              value={formState?.startTime}
              onChange={handleInputChange}
            />
          </FormControl>

          <FormControl isRequired isInvalid={!!errors?.endTime}>
            <FormLabel>종료 시간</FormLabel>
            <Input
              type="time"
              name="endTime"
              value={formState?.endTime}
              onChange={handleInputChange}
            />
          </FormControl>
        </HStack>

        <FormControl>
          <FormLabel>설명</FormLabel>
          <Input name="description" value={formState?.description} onChange={handleInputChange} />
        </FormControl>

        <FormControl>
          <FormLabel>위치</FormLabel>
          <Input name="location" value={formState?.location} onChange={handleInputChange} />
        </FormControl>

        <FormControl>
          <FormLabel>카테고리</FormLabel>
          <Select name="category" value={formState?.category} onChange={handleInputChange}>
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
            name="isRepeating"
            isChecked={formState?.isRepeating}
            onChange={handleCheckboxChange}
          >
            반복 일정
          </Checkbox>
        </FormControl>

        {formState?.isRepeating && (
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>반복 유형</FormLabel>
              <Select name="repeatType" value={formState?.repeatType} onChange={handleInputChange}>
                <option value="daily">매일</option>
                <option value="weekly">매주</option>
                <option value="monthly">매월</option>
                <option value="yearly">매년</option>
              </Select>
            </FormControl>

            <HStack>
              <FormControl>
                <FormLabel>반복 간격</FormLabel>
                <Input
                  type="number"
                  name="repeatInterval"
                  value={formState?.repeatInterval}
                  onChange={handleInputChange}
                  min={1}
                />
              </FormControl>

              <FormControl>
                <FormLabel>반복 종료일</FormLabel>
                <Input
                  type="date"
                  name="repeatEndDate"
                  value={formState.repeatEndDate}
                  onChange={handleInputChange}
                />
              </FormControl>
            </HStack>
          </VStack>
        )}

        <FormControl>
          <FormLabel>알림 설정</FormLabel>
          <Select
            name="notificationTime"
            value={formState?.notificationTime}
            onChange={handleInputChange}
          >
            {notificationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </FormControl>

        <Button
          onClick={(e) => {
            e.preventDefault();
            onSubmit(formState as unknown as Event);
          }}
          colorScheme="blue"
        >
          {initialEvent ? '일정 수정' : '일정 추가'}
        </Button>
      </VStack>
    );
  }
);
