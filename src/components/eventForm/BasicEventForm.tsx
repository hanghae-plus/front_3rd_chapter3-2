import { VStack, FormControl, FormLabel, Input, Select, HStack } from '@chakra-ui/react';

import { useEventForm } from '../../hooks/useEventForm';
import { CATEGORIES } from '../../shared/constants';

export function BasicEventForm() {
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
    startTimeError,
    endTimeError,
    handleStartTimeChange,
    handleEndTimeChange,
  } = useEventForm();

  return (
    <VStack spacing={4} width="100%">
      <FormControl>
        <FormLabel>제목</FormLabel>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </FormControl>

      <FormControl>
        <FormLabel>날짜</FormLabel>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </FormControl>

      <HStack width="100%">
        <FormControl isInvalid={Boolean(startTimeError)}>
          <FormLabel>시작 시간</FormLabel>
          <Input type="time" value={startTime} onChange={handleStartTimeChange} />
        </FormControl>

        <FormControl isInvalid={Boolean(endTimeError)}>
          <FormLabel>종료 시간</FormLabel>
          <Input type="time" value={endTime} onChange={handleEndTimeChange} />
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
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </Select>
      </FormControl>
    </VStack>
  );
}
