import { describe, it, expect } from 'vitest';
import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within, act } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
// import { http, HttpResponse } from 'msw';
import { ReactElement } from 'react';
import App from '../App.tsx'

const setup = (element: ReactElement) => {
    const user = userEvent.setup();
    return { ...render(<ChakraProvider>{element}</ChakraProvider>), user };
  };

const { user } = setup(<App />);

await user.click(screen.getByTestId('event-submit-button'));

describe('반복 유형 선택 기능', () => {
    it('일정 생성 시 반복 유형을 선택할 수 있다', async () => {
        const { user } = setup(<App />);
  
        // 새 일정 추가 버튼 클릭
        await user.click(screen.getByText('반복 일정'));
  
        // 새로 추가된 일정이 목록에 표시되는지 확인
        const repeatSelect = screen.getByLabelText('반복 유형');
        expect(repeatSelect).toBeInTheDocument();
    }); 
  });
  