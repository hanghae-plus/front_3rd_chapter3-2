/* eslint-disable react-hooks/rules-of-hooks */
import { RepeatIcon } from '@chakra-ui/icons';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertIcon,
  Button,
  Checkbox,
  Heading,
  Icon,
  Text,
  Tooltip,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react';
import { Dispatch, memo, SetStateAction, useEffect, useRef, useState } from 'react';

import { Event } from '../../../entities/event/model/types';
import { categories } from '../../../shared/config/constant';
import { FormControl, FormLabel } from '../../../shared/ui/FormControl';
import Input from '../../../shared/ui/Input';
import { Select } from '../../../shared/ui/Select';
import { HStack, VStack } from '../../../shared/ui/Stack';
import { useEventForm } from '../hooks/useEventForm';

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
    const [modificationType, setModificationType] = useState<'all' | 'single'>('single');
    const cancelRef = useRef(null);

    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const headingColor = useColorModeValue('blue.600', 'blue.300');

    // 윤년/말일 처리를 위한 헬퍼 함수
    const handleRepeatDateLogic = () => {
      if (!formState.date || !formState.repeatType) return;

      const eventDate = new Date(formState.date);
      const day = eventDate.getDate();
      const month = eventDate.getMonth();

      if (day === 31 || (day === 29 && month === 1)) {
        return (
          <Text color="orange.500" fontSize="sm" mt={1}>
            <Icon as={AlertIcon} mr={1} />
            {day === 31 ? '매월 말일에 반복됩니다.' : '윤년이 아닌 경우 2월 28일에 반복됩니다.'}
          </Text>
        );
      }
      return null;
    };

    const handleSubmitClick = () => {
      if (initialEvent?.isRepeating) {
        onOpen();
      } else {
        handleFinalSubmit();
      }
    };

    const handleFinalSubmit = () => {
      onSubmit({
        ...formState,
        id: initialEvent?.id || '',
        repeat: {
          type: formState.repeatType,
          interval: formState.repeatInterval,
          endDate: formState.repeatEndDate,
        },
      });
      onClose();
    };

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

    console.log(formState);
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
              {handleRepeatDateLogic()}
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
                <FormControl>
                  <FormLabel fontWeight="medium">
                    {formState.repeatEndCondition === 'date' ? '종료 날짜' : '반복 횟수'}
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
                  ) : (
                    <Input
                      type="number"
                      min="1"
                      max="99"
                      inputMode="numeric"
                      name="repeatCount"
                      onChange={handleInputChange}
                      size="lg"
                    />
                  )}
                </FormControl>
              )}
            </HStack>
          </VStack>
        )}

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
                  colorScheme="blue"
                  onClick={() => {
                    setModificationType('single');
                    handleFinalSubmit();
                  }}
                  ml={3}
                >
                  이 일정만
                </Button>
                <Button
                  colorScheme="blue"
                  onClick={() => {
                    setModificationType('all');
                    handleFinalSubmit();
                  }}
                  ml={3}
                >
                  모든 반복 일정
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
            onClick={() => {
              setEditingEvent(null);
            }}
            style={{
              width: '50%',
            }}
          >
            취소
          </Button>
          <Button
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
