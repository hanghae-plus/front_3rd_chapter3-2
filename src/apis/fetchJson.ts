export type RequestInit = {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
};

export const fetchJson = async (
  url: string,
  requestInit?: Omit<RequestInit, 'body'> & { body?: Record<string, any> }
) => {
  try {
    const response = await fetch(url, {
      headers: {
        ...requestInit?.headers,
        'Content-Type': 'application/json',
      },
      ...{ body: JSON.stringify(requestInit?.body) },
      method: requestInit?.method,
    });

    const { ok } = response;
    if (requestInit?.method === 'DELETE') return { ok, data: null };

    if (ok) return { ok: true, data: await response.json() };

    const errorData = await response.json();
    return { ok: false, data: new Error(errorData.message || 'Request failed') };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { ok: false, data: new Error(message) };
  }
};
