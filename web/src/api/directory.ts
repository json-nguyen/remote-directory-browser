import { apiClient } from '@/api/client';
import { DirectoryEntry } from '@/types/directory';

export const getDirectory = async (path: string): Promise<DirectoryEntry> => {
  return apiClient(`/api/dir/${encodeURIComponent(path)}`, {
    method: 'GET',
  });
};
