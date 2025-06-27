import { apiClient } from '@/api/client';

type LoginResponse = {
  username: string;
};

export const login = async (
  username: string,
  password: string
): Promise<LoginResponse> => {
  return apiClient('/api/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
};

export const logout = async () => {
  return apiClient('/api/logout', {
    method: 'POST',
  });
};

export const validateSession = async () => {
  return apiClient('/api/validate-session', {
    method: 'GET',
  });
};
