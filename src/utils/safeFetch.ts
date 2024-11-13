const DEFAULT_HEADERS = { 'Content-Type': 'application/json' };

type FetchProps = Parameters<typeof fetch>;

/**
 * type safe하게 fetch 요청을 보내는 함수.
 */
export const safeFetch = async <T>(input: FetchProps[0], init?: FetchProps[1]): Promise<T> => {
  const response = await fetch(input, init);

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return (await response.json()) as T;
};

/** fetch 요청을 위한 옵션을 생성하는 함수.*/
const createOptions = (
  method: string,
  body?: Record<string, unknown> | null,
  init?: FetchProps[1]
): FetchProps[1] => {
  const options: FetchProps[1] = {
    method,
    ...init,
    headers: {
      ...DEFAULT_HEADERS,
      ...(init?.headers || {}),
    },
  };

  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }

  return options;
};

safeFetch.post = async <T>(
  input: FetchProps[0],
  body?: Record<string, unknown> | null,
  init?: FetchProps[1]
): Promise<T> => {
  const options = createOptions('POST', body, init);
  return safeFetch<T>(input, options);
};

safeFetch.put = async <T>(
  input: FetchProps[0],
  body?: Record<string, unknown> | null,
  init?: FetchProps[1]
): Promise<T> => {
  const options = createOptions('PUT', body, init);
  return safeFetch<T>(input, options);
};

safeFetch.patch = async <T>(
  input: FetchProps[0],
  body?: Record<string, unknown> | null,
  init?: FetchProps[1]
): Promise<T> => {
  const options = createOptions('PATCH', body, init);
  return safeFetch<T>(input, options);
};

safeFetch.delete = async <T>(input: FetchProps[0], init?: FetchProps[1]): Promise<T> => {
  const options = createOptions('DELETE', undefined, init);
  return safeFetch<T>(input, options);
};
