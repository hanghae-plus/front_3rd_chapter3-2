/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
import { RepeatIcon } from '@chakra-ui/icons';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  Checkbox,
  Heading,
  Text,
  Tooltip,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react';
import { Dispatch, memo, SetStateAction, useCallback, useEffect, useRef } from 'react';

import RepeatDateMessage from './RepeatDateMessage';
import { getInitialFormState } from '../../../entities/event/lib/eventFormUtils';
import { Event, RepeatType } from '../../../entities/event/model/types';
import { categories } from '../../../shared/config/constant';
import { FormControl, FormLabel } from '../../../shared/ui/FormControl';
import Input from '../../../shared/ui/Input';
import { Select } from '../../../shared/ui/Select';
import { HStack, VStack } from '../../../shared/ui/Stack';
import { useEventForm } from '../hooks/useEventForm';
import { findRepeatDate } from '../lib/repeatDateUtils';

export const EventForm = memo(
  ({
    initialEvent,
    onSubmit,
    setEditingEvent,
  }: {
    initialEvent: Event | null;
    onSubmit: (eventData: Event) => Promise<void>;
    setEditingEvent: Dispatch<SetStateAction<Event | null>>;
  }) => {
    const { formState, setFormState, errors, handleInputChange, handleCheckboxChange } =
      useEventForm(initialEvent as unknown as Event);

    const { isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = useRef(null);

    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const headingColor = useColorModeValue('blue.600', 'blue.300');

    const handleSubmitClick = () => {
      if (initialEvent?.isRepeating) {
        onOpen();
      } else {
        handleFinalSubmit();
      }
    };

    const handleFinalSubmit = async () => {
      try {
        await onSubmit({
          ...formState,
          id: initialEvent?.id || Math.random().toString(36).substr(2, 9),
          repeat: {
            type: formState.repeatType as RepeatType,
            interval: formState.repeatInterval,
            endDate: formState.repeatEndDate,
            endCondition: formState.repeatEndCondition,
            count: formState.repeatCount,
          },
        });

        // 폼 초기화
        setFormState(getInitialFormState(null));
        setEditingEvent(null);
        onClose();
      } catch (error) {
        console.error('Failed to submit event:', error);
      }
    };

    const handleCancel = useCallback(() => {
      setFormState(getInitialFormState(null));
      setEditingEvent(null);
    }, [setEditingEvent]);

    useEffect(() => {
      if (!initialEvent) return;
      if (!formState.isRepeating) {
        setFormState((prev) => ({
          ...prev,
          repeatType: 'none',
          repeatInterval: 1,
          repeatEndDate: '',
          repeatEndCondition: 'never',
        }));
      }
    }, [initialEvent, formState.isRepeating, setFormState]);

    useEffect(() => {
      if (!formState.isRepeating) return;
      setFormState((prev) => ({
        ...prev,
        repeatDate: findRepeatDate(
          formState.date,
          formState.repeatEndDate,
          formState.repeatInterval.toString(),
          formState.repeatType
        ),
      }));
    }, [formState.date, formState.repeatEndDate, formState.repeatInterval, formState.isRepeating]);

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
        <HStack justify="space-between" align="center">
          <Heading size="lg" color={headingColor}>
            {initialEvent ? '일정 수정' : '일정 추가'}
          </Heading>
          {initialEvent?.isRepeating && (
            <Tooltip label="반복 일정">
              <RepeatIcon boxSize={6} />
            </Tooltip>
          )}
        </HStack>

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
                data-testid="repeat-type-button"
                name="repeatType"
                value={formState?.repeatType}
                onChange={handleInputChange}
                size="lg"
              >
                <option data-testid="repeat-type-option" value="daily">
                  매일
                </option>
                <option data-testid="repeat-type-option" value="weekly">
                  매주
                </option>
                <option data-testid="repeat-type-option" value="monthly">
                  매월
                </option>
                <option data-testid="repeat-type-option" value="yearly">
                  매년
                </option>
              </Select>
              {formState.repeatType === 'monthly' && (
                <RepeatDateMessage
                  date={formState.date}
                  repeatType={formState.repeatType as RepeatType}
                />
              )}
            </FormControl>

            <FormControl>
              <FormLabel fontWeight="medium">종료 조건</FormLabel>
              <Select
                name="repeatEndCondition"
                value={formState?.repeatEndCondition}
                onChange={handleInputChange}
                size="lg"
              >
                <option value="date">날짜</option>
                <option value="count">횟수</option>
                <option value="never">종료 없음</option>
              </Select>
            </FormControl>

            <HStack spacing={4} width="100%">
              <FormControl>
                <FormLabel fontWeight="medium">반복 간격</FormLabel>
                <HStack>
                  <Input
                    type="number"
                    min="1"
                    max="99"
                    inputMode="numeric"
                    name="repeatInterval"
                    value={formState.repeatInterval}
                    onChange={handleInputChange}
                    size="lg"
                  />
                  <Text>
                    {formState.repeatType === 'daily' && '일'}
                    {formState.repeatType === 'weekly' && '주'}
                    {formState.repeatType === 'monthly' && '월'}
                    {formState.repeatType === 'yearly' && '년'}
                  </Text>
                </HStack>
              </FormControl>

              {formState.repeatType !== 'none' && (
                <FormControl isRequired={formState.repeatEndCondition !== 'never'}>
                  <FormLabel fontWeight="medium">
                    {formState.repeatEndCondition === 'date'
                      ? '종료 날짜'
                      : formState.repeatEndCondition === 'count'
                        ? '반복 횟수'
                        : '종료 없음'}
                  </FormLabel>
                  {formState.repeatEndCondition === 'date' ? (
                    <Input
                      type="date"
                      name="repeatEndDate"
                      value={formState.repeatEndDate}
                      onChange={handleInputChange}
                      size="lg"
                      max="2025-06-30"
                    />
                  ) : formState.repeatEndCondition === 'count' ? (
                    <Input
                      type="number"
                      min="1"
                      max="99"
                      inputMode="numeric"
                      name="repeatCount"
                      onChange={handleInputChange}
                      size="lg"
                    />
                  ) : null}
                </FormControl>
              )}
            </HStack>
          </VStack>
        )}
        <FormControl>
          <FormLabel fontWeight="medium">알림 설정</FormLabel>
          <HStack
            style={{
              width: '100%',
            }}
          >
            <Input
              type="number"
              name="notificationTime"
              value={formState?.notificationTime.value}
              placeholder="숫자만 입력"
              inputMode="numeric"
              onChange={handleInputChange}
              size="md"
              min="0"
              style={{
                width: '50%',
              }}
            />
            <Text>분 전에 알람이 시작됩니다.</Text>
          </HStack>
        </FormControl>
        <AlertDialog isOpen={isOpen} onClose={onClose} leastDestructiveRef={cancelRef}>
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                반복 일정 수정
              </AlertDialogHeader>

              <AlertDialogBody>이 일정은 반복 일정입니다. 어떻게 처리하시겠습니까?</AlertDialogBody>
              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onClose}>
                  취소
                </Button>
                <Button
                  data-testid="edit-submit-button"
                  colorScheme="blue"
                  onClick={() => {
                    handleFinalSubmit();
                  }}
                  ml={3}
                >
                  수정
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
        <HStack
          style={{
            width: '100%',
          }}
        >
          <Button
            size="lg"
            colorScheme="gray"
            onClick={handleCancel}
            style={{
              width: '50%',
            }}
          >
            취소
          </Button>
          <Button
            data-testid="event-submit-button"
            size="lg"
            colorScheme="blue"
            onClick={handleSubmitClick}
            style={{
              width: '50%',
            }}
          >
            {initialEvent ? '수정' : '추가'}
          </Button>
        </HStack>
      </VStack>
    );
  }
);
