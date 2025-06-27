import '@/context/AuthContext';

// Normally I would implement a full class client to handle the api, but for this project
// this file will only contain a simple wrapper around fetch and a custom APIError Class.
export class APIError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.message = message;
    this.status = status;
    Object.setPrototypeOf(this, APIError.prototype);
  }
}

export async function apiClient<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(path, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    let error: unknown;

    try {
      error = await response.json();
    } catch {
      throw new APIError('An error occurred', response.status);
    }

    if (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      typeof error.message === 'string'
    ) {
      throw new APIError(
        (error as { message: string }).message,
        response.status
      );
    }

    throw new APIError('An error occurred', response.status);
  }

  try {
    const result: unknown = await response.json();
    if (result && typeof result === 'object' && 'data' in result) {
      return result.data as T;
    }
    throw new APIError('An error occurred', response.status);
  } catch {
    throw new APIError('Failed to parse response', response.status);
  }
}
