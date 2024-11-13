/*
  1. **(필수) 반복 유형 선택**
      - 일정 생성 또는 수정 시 반복 유형을 선택할 수 있다.
      - 반복 유형은 다음과 같다: 매일, 매주, 매월, 매년
          - 만약, 윤년 29일에 또는 31일에 매월 또는 매년 반복일정을 설정한다면 어떻게 처리할까요? 다른 서비스를 참고해보시고 자유롭게 작성해보세요.
  2. **(필수) 반복 간격 설정**
      - 각 반복 유형에 대해 간격을 설정할 수 있다.
      - 예: 2일마다, 3주마다, 2개월마다 등
  3. **(필수) 반복 일정 표시**
      - 캘린더 뷰에서 반복 일정을 시각적으로 구분하여 표시한다.
          - 아이콘을 넣든 태그를 넣든 자유롭게 해보세요!
  4. **(필수) 반복 종료**
      - 반복 종료 조건을 지정할 수 있다.
      - 옵션: 특정 날짜까지, 특정 횟수만큼, 또는 종료 없음 (예제 특성상, 2025-06-30까지)
  5. **(필수) 반복 일정 단일 수정**
      - 반복일정을 수정하면 단일 일정으로 변경됩니다.
      - 반복일정 아이콘도 사라집니다.
  6. **(필수)**  **반복 일정 단일 삭제**
      - 반복일정을 삭제하면 해당 일정만 삭제합니다.
**/

import { ChakraProvider } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactElement } from 'react';

import App from '../App';

const setup = (element: ReactElement) => {
  const user = userEvent.setup();

  return { ...render(<ChakraProvider>{element}</ChakraProvider>), user };
};

beforeEach(() => {});
describe('반복 유형 선택', () => {
  it('반복 일정 클릭 시 하위 메뉴가 출력된다.', async () => {
    const { user } = setup(<App />);

    // 01. 초기 체크 여부 확인
    // 쿼링의 세가지 방법 : getByRole, getByText, getByTestId
    const checkbox = screen.getByRole('checkbox', { name: 'repeat setting' });
    expect(checkbox).toBeChecked();

    // 02. 체크 -> 없는 거 확인
    await user.click(checkbox);
    // 반복 유형, 반복 간격, 반복 종료일 없는 지 테스트
    expect(checkbox).not.toBeChecked();
    expect(screen.queryByLabelText('반복 유형')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('반복 간격')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('반복 종료일')).not.toBeInTheDocument();

    // 03. 체크 -> 있는 거 확인
    await user.click(checkbox);
  });
  it('일정 생성 시 반복 유형을 선택할 수 있다.', async () => {
    const { user } = setup(<App />);
    // const isChecked = screen.getByRole('checkbox', { name: '반복 일정' }); // 얘가 체크상태인지 검사하고 싶어
    // await user.click(screen.getByRole('label', { name: '반복 설정' }));
  });
  it('일정 수정 시 반복 유형을 선택할 수 있다.', () => {});
  it('반복 유형은 다음과 같다: 매일, 매주, 매월, 매년', () => {});
  // - 만약, 윤년 29일에 또는 31일에 매월 또는 매년 반복일정을 설정한다면 어떻게 처리할까요? 다른 서비스를 참고해보시고 자유롭게 작성해보세요.
});

describe('반복 간격 설정', () => {
  // 예: 2일마다, 3주마다, 2개월마다 등
  it('각 반복 유형에 대해 간격을 설정할 수 있다.', () => {});
});

describe('반복 일정 표시', () => {
  // 아이콘을 넣든 태그를 넣든 자유롭게 해보세요!
  it('캘린더 뷰에서 반복 일정을 시각적으로 구분하여 표시한다.', () => {});
});

describe('반복 종료', () => {
  // 옵션: 특정 날짜까지, 특정 횟수만큼, 또는 종료 없음 (예제 특성상, 2025-06-30까지)
  it('반복 종료 조건을 지정할 수 있다.', () => {});
});

describe('반복 일정 단일 수정', () => {
  it('반복일정을 수정하면 단일 일정으로 변경됩니다.', () => {});
  it('반복일정 아이콘도 사라집니다.', () => {});
});

describe('반복 일정 단일 삭제', () => {
  it('반복일정을 삭제하면 해당 일정만 삭제합니다.', () => {});
});
