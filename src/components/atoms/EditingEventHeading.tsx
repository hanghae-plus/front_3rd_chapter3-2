import { Heading } from '@chakra-ui/react';
import useScheduleForm from '@stores/useScheduleForm';

export const EditingEventHeading = () => {
  const isEditing = useScheduleForm((state) => state.isEditing);
  return <Heading>{isEditing ? '일정 수정' : '일정 추가'}</Heading>;
};
