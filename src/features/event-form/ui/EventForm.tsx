/* eslint-disable react-hooks/rules-of-hooks */
import { Checkbox, Heading, Text, useColorModeValue } from '@chakra-ui/react';
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

    // Color mode values
    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const headingColor = useColorModeValue('blue.600', 'blue.300');

    return (
      <VStack
        w="100%"
        maxW="500px"
        spacing={6}
        align="stretch"
        bg={bgColor}
        p={8}
        borderRadius="lg"
        boxShadow="lg"
        border="1px"
        borderColor={borderColor}
        style={{
          overflowY: 'auto',
        }}
      >
        <Heading size="lg" color={headingColor} mb={2}>
          {initialEvent ? '일정 수정' : '일정 추가'}
        </Heading>

        <FormControl isRequired>
          <FormLabel fontWeight="medium">제목</FormLabel>
          <Input
            name="title"
            value={formState?.title}
            onChange={handleInputChange}
            placeholder="일정 제목을 입력하세요"
            size="lg"
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel fontWeight="medium">날짜</FormLabel>
          <Input
            type="date"
            name="date"
            value={formState?.date}
            onChange={handleInputChange}
            size="lg"
          />
        </FormControl>

        <HStack spacing={4}>
          <FormControl isRequired isInvalid={!!errors?.startTime}>
            <FormLabel fontWeight="medium">시작 시간</FormLabel>
            <Input
              type="time"
              name="startTime"
              value={formState?.startTime}
              onChange={handleInputChange}
              size="lg"
            />
          </FormControl>

          <FormControl isRequired isInvalid={!!errors?.endTime}>
            <FormLabel fontWeight="medium">종료 시간</FormLabel>
            <Input
              type="time"
              name="endTime"
              value={formState?.endTime}
              onChange={handleInputChange}
              size="lg"
            />
          </FormControl>
        </HStack>

        <FormControl>
          <FormLabel fontWeight="medium">설명</FormLabel>
          <Input
            name="description"
            value={formState?.description}
            onChange={handleInputChange}
            placeholder="일정에 대한 설명을 입력하세요"
            size="lg"
          />
        </FormControl>

        <FormControl>
          <FormLabel fontWeight="medium">위치</FormLabel>
          <Input
            name="location"
            value={formState?.location}
            onChange={handleInputChange}
            placeholder="위치를 입력하세요"
            size="lg"
          />
        </FormControl>

        <FormControl>
          <FormLabel fontWeight="medium">카테고리</FormLabel>
          <Select
            name="category"
            value={formState?.category}
            onChange={handleInputChange}
            size="lg"
          >
            <option value="">카테고리 선택</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Select>
        </FormControl>

        <FormControl bg={useColorModeValue('gray.50', 'gray.700')} p={4} borderRadius="md">
          <FormLabel fontWeight="medium">반복 설정</FormLabel>
          <Checkbox
            name="isRepeating"
            isChecked={formState?.isRepeating}
            onChange={handleCheckboxChange}
            colorScheme="blue"
            size="lg"
          >
            반복 일정
          </Checkbox>
        </FormControl>

        {formState?.isRepeating && (
          <VStack spacing={4} bg={useColorModeValue('gray.50', 'gray.700')} p={4} borderRadius="md">
            <FormControl>
              <FormLabel fontWeight="medium">반복 유형</FormLabel>
              <Select
                name="repeatType"
                value={formState?.repeatType}
                onChange={handleInputChange}
                size="lg"
              >
                <option value="daily">매일</option>
                <option value="weekly">매주</option>
                <option value="monthly">매월</option>
                <option value="yearly">매년</option>
              </Select>
            </FormControl>
            {formState?.isRepeating && (
              <FormControl>
                <FormLabel fontWeight="medium">종료 조건</FormLabel>
                <Select
                  name="repeatCondition"
                  value={formState?.repeatCondition}
                  onChange={handleInputChange}
                  size="lg"
                >
                  <option value="date">날짜</option>
                  <option value="count">횟수</option>
                  <option value="none">종료 없음</option>
                </Select>
              </FormControl>
            )}

            <HStack spacing={4} width="100%">
              <FormControl>
                <FormLabel fontWeight="medium">반복 간격</FormLabel>
                <HStack>
                  <Input
                    type="number"
                    inputMode="numeric"
                    name="repeatInterval"
                    value={formState.repeatInterval}
                    onChange={handleInputChange}
                    size="lg"
                  />
                  <Text>
                    {formState.repeatType === 'daily' && '일'}
                    {formState.repeatType === 'weekly' && '주'}
                    {formState.repeatType === 'monthly' && '달'}
                    {formState.repeatType === 'yearly' && '년'}
                  </Text>
                </HStack>
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="medium">
                  {formState?.repeatCondition === 'date'
                    ? '종료 날짜'
                    : formState?.repeatCondition === 'count'
                      ? '반복 횟수'
                      : ''}
                </FormLabel>
                {formState?.repeatCondition === 'date' ? (
                  <Input
                    type="date"
                    name="repeatEndDate"
                    value={formState.repeatEndDate}
                    onChange={handleInputChange}
                    size="lg"
                  />
                ) : formState?.repeatCondition === 'count' ? (
                  <Input
                    type="number"
                    inputMode="numeric"
                    name="repeatEndDate"
                    value={formState.repeatEndDate}
                    onChange={handleInputChange}
                    size="lg"
                  />
                ) : (
                  <Text>{formState?.repeatCondition === 'none' && '종료 없음'}</Text>
                )}
              </FormControl>
            </HStack>
          </VStack>
        )}

        <FormControl>
          <FormLabel fontWeight="medium">알림 설정</FormLabel>
          <Select
            name="notificationTime"
            value={formState?.notificationTime}
            onChange={handleInputChange}
            size="lg"
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
          size="xl"
          mt={4}
          _hover={{
            transform: 'translateY(-2px)',
            boxShadow: 'lg',
          }}
          transition="all 0.2s"
        >
          {initialEvent ? '일정 수정' : '일정 추가'}
        </Button>
      </VStack>
    );
  }
);
