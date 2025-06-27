export type DirectoryEntry = {
  name: string;
  type: 'file' | 'dir';
  size: number;
  contents?: DirectoryEntry[];
};
