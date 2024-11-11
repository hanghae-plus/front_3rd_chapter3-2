import { Checkbox, FormControl, FormLabel, Heading, VStack } from '@chakra-ui/react';
import { Event, EventForm } from '@entities/event/model/types';
import { useEventFormStore } from '@features/event/model/stores';
import { AddOrUpdateButton, SelectScheduleField } from '@features/event/ui';
import { RepeatForm } from '@features/event/ui/RepeatForm';
import { InputField, SelectField } from '@shared/ui';
import { ChangeEvent } from 'react';

interface EventFormProps {
  events: Event[];
  saveEvent: (event: EventForm, isEditing: boolean) => Promise<void>;
}

const categories = ['업무', '개인', '가족', '기타'];

const notificationOptions = [
  { value: 1, label: '1분 전' },
  { value: 10, label: '10분 전' },
  { value: 60, label: '1시간 전' },
];

export const AddEventForm = ({ events, saveEvent }: EventFormProps) => {
  const {
    title,
    setTitle,
    date,
    setDate,
    description,
    setDescription,
    location,
    setLocation,
    category,
    setCategory,
    isRepeating,
    setIsRepeating,
    notificationTime,
    setNotificationTime,
    editingEvent,
  } = useEventFormStore();

  return (
    <VStack w="400px" spacing={5} align="stretch">
      <Heading>{editingEvent ? '일정 수정' : '일정 추가'}</Heading>

      <InputField label="제목" value={title} onChange={setTitle} />

      <InputField label="날짜" value={date} onChange={setDate} />

      <SelectScheduleField />

      <InputField label="설명" value={description} onChange={setDescription} />

      <InputField label="위치" value={location} onChange={setLocation} />

      <SelectField
        label="카테고리"
        value={category}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value)}
      >
        <option value="">카테고리 선택</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </SelectField>

      <FormControl>
        <FormLabel>반복 설정</FormLabel>
        <Checkbox isChecked={isRepeating} onChange={(e) => setIsRepeating(e.target.checked)}>
          반복 일정
        </Checkbox>
      </FormControl>

      <SelectField
        label="알림 설정"
        value={notificationTime}
        onChange={(e: ChangeEvent<HTMLSelectElement>) =>
          setNotificationTime(Number(e.target.value))
        }
      >
        {notificationOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </SelectField>

      <RepeatForm />

      <AddOrUpdateButton events={events} saveEvent={saveEvent} />
    </VStack>
  );
};
