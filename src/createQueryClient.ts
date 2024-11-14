import { CreateToastFnReturn } from '@chakra-ui/react';
import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';

export function createQueryClient(toast: CreateToastFnReturn) {
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
    queryCache: new QueryCache({
      onError: errorHandler,
    }),
    mutationCache: new MutationCache({
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ['events'] });
      },
    }),
  });

  return queryClient;
}
