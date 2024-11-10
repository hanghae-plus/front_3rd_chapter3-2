import { UseToastOptions } from '@chakra-ui/react';
import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';

// 공통 함수: QueryClient 생성
export const createTestQueryClient = (toast: (options: UseToastOptions) => void) => {
  const errorHandler = (error: unknown) => {
    const message = error instanceof Error ? error.message : '요청 처리 중 알 수 없는 오류 발생';
    toast({
      title: message,
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  };

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: 0 } },
    queryCache: new QueryCache({ onError: errorHandler }),
    mutationCache: new MutationCache({
      onError: errorHandler,
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ['events'] });
      },
    }),
  });

  return queryClient;
};
