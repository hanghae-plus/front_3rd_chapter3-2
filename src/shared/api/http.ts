const BASE_URL = 'http://localhost:5173';

interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  data?: any;
}

export const fetchClient = async <T>(
  endpoint: string,
  options: RequestOptions = { method: 'GET' }
): Promise<T> => {
  const { method, data, headers = {} } = options;

  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...(data && { body: JSON.stringify(data) }),
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.status === 204 ? null : response.json();
};

export const http = {
  get: <T>(endpoint: string) => fetchClient<T>(endpoint),

  post: <T>(endpoint: string, data: any) => fetchClient<T>(endpoint, { method: 'POST', data }),

  put: <T>(endpoint: string, data: any) => fetchClient<T>(endpoint, { method: 'PUT', data }),

  delete: <T>(endpoint: string, data?: any) => fetchClient<T>(endpoint, { method: 'DELETE', data }),
};
